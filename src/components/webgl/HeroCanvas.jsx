import React, { useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const fragmentShader = `
// Fragment shader — faceted brand gradient
varying vec3 vColor;
varying float vFold;
uniform vec2 uResolution;

void main() {
  vec3 color = vColor + vFold * vec3(0.15, 0.08, 0.0);

  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 centeredUv = uv - 0.5;
  centeredUv.x *= uResolution.x / uResolution.y;
  float vignette = smoothstep(0.0, 0.65, length(centeredUv));
  vec3 dark = vec3(0.129);
  vec3 finalColor = mix(color, dark, vignette * 0.55);

  gl_FragColor = vec4(finalColor, 0.50 + vFold * 0.14);
}
`;

const vertexShader = `
uniform float uTime;
uniform vec2 uMouse;        // normalized 0-1
uniform vec2 uResolution;
uniform float uScrollProgress;  // 0-1

attribute float aPhase;     // per-vertex random phase offset
attribute vec3 aColor;      // per-vertex brand color
varying vec3 vColor;
varying float vFold;

void main() {
  vColor = aColor;
  vec3 pos = position;

  // Gentle per-vertex breathing (slow fold oscillation)
  float breathe = sin(uTime * 0.4 + aPhase) * 0.018;
  pos.z += breathe;

  vec2 uv = (pos.xy + vec2(1.0)) * 0.5;
  vec2 aspectMouse = uMouse;
  aspectMouse.x *= uResolution.x / uResolution.y;
  vec2 aspectUv = uv;
  aspectUv.x *= uResolution.x / uResolution.y;

  float dist = distance(aspectUv, aspectMouse);
  float wave = smoothstep(0.35, 0.0, dist) * 0.14;
  pos.z += wave * (1.0 - uScrollProgress);

  vFold = wave;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

function buildOrigamiGeometry(cols, rows) {
    const positions = [];
    const colors = [];
    const phases = [];

    const palette = [
        [1.0, 0.647, 0.18],   // gold   #FFA52E
        [1.0, 0.541, 0.11],   // mid    #FF8A1C
        [1.0, 0.416, 0.0],    // orange #FF6A00
        [1.0, 0.333, 0.08],   // deep   interpolated
        [0.949, 0.102, 0.102] // red    #F21A1A
    ];

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const x0 = (c / cols) * 2 - 1;
            const x1 = ((c + 1) / cols) * 2 - 1;
            const y0 = (r / rows) * 2 - 1;
            const y1 = ((r + 1) / rows) * 2 - 1;

            const t = ((c / cols) + (r / rows)) / 2;
            const pi = Math.min(Math.floor(t * (palette.length - 1)), palette.length - 2);
            const pf = t * (palette.length - 1) - pi;
            const col = palette[pi].map((v, i) => v + (palette[pi + 1][i] - v) * pf);

            const jitter = () => col.map(v => Math.max(0, Math.min(1, v + (Math.random() - 0.5) * 0.08)));
            const faceCol = jitter();
            const phase = Math.random() * Math.PI * 2;

            // Triangle 1
            positions.push(x0, y0, 0, x1, y0, 0, x0, y1, 0);
            for (let i = 0; i < 3; i++) { colors.push(...faceCol); phases.push(phase); }

            // Triangle 2
            positions.push(x1, y0, 0, x1, y1, 0, x0, y1, 0);
            for (let i = 0; i < 3; i++) { colors.push(...faceCol); phases.push(phase); }
        }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(colors), 3));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(new Float32Array(phases), 1));
    return geo;
}

export default function HeroCanvas() {
    useEffect(() => {
        if (window.innerWidth < 1024) return;
        const container = document.querySelector('[data-canvas="hero"]');
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        camera.position.z = 1;

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: false,
            powerPreference: 'high-performance'
        });
        container.appendChild(renderer.domElement);

        const geometry = buildOrigamiGeometry(24, 16);
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
            depthWrite: false,
            side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const setSize = () => {
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            material.uniforms.uResolution.value.set(renderer.domElement.width, renderer.domElement.height);
        };
        setSize();
        window.addEventListener('resize', setSize);

        const heroSection = document.getElementById('hero');
        renderer.domElement.style.transition = 'none';

        let isVisible = true;
        const st = ScrollTrigger.create({
            trigger: heroSection,
            start: 'top top',
            end: 'bottom top',
            onUpdate: (self) => {
                renderer.domElement.style.opacity = 1 - self.progress;
                material.uniforms.uScrollProgress.value = self.progress;
                isVisible = self.progress < 1;
            }
        });

        const mouse = { x: 0.5, y: 0.5 };
        const targetMouse = { x: 0.5, y: 0.5 };
        const onMouseMove = (e) => {
            targetMouse.x = e.clientX / window.innerWidth;
            targetMouse.y = 1.0 - (e.clientY / window.innerHeight);
        };
        window.addEventListener('mousemove', onMouseMove);

        let rafId;
        const clock = new THREE.Clock();

        const render = () => {
            rafId = requestAnimationFrame(render);
            if (!isVisible) return;

            const delta = clock.getDelta();
            material.uniforms.uTime.value += delta;

            mouse.x += (targetMouse.x - mouse.x) * 0.05;
            mouse.y += (targetMouse.y - mouse.y) * 0.05;
            material.uniforms.uMouse.value.set(mouse.x, mouse.y);

            renderer.render(scene, camera);
        };
        render();

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', setSize);
            cancelAnimationFrame(rafId);
            if (st) st.kill();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, []);

    return null;
}
