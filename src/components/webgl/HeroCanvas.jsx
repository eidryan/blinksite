import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const fragmentShader = `
// Simplex 2D noise
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

uniform float uTime;
uniform vec2 uMouse;       // normalized 0-1
uniform vec2 uResolution;
uniform float uScrollProgress; // 0-1 through hero

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    
    // Brand colors
    vec3 gold   = vec3(1.0, 0.647, 0.18);   // #FFA52E
    vec3 orange = vec3(1.0, 0.416, 0.0);    // #FF6A00
    vec3 red    = vec3(0.949, 0.102, 0.102); // #F21A1A
    
    // Noise-driven color mixing
    float n1 = snoise(uv * 3.0 + uTime * 0.08);
    float n2 = snoise(uv * 5.0 - uTime * 0.12 + 100.0);
    
    vec3 color = mix(gold, orange, smoothstep(-0.3, 0.3, n1));
    color = mix(color, red, smoothstep(-0.2, 0.4, n2));
    
    // Mouse proximity: subtle brighten near cursor
    // Correcting aspect ratio for distance formula to prevent stretching
    vec2 aspectCorrectedUv = uv;
    aspectCorrectedUv.x *= uResolution.x / uResolution.y;
    vec2 aspectCorrectedMouse = uMouse;
    aspectCorrectedMouse.x *= uResolution.x / uResolution.y;
    
    float mouseDist = distance(aspectCorrectedUv, aspectCorrectedMouse);
    float mouseInfluence = smoothstep(0.4, 0.0, mouseDist);
    color += mouseInfluence * 0.12;
    
    // Heavy vignette to blend into #212121
    // Keep vignette proportional to screen bounds
    vec2 centeredUv = uv - 0.5;
    centeredUv.x *= uResolution.x / uResolution.y;
    float vignette = smoothstep(0.0, 0.7, length(centeredUv));
    vec3 dark = vec3(0.129); // #212121
    color = mix(color, dark, vignette * 0.85);
    
    // Low opacity — atmosphere
    gl_FragColor = vec4(color, 0.20 + mouseInfluence * 0.08);
}
`;

const vertexShader = `
uniform float uTime;
varying vec2 vUv;

void main() {
    vUv = uv;
    vec3 pos = position;
    // Gentle sine displacement
    pos.z += sin(pos.x * 2.0 + uTime) * 0.02;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export default function HeroCanvas() {
    const mountRef = useRef(null);

    useEffect(() => {
        // Mobile fallback: No WebGL entirely
        if (window.innerWidth < 1024) return;

        // Wait for the DOM mount point that Prompt 1 created
        const container = document.querySelector('[data-canvas="hero"]');
        if (!container) return;

        // Setup
        const scene = new THREE.Scene();
        // Using an Orthographic camera because we are just mapping a 2D plane perfectly to screen
        const camera = new THREE.OrthographicCamera(
            -1, 1, 1, -1, 0.1, 10
        );
        camera.position.z = 1;

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: false, // Not strictly needed for a blurred shader plane
            powerPreference: 'high-performance'
        });

        const setSize = () => {
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio
            if (material) {
                material.uniforms.uResolution.value.set(
                    renderer.domElement.width,
                    renderer.domElement.height
                );
            }
        };

        container.appendChild(renderer.domElement);

        // Geometry + Material
        const geometry = new THREE.PlaneGeometry(2, 2, 8, 8); // Subdivided slightly for vertex displacement
        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uMouse: { value: new THREE.Vector2(0.5, 0.5) },
                uResolution: { value: new THREE.Vector2(1, 1) },
                uScrollProgress: { value: 0 }
            },
            transparent: true,
            depthWrite: false
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        setSize();

        // Mouse Tracking
        const mouse = { x: 0.5, y: 0.5 };
        const targetMouse = { x: 0.5, y: 0.5 };

        const onMouseMove = (e) => {
            // normalized Y is inverted in webgl coordinate space
            targetMouse.x = e.clientX / window.innerWidth;
            targetMouse.y = 1.0 - (e.clientY / window.innerHeight);
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('resize', setSize);

        // Render loop hooked to RAF
        let rafId;
        const clock = new THREE.Clock();

        // Optimization: intersection observer to pause rendering
        let isVisible = true;
        const observer = new IntersectionObserver((entries) => {
            isVisible = entries[0].isIntersecting;
        });
        observer.observe(container);

        const render = () => {
            rafId = requestAnimationFrame(render);
            if (!isVisible) return;

            const delta = clock.getDelta();
            material.uniforms.uTime.value += delta;

            // Lerp mouse for smoother shader reaction
            mouse.x += (targetMouse.x - mouse.x) * 0.05;
            mouse.y += (targetMouse.y - mouse.y) * 0.05;
            material.uniforms.uMouse.value.set(mouse.x, mouse.y);

            renderer.render(scene, camera);
        };
        render();

        // Cleanup
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', setSize);
            cancelAnimationFrame(rafId);
            observer.disconnect();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, []);

    return null; // Side-effect component mounting to external DOM node
}
