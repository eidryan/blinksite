import React, { useEffect } from 'react';
import gsap from 'gsap';

export default function BrandCursor() {
    useEffect(() => {
        // Disable custom cursor on touch devices or small screens
        if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1024) {
            document.body.style.cursor = 'auto';
            return;
        }

        // Hide native cursor on desktop
        document.body.style.cursor = 'none';

        // Create cursor elements
        const ring = document.createElement('div');
        const dot = document.createElement('div');
        const label = document.createElement('div');

        // Base styles
        Object.assign(ring.style, {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '1px solid rgba(255, 106, 0, 0.5)', // #FF6A00/50
            pointerEvents: 'none',
            zIndex: 9999,
            mixBlendMode: 'difference',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease, border-radius 0.3s ease',
        });

        Object.assign(dot.style, {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFA52E 0%, #FF6A00 50%, #F21A1A 100%)',
            pointerEvents: 'none',
            zIndex: 10000,
            mixBlendMode: 'difference',
            transform: 'translate(-50%, -50%)',
            transition: 'opacity 0.2s ease, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        });

        Object.assign(label.style, {
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '0.625rem',
            textTransform: 'uppercase',
            color: '#FDFAF4',
            opacity: 0,
            transition: 'opacity 0.2s ease',
            whiteSpace: 'nowrap',
        });

        ring.appendChild(label);
        document.body.appendChild(ring);
        document.body.appendChild(dot);

        // State
        const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const ringPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const dotPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

        let rafId = null;

        // Linear interpolation
        const lerp = (a, b, t) => a + (b - a) * t;

        // Loop
        const render = () => {
            ringPos.x = lerp(ringPos.x, mouse.x, 0.08);
            ringPos.y = lerp(ringPos.y, mouse.y, 0.08);
            dotPos.x = lerp(dotPos.x, mouse.x, 0.15);
            dotPos.y = lerp(dotPos.y, mouse.y, 0.15);

            ring.style.transform = `translate3d(${ringPos.x - 20 /* half width default*/}px, ${ringPos.y - 20}px, 0)`;
            // Adjust ring translation based on exact current width/height if we want perfect centering, 
            // but centering via fixed offsets and transform is smoother. Let's fix it by setting margin dynamically or simply keeping width/height fixed in transform logic:
            // A better approach for variable size is to set top/left directly without translate(-50%, -50%) inside the CSS, and just apply the direct XY offset.

            ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;
            dot.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0) translate(-50%, -50%) scale(${dot.dataset.scale || 1})`;

            rafId = requestAnimationFrame(render);
        };
        rafId = requestAnimationFrame(render);

        // Event Listeners
        const onMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const onMouseDown = () => {
            ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(0.85)`;
            dot.dataset.scale = 0.85;
        };

        const onMouseUp = () => {
            ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(1)`;
            dot.dataset.scale = 1;
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);

        // Event Delegation for hover states
        const onMouseOver = (e) => {
            const el = e.target.closest('a, button, [data-cursor]');
            if (!el) return;

            let type = el.getAttribute('data-cursor');
            if (!type) {
                if (el.tagName.toLowerCase() === 'a') type = 'link';
                if (el.tagName.toLowerCase() === 'button') type = 'action';
            }

            if (type === 'link') {
                ring.style.width = '60px';
                ring.style.height = '60px';
                ring.style.background = 'rgba(255, 106, 0, 0.15)';
                ring.style.borderRadius = '50%';
                dot.style.opacity = '0';
                label.textContent = 'Ver';
                label.style.opacity = '1';
            } else if (type === 'action') {
                ring.style.width = '60px';
                ring.style.height = '60px';
                ring.style.background = 'var(--brand-gradient-20, rgba(255,106,0,0.2))';
                ring.style.borderRadius = '50%';
                dot.style.opacity = '0';
                label.textContent = 'Abrir';
                label.style.opacity = '1';
            } else if (type === 'image') {
                ring.style.width = '80px';
                ring.style.height = '48px';
                ring.style.background = 'rgba(255, 106, 0, 0.15)';
                ring.style.borderRadius = '24px';
                dot.style.opacity = '0';
                label.textContent = 'Arrastar';
                label.style.opacity = '1';
            }
        };

        const onMouseOut = (e) => {
            const el = e.target.closest('a, button, [data-cursor]');
            if (!el) return;

            // Optional: Check if we are actually leaving the element and not going to a child
            const relatedTarget = e.relatedTarget;
            if (relatedTarget && el.contains(relatedTarget)) return;

            // Reset to default
            ring.style.width = '40px';
            ring.style.height = '40px';
            ring.style.background = 'transparent';
            ring.style.borderRadius = '50%';
            dot.style.opacity = '1';
            label.style.opacity = '0';
        };

        window.addEventListener('mouseover', onMouseOver);
        window.addEventListener('mouseout', onMouseOut);

        // Cleanup
        return () => {
            document.body.style.cursor = 'auto';
            cancelAnimationFrame(rafId);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('mouseover', onMouseOver);
            window.removeEventListener('mouseout', onMouseOut);
            ring.remove();
            dot.remove();
        };
    }, []);

    return null; // This is purely a side-effect hook component
}
