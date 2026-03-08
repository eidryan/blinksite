import React, { useEffect } from 'react';
import gsap from 'gsap';

export default function ScrollVelocityReactor() {
    useEffect(() => {
        let rafId;
        
        // Query elements once to avoid layout thrashing on every frame
        const imageWrappers = document.querySelectorAll('.image-canvas-wrapper');
        const titles = document.querySelectorAll('[data-theme] h2:not([data-no-stretch])');
        const nav = document.querySelector('nav');

        const update = () => {
            // Prompt 1 Lenis hook sets this variable on body
            const v = parseFloat(document.body.dataset.scrollVelocity || 0);

            // A. Image Skew
            imageWrappers.forEach(el => {
                if (!el) return;
                // fast scroll = 2-4 deg skew
                const skewAmount = v * 0.2;
                el.style.transform = `skewY(${Math.min(Math.max(skewAmount, -4), 4)}deg)`;
            });

            // B. Section title stretch
            titles.forEach(el => {
                if (!el) return;
                // letters get scaleY(1 + velocity * 0.005) max 1.05
                const scaleAmount = 1 + Math.min(v * 0.005, 0.05);
                el.style.transform = `scaleY(${scaleAmount})`;
            });

            // D. Navbar blur scaling
            // The navbar has backdrop-blur-md from tailwind. 
            // We dynamically set the backdropFilter inline:
            if (nav && window.scrollY > window.innerHeight * 0.9) {
                // Scale between 16px and 28px depending on velocity
                const blurAmount = 16 + Math.min(v * 0.1, 12);
                nav.style.backdropFilter = `blur(${blurAmount}px)`;
                nav.style.WebkitBackdropFilter = `blur(${blurAmount}px)`;
            }

            rafId = requestAnimationFrame(update);
        };

        update();

        return () => {
            cancelAnimationFrame(rafId);
        };
    }, []);

    return null;
}
