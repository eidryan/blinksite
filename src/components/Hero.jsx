import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { BayerShader } from './ui/bayer-shader';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
    const containerRef = useRef(null);
    const titleRef = useRef(null);
    const subtitleRef = useRef(null);
    const ctaRef = useRef(null);
    const triggerRef = useRef(null);

    useEffect(() => {
        const start = () => {
            const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

            tl.fromTo(titleRef.current, { opacity: 0, y: 28, filter: 'blur(12px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8 }, 0.2)
                .fromTo(subtitleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.6)
                .fromTo(ctaRef.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8 }, "-=0.6");
        };

        window.addEventListener('loaderComplete', start, { once: true });
        return () => window.removeEventListener('loaderComplete', start);
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: triggerRef.current,
                start: "top top",
                end: "+=300",
                onUpdate: (self) => {
                    const progress = self.progress;
                    gsap.set(titleRef.current, {
                        y: progress * -36,
                        opacity: 1 - progress * 0.55,
                        filter: `blur(${progress * 10}px)`
                    });
                }
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="hero"
            data-theme="dark"
            className="relative min-h-[100dvh] flex flex-col justify-end items-start px-6 lg:px-20 pb-24 lg:pb-32 overflow-hidden bg-[#050505]"
        >
            <div className="absolute inset-0 z-0 pointer-events-auto">
                <BayerShader
                    shape="circle"
                    pixelSize={4}
                    color="#ff6a00"
                />
            </div>


            <div ref={containerRef} className="relative z-10 w-full max-w-5xl pointer-events-none mt-20">
                <p className="font-mono text-orange uppercase text-xs lg:text-sm tracking-widest mb-8">
                    Rio de Janeiro, Brasil
                </p>

                <div ref={triggerRef} className="relative w-full mb-8 lg:mb-12 pointer-events-none">
                    <h1
                        ref={titleRef}
                        className="font-display text-cream text-[clamp(2.6rem,8vw,6.25rem)] font-extrabold leading-[0.92] tracking-[-0.05em] max-w-[12ch] opacity-0"
                    >
                        Decida em um piscar de <span className="text-orange">olhos</span>.
                    </h1>
                </div>

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
                    className="pointer-events-auto inline-flex items-center gap-2 brand-gradient text-dark font-body font-semibold px-8 py-4 rounded-full hover:scale-105 transition-transform opacity-0 relative overflow-hidden group"
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
                    Conheça a Blink <span className="text-xl inline-block group-hover:animate-bounce">↓</span>
                </a>
            </div>
        </section>
    );
}
