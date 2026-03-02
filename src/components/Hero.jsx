import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import OrigamiStar from './OrigamiStar';

export default function Hero() {
    const containerRef = useRef(null);
    const headlineRef = useRef(null);
    const subtitleRef = useRef(null);
    const ctaRef = useRef(null);

    useEffect(() => {
        // Basic GSAP timeline for text reveals
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

        // Initial load screen sequence (star scaling) can be handled in App.js or here.
        // For now we assume the loader finishes and reveals the hero elements.

        const words = headlineRef.current.querySelectorAll('.word-inner');

        tl.to(words, {
            y: 0,
            clipPath: 'inset(0% 0% 0% 0%)',
            rotationX: 0,
            duration: 1.2,
            stagger: 0.08,
            delay: 1.5 // waiting for loader if any
        }, "-=0.5")
            .fromTo(subtitleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 }, "-=0.8")
            .fromTo(ctaRef.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8 }, "-=0.6");

    }, []);

    return (
        <section
            id="hero"
            data-theme="dark"
            className="relative min-h-[100dvh] flex flex-col justify-center items-start px-6 lg:px-20 overflow-hidden"
        >
            {/* Canvas Mount Point for Prompts 2 */}
            <div data-canvas="hero" className="absolute inset-0 z-0"></div>

            {/* Star Watermark */}
            <div className="absolute -bottom-[20vw] -left-[10vw] z-0 opacity-[0.03] animate-[spin_180s_linear_infinite]">
                <OrigamiStar className="w-[70vw] h-[70vw]" />
            </div>

            <div ref={containerRef} className="relative z-10 max-w-5xl mt-20">
                <p className="font-mono text-orange uppercase text-xs lg:text-sm tracking-widest mb-8">
                    Rio de Janeiro, Brasil
                </p>

                <h1
                    ref={headlineRef}
                    className="font-display font-extrabold text-cream text-[2.5rem] lg:text-[7rem] leading-[1.1] mb-8"
                    style={{ perspective: '1000px' }}
                >
                    {/* Split text for GSAP word-by-word reveal */}
                    <span className="clip-text-wrap mr-4">
                        <span className="word-inner clip-text-inner inline-block" style={{ transform: 'rotateX(6deg) translateY(30px)' }}>Decida</span>
                    </span>
                    <span className="clip-text-wrap mr-4">
                        <span className="word-inner clip-text-inner inline-block" style={{ transform: 'rotateX(6deg) translateY(30px)' }}>em</span>
                    </span>
                    <span className="clip-text-wrap mr-4">
                        <span className="word-inner clip-text-inner inline-block" style={{ transform: 'rotateX(6deg) translateY(30px)' }}>um</span>
                    </span>
                    <br className="hidden lg:block" />
                    <span className="clip-text-wrap mr-4">
                        <span className="word-inner clip-text-inner inline-block" style={{ transform: 'rotateX(6deg) translateY(30px)' }}>piscar</span>
                    </span>
                    <span className="clip-text-wrap mr-4">
                        <span className="word-inner clip-text-inner inline-block" style={{ transform: 'rotateX(6deg) translateY(30px)' }}>de</span>
                    </span>
                    <span className="clip-text-wrap text-orange">
                        <span className="word-inner clip-text-inner inline-block" style={{ transform: 'rotateX(6deg) translateY(30px)' }}>olhos.</span>
                    </span>
                </h1>

                <p
                    ref={subtitleRef}
                    className="font-body text-cream/70 text-lg lg:text-xl max-w-md leading-relaxed mb-12 opacity-0"
                >
                    Ferramentas que eliminam o que não deveria existir.
                </p>

                <a
                    ref={ctaRef}
                    href="#sobre"
                    data-cursor="action"
                    className="inline-flex items-center gap-2 brand-gradient text-dark font-body font-semibold px-8 py-4 rounded-full hover:scale-105 transition-transform opacity-0 relative overflow-hidden group"
                    onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const width = rect.width;
                        const angle = (x / width) * 135;
                        e.currentTarget.style.setProperty('--gradient-angle', `${angle}deg`);
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.setProperty('--gradient-angle', `135deg`);
                    }}
                >
                    Conheça a Blink <span className="text-xl">↓</span>
                </a>
            </div>
        </section>
    );
}
