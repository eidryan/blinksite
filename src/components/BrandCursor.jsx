import React, { useEffect } from 'react';
import gsap from 'gsap';

export default function BrandCursor() {
    useEffect(() => {
        // Disable custom cursor on touch devices or small screens
        if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1024) {
            document.body.style.cursor = 'auto';
            return;
        }

        document.body.style.cursor = 'none';

        // 1. Create Cursor Elements
        const ring = document.createElement('div');
        const dot = document.createElement('div');
        const label = document.createElement('div');

        // Particle System Setup
        const maxParticles = 30;
        const particles = [];
        for (let i = 0; i < maxParticles; i++) {
            const p = document.createElement('div');
            Object.assign(p.style, {
                position: 'fixed',
                top: 0, left: 0,
                width: i % 3 === 0 ? '6px' : '3px',
                height: i % 3 === 0 ? '6px' : '3px',
                background: i % 2 === 0 ? '#FF6A00' : '#F21A1A',
                borderRadius: '0', // Tiny geometric shards
                pointerEvents: 'none',
                zIndex: 9998,
                opacity: 0,
                transform: 'translate(-50%, -50%)',
                mixBlendMode: 'screen',
            });
            document.body.appendChild(p);
            particles.push({ el: p });
        }
        let pIndex = 0;

        // Base Ring Styles
        Object.assign(ring.style, {
            position: 'fixed',
            top: 0, left: 0,
            width: '40px', height: '40px',
            borderRadius: '50%',
            border: '1px solid rgba(255, 106, 0, 0.5)',
            pointerEvents: 'none',
            zIndex: 9999,
            mixBlendMode: 'difference',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease, border-radius 0.3s ease',
        });

        // Base Dot Styles (The Crosshair Scalpel)
        Object.assign(dot.style, {
            position: 'fixed',
            top: 0, left: 0,
            width: '16px', height: '16px',
            pointerEvents: 'none',
            zIndex: 10000,
            mixBlendMode: 'difference',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '18px',
            color: '#FF6A00',
            fontWeight: '300',
            transition: 'opacity 0.2s ease, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        });
        dot.textContent = '+';

        Object.assign(label.style, {
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '0.625rem',
            textTransform: 'uppercase',
            color: '#FDFAF4',
            opacity: 0,
            transition: 'opacity 0.2s ease, transform 0.3s ease',
            whiteSpace: 'nowrap',
        });

        ring.appendChild(label);
        document.body.appendChild(ring);
        document.body.appendChild(dot);

        // State & Interpolation
        const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const ringPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const dotPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        let lastMouse = { x: mouse.x, y: mouse.y };
        
        let ringRotation = 0;
        let ringScale = 1;
        let rafId = null;

        const lerp = (a, b, t) => a + (b - a) * t;

        // Render Loop
        const render = () => {
            ringPos.x = lerp(ringPos.x, mouse.x, 0.08);
            ringPos.y = lerp(ringPos.y, mouse.y, 0.08);
            dotPos.x = lerp(dotPos.x, mouse.x, 0.15);
            dotPos.y = lerp(dotPos.y, mouse.y, 0.15);

            ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(${ringScale}) rotate(${ringRotation}deg)`;
            dot.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0) translate(-50%, -50%) scale(${dot.dataset.scale || 1})`;

            rafId = requestAnimationFrame(render);
        };
        rafId = requestAnimationFrame(render);

        // Interaction Listeners
        const onMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;

            // Particle Trail Logic
            const dx = mouse.x - lastMouse.x;
            const dy = mouse.y - lastMouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 10) { // Speed threshold to spawn
                const p = particles[pIndex];
                p.el.style.transition = 'none';
                p.el.style.opacity = 0.8;
                p.el.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%) scale(1) rotate(${Math.random()*90}deg)`;
                
                void p.el.offsetWidth; // Reflow
                
                p.el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                p.el.style.opacity = 0;
                
                // Scatter backwards
                const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 1.5;
                const drift = 30 + Math.random() * 50;
                p.el.style.transform = `translate3d(${mouse.x - Math.cos(angle)*drift}px, ${mouse.y - Math.sin(angle)*drift}px, 0) translate(-50%, -50%) scale(0) rotate(${Math.random()*180}deg)`;
                
                pIndex = (pIndex + 1) % maxParticles;
                lastMouse.x = mouse.x;
                lastMouse.y = mouse.y;
            } else if (dist > 0) {
                lastMouse.x = mouse.x;
                lastMouse.y = mouse.y;
            }
        };

        const onMouseDown = () => {
            ringScale = 0.85;
            dot.dataset.scale = 0.85;
        };

        const onMouseUp = () => {
            ringScale = 1;
            dot.dataset.scale = 1;
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);

        // Hover State Hack
        const applyHoverHacks = () => {
            document.querySelectorAll('[data-cursor]').forEach(el => {
                if (el.dataset.cursorBound) return;
                el.dataset.cursorBound = "true";

                el.addEventListener('mouseenter', () => {
                    const type = el.getAttribute('data-cursor');
                    
                    // Base morphs
                    dot.style.opacity = '0';
                    label.style.opacity = '1';

                    if (type === 'link') {
                        ring.style.width = '60px';
                        ring.style.height = '60px';
                        ring.style.background = 'rgba(255, 106, 0, 0.15)';
                        ring.style.borderRadius = '0'; // The Diamond Morph
                        ringRotation = 45;
                        label.textContent = 'Ver';
                        label.style.transform = 'rotate(-45deg)'; // Keep text straight
                    }
                    else if (type === 'action') {
                        ring.style.width = '70px';
                        ring.style.height = '70px';
                        ring.style.background = 'rgba(255,106,0,0.2)';
                        ring.style.borderRadius = '50%';
                        ringRotation = 0;
                        label.textContent = 'Abrir';
                        label.style.transform = 'rotate(0deg)';
                    }
                    else if (type === 'image') {
                        ring.style.width = '80px';
                        ring.style.height = '48px';
                        ring.style.background = 'rgba(255, 106, 0, 0.15)';
                        ring.style.borderRadius = '24px';
                        ringRotation = 0;
                        label.textContent = 'Explorar';
                        label.style.transform = 'rotate(0deg)';
                    }
                });

                el.addEventListener('mouseleave', () => {
                    ring.style.width = '40px';
                    ring.style.height = '40px';
                    ring.style.background = 'transparent';
                    ring.style.borderRadius = '50%';
                    ringRotation = 0;
                    dot.style.opacity = '1';
                    label.style.opacity = '0';
                    label.style.transform = 'rotate(0deg)';
                });
            });
        };

        applyHoverHacks();

        const observer = new MutationObserver((mutations) => {
            if (mutations.some(m => m.addedNodes.length)) applyHoverHacks();
        });
        observer.observe(document.body, { childList: true, subtree: true });

        // Cleanup
        return () => {
            document.body.style.cursor = 'auto';
            cancelAnimationFrame(rafId);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            observer.disconnect();
            ring.remove();
            dot.remove();
            particles.forEach(p => p.el.remove());
        };
    }, []);

    return null;
}
