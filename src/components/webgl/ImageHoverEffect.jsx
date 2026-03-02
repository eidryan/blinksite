import React, { useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

const fragmentShader = `
uniform sampler2D uTexture;
uniform float uChromatic;
uniform float uWave;
uniform float uBrightness;
uniform float uTime;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    
    // Add wave distortion based on time
    vec2 waveUv = uv + uWave * sin(uv.y * 20.0 + uTime * 2.0);
    
    // Chromatic aberration sampling
    float r = texture2D(uTexture, waveUv + vec2(uChromatic * 0.001, 0.0)).r;
    float g = texture2D(uTexture, waveUv).g;
    float b = texture2D(uTexture, waveUv - vec2(uChromatic * 0.001, 0.0)).b;
    
    vec3 color = vec3(r, g, b) * uBrightness;
    
    gl_FragColor = vec4(color, 1.0);
}
`;

const vertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export default function ImageHoverEffect() {

    useEffect(() => {
        // Mobile fallback: No WebGL entirely
        if (window.innerWidth < 1024) return;

        const wrappers = document.querySelectorAll('.image-canvas-wrapper');
        const instances = [];

        wrappers.forEach(wrapper => {
            const img = wrapper.querySelector('img');
            if (!img) return;

            // Hide real image natively, but keep it in DOM to maintain layout bounds
            img.style.opacity = '0';
            wrapper.style.position = 'relative';

            // Three.js setup
            const canvas = document.createElement('canvas');
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.pointerEvents = 'none';
            canvas.style.borderRadius = getComputedStyle(img).borderRadius || '4px';
            wrapper.appendChild(canvas);

            const scene = new THREE.Scene();
            const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
            camera.position.z = 1;

            const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });

            const textureLoader = new THREE.TextureLoader();
            const texture = textureLoader.load(img.src, () => {
                // Trigger render once loaded
                render();
            });

            // Cover exact image bounds
            const updateSize = () => {
                const { width, height } = wrapper.getBoundingClientRect();
                renderer.setSize(width, height);
                // Compute "cover" aspect ratio logic inside plane scale if necessary,
                // but OrthographicCamera + PlaneGeometry(1,1) maps 0-1 UV natively.
                // We just scale the plane relative to image vs container aspect to simulate object-fit: cover

                const imgAspect = img.naturalWidth / img.naturalHeight || 1;
                const contAspect = width / height;

                let scaleX = 1, scaleY = 1;
                if (imgAspect > contAspect) {
                    scaleX = imgAspect / contAspect;
                } else {
                    scaleY = contAspect / imgAspect;
                }

                mesh.scale.set(scaleX, scaleY, 1);
            };

            const geometry = new THREE.PlaneGeometry(1, 1);
            const material = new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms: {
                    uTexture: { value: texture },
                    uChromatic: { value: 0 },
                    uWave: { value: 0 },
                    uBrightness: { value: 1.0 },
                    uTime: { value: 0 }
                }
            });

            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);

            updateSize();
            window.addEventListener('resize', updateSize);

            let rafId;
            const clock = new THREE.Clock();

            let isHovered = false;
            let isVisible = false;

            const observer = new IntersectionObserver((entries) => {
                isVisible = entries[0].isIntersecting;
                if (isVisible) render(); // Kick off render loop if visible
            });
            observer.observe(wrapper);

            const render = () => {
                if (!isVisible && !isHovered) {
                    // Optimization: Pause rendering if neither visible nor animated
                    return;
                }

                material.uniforms.uTime.value += clock.getDelta();
                renderer.render(scene, camera);

                // Only loop if we have active animations or mouse is over it
                if (isHovered || material.uniforms.uChromatic.value > 0.01) {
                    rafId = requestAnimationFrame(render);
                }
            };

            // Hover Interactions via GSAP proxying the uniforms
            const uniformProxy = {
                chromatic: 0,
                wave: 0,
                brightness: 1.0
            };

            wrapper.addEventListener('mouseenter', () => {
                isHovered = true;
                render(); // ensure loop is running

                gsap.to(uniformProxy, {
                    chromatic: 3,
                    wave: 0.008,
                    brightness: 1.06,
                    duration: 0.3,
                    ease: 'power2.out',
                    onUpdate: () => {
                        material.uniforms.uChromatic.value = uniformProxy.chromatic;
                        material.uniforms.uWave.value = uniformProxy.wave;
                        material.uniforms.uBrightness.value = uniformProxy.brightness;
                    }
                });
            });

            wrapper.addEventListener('mouseleave', () => {
                isHovered = false;
                gsap.to(uniformProxy, {
                    chromatic: 0,
                    wave: 0,
                    brightness: 1.0,
                    duration: 0.5,
                    ease: 'power2.out',
                    onUpdate: () => {
                        material.uniforms.uChromatic.value = uniformProxy.chromatic;
                        material.uniforms.uWave.value = uniformProxy.wave;
                        material.uniforms.uBrightness.value = uniformProxy.brightness;
                    }
                });
            });

            // Special hook for Fundadores photo flight spike
            wrapper.addEventListener('spikeshader', () => {
                isHovered = true;
                render();
                gsap.to(material.uniforms.uChromatic, {
                    value: 6,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1,
                    onComplete: () => { isHovered = false; }
                });
            });

            instances.push({
                cleanup: () => {
                    observer.disconnect();
                    window.removeEventListener('resize', updateSize);
                    cancelAnimationFrame(rafId);
                    if (wrapper.contains(canvas)) wrapper.removeChild(canvas);
                    geometry.dispose();
                    material.dispose();
                    texture.dispose();
                    renderer.dispose();
                    img.style.opacity = '1';
                }
            });
        });

        return () => {
            instances.forEach(p => p.cleanup());
        };
    }, []);

    return null;
}
