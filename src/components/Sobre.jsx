import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Sobre() {
    const sectionRef = useRef(null);
    const leftColRef = useRef(null);
    const rightColRef = useRef(null);
    const titleRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 75%",
                    toggleActions: "play none none reverse",
                }
            });

            // Columns slide in
            tl.from(leftColRef.current, { x: -50, opacity: 0, duration: 1, ease: 'power3.out' })
                .from(rightColRef.current, { x: 50, opacity: 0, duration: 1, ease: 'power3.out' }, "-=0.8");

            // Word-level clip-path for title
            const words = titleRef.current.querySelectorAll('.word');
            tl.fromTo(words,
                { clipPath: 'inset(0% 0% 100% 0%)', y: 30 },
                { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 0.8, stagger: 0.05, ease: 'power4.out' },
                "-=0.6"
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="sobre"
            ref={sectionRef}
            data-theme="light"
            className="py-32 px-6 lg:px-20 bg-cream text-dark"
        >
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

                {/* Left Column (40%) */}
                <div ref={leftColRef} className="lg:col-span-5 flex flex-col justify-start">
                    <div className="flex items-center gap-4 mb-12">
                        <span className="font-mono text-xs uppercase tracking-widest text-orange border border-orange rounded-full px-3 py-1">
                            01 — Sobre
                        </span>
                        {/* Origami Accent */}
                        <div className="w-8 h-8 opacity-80 animate-[breathe_6s_infinite] origin-center" style={{ perspective: '400px' }}>
                            <svg viewBox="0 0 100 100" fill="none">
                                <polygon points="50,10 90,50 50,90 10,50" fill="#FFA52E" />
                                <polygon points="50,10 90,50 50,50" fill="#FF6A00" />
                                <polygon points="50,90 90,50 50,50" fill="#F21A1A" />
                            </svg>
                        </div>
                    </div>

                    <h2 ref={titleRef} className="font-display font-semibold text-4xl lg:text-5xl leading-tight text-dark">
                        <span className="overflow-hidden inline-block mr-3"><span className="word inline-block">Tecnologia</span></span>
                        <span className="overflow-hidden inline-block mr-3"><span className="word inline-block">que</span></span>
                        <span className="overflow-hidden inline-block mr-3"><span className="word inline-block">nasce</span></span>
                        <span className="overflow-hidden inline-block mr-3"><span className="word inline-block">da</span></span>
                        <span className="overflow-hidden inline-block mr-3"><span className="word inline-block text-orange">operação</span></span>
                        <span className="overflow-hidden inline-block mr-3"><span className="word inline-block text-orange">real.</span></span>
                    </h2>
                </div>

                {/* Right Column (60%) */}
                <div ref={rightColRef} className="lg:col-span-7 flex flex-col justify-center gap-8 font-body text-lg lg:text-xl text-dark/80 leading-relaxed">
                    <p>
                        Pequenas empresas no Brasil resolvem problemas complexos com ferramentas genéricas — ou sem ferramenta nenhuma. A Blink existe porque acreditamos que cada nicho de mercado merece algo construído para ele.
                    </p>
                    <p>
                        Entramos na operação, entendemos como o negócio funciona de verdade, e criamos a ferramenta que deveria ter existido desde o início. Depois, escalamos para todo o mercado.
                    </p>
                    <p className="font-semibold text-dark">
                        Cada produto é uma marca independente. A Blink é a estrutura por trás.
                    </p>
                </div>

            </div>
        </section>
    );
}
