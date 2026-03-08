import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function BrandCursor() {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1024) {
            document.body.style.cursor = 'auto';
            return;
        }

        document.body.style.cursor = 'none';

        // HTML Elements
        const ring = document.createElement('div');
        const dot = document.createElement('div');
        const label = document.createElement('div');

        // Canvas for Trail
        const canvas = document.createElement('canvas');
        canvasRef.current = canvas;
        Object.assign(canvas.style, {
            position: 'fixed',
            top: 0, left: 0,
            width: '100vw', height: '100vh',
            pointerEvents: 'none',
            zIndex: 9998,
            mixBlendMode: 'screen',
        });
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        window.addEventListener('resize', () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        });

        // DOM Styles
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
            fontSize: '20px',
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

        // State
        const mouse = { x: width / 2, y: height / 2 };
        const ringPos = { x: width / 2, y: height / 2 };
        const dotPos = { x: width / 2, y: height / 2 };
        let lastMouse = { x: mouse.x, y: mouse.y };
        
        let ringRotation = 0;
        let ringScale = 1;
        let rafId = null;

        const lerp = (a, b, t) => a + (b - a) * t;

        // Particle System
        const particles = [];
        const colors = ['#FF6A00', '#F21A1A', '#FFA52E'];

        class Particle {
            constructor(x, y, dx, dy) {
                this.x = x;
                this.y = y;
                this.vx = (Math.random() - 0.5) * 2 - dx * 0.1;
                this.vy = (Math.random() - 0.5) * 2 - dy * 0.1;
                this.life = 1.0;
                this.decay = Math.random() * 0.05 + 0.02;
                this.size = Math.random() * 4 + 1;
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.life -= this.decay;
            }
            draw(ctx) {
                ctx.globalAlpha = Math.max(0, this.life);
                ctx.fillStyle = this.color;
                ctx.beginPath();
                // Geometric shards
                ctx.moveTo(this.x, this.y - this.size);
                ctx.lineTo(this.x + this.size, this.y);
                ctx.lineTo(this.x, this.y + this.size);
                ctx.lineTo(this.x - this.size, this.y);
                ctx.fill();
            }
        }

        // Loop
        const render = () => {
            ringPos.x = lerp(ringPos.x, mouse.x, 0.08);
            ringPos.y = lerp(ringPos.y, mouse.y, 0.08);
            dotPos.x = lerp(dotPos.x, mouse.x, 0.15);
            dotPos.y = lerp(dotPos.y, mouse.y, 0.15);

            ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(${ringScale}) rotate(${ringRotation}deg)`;
            dot.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0) translate(-50%, -50%) scale(${dot.dataset.scale || 1})`;

            // Canvas Trail Render
            ctx.clearRect(0, 0, width, height);
            
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.update();
                p.draw(ctx);
                if (p.life <= 0) particles.splice(i, 1);
            }

            rafId = requestAnimationFrame(render);
        };
        rafId = requestAnimationFrame(render);

        // Events
        const onMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;

            const dx = mouse.x - lastMouse.x;
            const dy = mouse.y - lastMouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 5) {
                // Spawn particles based on speed
                const count = Math.min(Math.floor(dist / 5), 5);
                for(let i=0; i<count; i++) {
                    particles.push(new Particle(mouse.x, mouse.y, dx, dy));
                }
            }
            lastMouse.x = mouse.x;
            lastMouse.y = mouse.y;
        };

        const onMouseDown = () => {
            ringScale = 0.85;
            dot.dataset.scale = 0.85;
            for(let i=0; i<15; i++) {
                particles.push(new Particle(mouse.x, mouse.y, (Math.random()-0.5)*20, (Math.random()-0.5)*20));
            }
        };

        const onMouseUp = () => {
            ringScale = 1;
            dot.dataset.scale = 1;
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);

        // Hover States
        const applyHoverHacks = () => {
            document.querySelectorAll('[data-cursor]').forEach(el => {
                if (el.dataset.cursorBound) return;
                el.dataset.cursorBound = "true";

                el.addEventListener('mouseenter', () => {
                    const type = el.getAttribute('data-cursor');
                    dot.style.opacity = '0';
                    label.style.opacity = '1';

                    if (type === 'link') {
                        ring.style.width = '60px';
                        ring.style.height = '60px';
                        ring.style.background = 'rgba(255, 106, 0, 0.15)';
                        ring.style.borderRadius = '0'; // Morph to Diamond
                        ringRotation = 45;
                        label.textContent = 'Ver';
                        label.style.transform = 'rotate(-45deg)';
                    }
                    else if (type === 'action') {
                        ring.style.width = '70px';
                        ring.style.height = '70px';
                        ring.style.background = 'rgba(255,106,0,0.2)';
                        ring.style.borderRadius = '50%';
                        ringRotation = 0;
                        label.textContent = 'Ação';
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
            if (canvasRef.current) canvasRef.current.remove();
        };
    }, []);

    return null;
}
