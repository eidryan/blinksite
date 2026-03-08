import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import OrigamiStar from './OrigamiStar';
import { DitheringShader } from './ui/dithering-shader';

export default function Hero() {
    const containerRef = useRef(null);
    const headlineRef = useRef(null);
    const subtitleRef = useRef(null);
    const ctaRef = useRef(null);

    useEffect(() => {
        const start = () => {
            // Basic GSAP timeline for text reveals
            const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

            const words = headlineRef.current.querySelectorAll('.word-inner');

            tl.to(words, {
                y: 0,
                clipPath: 'inset(0% 0% 0% 0%)',
                rotationX: 0,
                duration: 1.2,
                stagger: 0.08
            })
                .fromTo(subtitleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 }, "-=0.8")
                .fromTo(ctaRef.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8 }, "-=0.6");
        };

        window.addEventListener('loaderComplete', start, { once: true });
        return () => window.removeEventListener('loaderComplete', start);
    }, []);

    return (
        <section
            id="hero"
            data-theme="dark"
            className="relative min-h-[100dvh] flex flex-col justify-center items-start px-6 lg:px-20 overflow-hidden"
        >
            <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">        
                <DitheringShader
                    width={1920}
                    height={1080}
                    shape="ripple"
                    type="2x2"
                    colorBack="#330000"
                    colorFront="#ffff00"
                    pxSize={2}
                    speed={1.2}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>

            {/* Canvas Mount Point for Prompts 2 */}
            <div data-canvas="hero" className="absolute inset-0 z-[1]"></div>

            {/* Star Watermark */}
            <div data-speed="0.3" className="absolute -bottom-[20vw] -left-[10vw] z-0 opacity-[0.03] animate-[spin_180s_linear_infinite]">
                <OrigamiStar className="w-[70vw] h-[70vw]" />
            </div>

            <div ref={containerRef} className="relative z-10 max-w-5xl mt-20">
                <p className="font-mono text-orange uppercase text-xs lg:text-sm tracking-widest mb-8">
                    Rio de Janeiro, Brasil
                </p>

                <h1
                    ref={headlineRef}
                    className="font-display font-extrabold text-cream text-[2.5rem] lg:text-[7rem] leading-[1.1] mb-8"
                    style={{ perspective: '1000px', letterSpacing: 'clamp(-0.03em, -0.04em, -0.05em)', textWrap: 'balance' }}
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
                    className="font-body font-medium text-cream/90 lg:text-cream/70 text-lg lg:text-xl max-w-md leading-relaxed mb-12 opacity-0"
                >
                    Ferramentas que eliminam o que não deveria existir.
                </p>

                <a
                    ref={ctaRef}
                    href="#sobre"
                    data-cursor="action"
                    className="inline-flex items-center gap-2 brand-gradient text-dark font-body font-semibold px-8 py-4 rounded-full opacity-0 relative overflow-hidden group"
                    style={{ transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
                    onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        
                        // Gradient tracking
                        const width = rect.width;
                        const angle = (x / width) * 135;
                        e.currentTarget.style.setProperty('--gradient-angle', `${angle}deg`);
                        
                        // Magnetic pull
                        const centerX = rect.left + rect.width / 2;
                        const centerY = rect.top + rect.height / 2;
                        const pullX = (e.clientX - centerX) * 0.2; // 20% pull strength
                        const pullY = (e.clientY - centerY) * 0.2;
                        e.currentTarget.style.transform = `translate(${pullX}px, ${pullY}px) scale(1.05)`;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.setProperty('--gradient-angle', `135deg`);
                        e.currentTarget.style.transform = `translate(0px, 0px) scale(1)`;
                    }}
                >
                    Conheça a Blink <span className="text-xl inline-block group-hover:animate-bounce">↓</span>
                </a>
            </div>
        </section>
    );
}