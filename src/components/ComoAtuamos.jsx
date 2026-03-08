import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DitheringShader } from './ui/dithering-shader';

gsap.registerPlugin(ScrollTrigger);

const cards = [
    {
        prefix: "Primeiro, a operação.",
        text: "— Não construímos ferramentas a partir de suposições. Entramos no negócio, mapeamos cada processo, e encontramos a dor que realmente importa. A ferramenta nasce dessa verdade — não de um briefing."
    },
    {
        prefix: "Depois, lado a lado.",
        text: "— O cliente não recebe um produto pronto. Ele participa da construção, semana a semana, até que a ferramenta funcione na realidade dele. Não prometemos — entregamos."
    },
    {
        prefix: "Aí, o nicho inteiro.",
        text: "— O produto se torna independente — marca própria, operação própria — e atende centenas de negócios do mesmo mercado. A consultoria fica sob medida. O software é",
        highlight: "padrão."
    }
];

export default function ComoAtuamos() {
    const sectionRef = useRef(null);
    const cardsContainerRef = useRef(null);
    const cardsRef = useRef([]);

    useEffect(() => {
        // Only apply horizontal scroll on Desktop
        if (window.innerWidth < 1024) {
            // Mobile vertical stack animation (Prompt 1 baseline)
            const ctx = gsap.context(() => {
                gsap.from(cardsRef.current, {
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 70%",
                        toggleActions: "play none none reverse",
                    },
                    y: 40,
                    opacity: 0,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: "power3.out"
                });
            }, sectionRef);
            return () => ctx.revert();
        }

        // Desktop: Horizontal Scroll Pin
        const ctx = gsap.context(() => {
            const cards = cardsRef.current;
            const totalCards = cards.length;

            // Calculate total horizontal width needed to scroll
            const containerWidth = cardsContainerRef.current.scrollWidth;
            const windowWidth = window.innerWidth;
            const xToScroll = -(containerWidth - windowWidth + 100); // 100px padding buffer

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    pin: true,
                    scrub: 1,
                    start: "center center",
                    end: () => `+=${containerWidth}`,
                }
            });

            tl.to(cardsContainerRef.current, {
                x: xToScroll,
                ease: 'none'
            });

            // Active state scaling based on progress
            cards.forEach((card, i) => {
                const startPoint = i / totalCards;
                const endPoint = (i + 1) / totalCards;

                // At start of pin, first card is active
                // Interpolate scale and opacity across the scrub timeline
                tl.to(card, {
                    scale: 1,
                    opacity: 1,
                    duration: 0.1, // relatively fast transition dynamically
                    ease: 'power2.inOut',
                }, startPoint * tl.duration())
                    .to(card, {
                        scale: 0.92,
                        opacity: 0.4,
                        duration: 0.1,
                        ease: 'power2.inOut',
                    }, endPoint * tl.duration());
            });

            // Gradient connecting line animation
            gsap.fromTo('.como-connecting-line',
                { scaleX: 0 },
                {
                    scaleX: 1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "center center",
                        end: () => `+=${containerWidth}`,
                        scrub: 1
                    }
                }
            );

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="como-atuamos"
            ref={sectionRef}
            data-theme="dark"
            className="py-32 bg-dark text-cream relative overflow-hidden"
        >
            {/* Subtle background shader repurposed from Hero */}
            <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none" style={{ mixBlendMode: 'screen' }}>
                <DitheringShader
                    width={typeof window !== 'undefined' ? window.innerWidth : 1920}
                    height={typeof window !== 'undefined' ? window.innerHeight : 1080}
                    shape="ripple"
                    type="2x2"
                    colorBack="#000000"
                    colorFront="#ff6a00"
                    pxSize={3}
                    speed={0.8}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>

            <div className="brand-gradient-divider absolute top-0 left-0 z-10"></div>

            <div className="max-w-7xl mx-auto px-6 lg:px-20 relative z-10">
                <span className="font-mono text-xs uppercase tracking-widest text-orange border border-orange/40 rounded-full px-3 py-1 mb-8 inline-block">
                    02 — Como Atuamos
                </span>
                <h2 className="font-display font-semibold text-4xl lg:text-5xl max-w-2xl leading-tight">
                    Construímos junto. Escalamos depois.
                </h2>
            </div>

            <div className="relative w-full">
                {/* Connecting line - desktop only, animating scaleX */}
                <div className="como-connecting-line hidden lg:block absolute top-[50%] left-0 w-[300%] h-[2px] bg-gradient-to-r from-[#FFA52E] via-[#FF6A00] to-[#F21A1A] opacity-30 -z-10 origin-left"></div>

                <div ref={cardsContainerRef} className="flex flex-col lg:flex-row gap-6 lg:gap-16 lg:w-max px-6 lg:px-20">
                    {cards.map((card, idx) => (
                        <div
                            key={idx}
                            ref={el => cardsRef.current[idx] = el}
                            className="bg-white/5 border border-white/10 rounded-2xl p-8 lg:p-10 flex flex-col lg:w-[450px] shrink-0 backdrop-blur-sm relative overflow-hidden group hover:border-orange/30 transition-colors"
                            style={{
                                // Init states for desktop pinning logic
                                opacity: window.innerWidth >= 1024 ? (idx === 0 ? 1 : 0.4) : 1,
                                scale: window.innerWidth >= 1024 ? (idx === 0 ? 1 : 0.92) : 1
                            }}
                        >
                            {/* SVG Micro-animation placeholders based on Prompt 1 */}
                            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
                                {idx === 0 && (
                                    <svg className="w-12 h-12 text-cream animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" strokeWidth="1" strokeDasharray="4 4" />
                                        <circle cx="12" cy="12" r="5" strokeWidth="1" />
                                    </svg>
                                )}
                                {idx === 1 && (
                                    <svg className="w-12 h-12 text-cream" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <circle cx="8" cy="12" r="6" strokeWidth="1" />
                                        <circle cx="16" cy="12" r="6" strokeWidth="1" />
                                    </svg>
                                )}
                                {idx === 2 && (
                                    <svg className="w-12 h-12 text-cream" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M4 4h16v16H4z" strokeWidth="1" strokeDasharray="2 2" />
                                        <circle cx="12" cy="12" r="2" fill="currentColor" />
                                    </svg>
                                )}
                            </div>

                            <p className="font-body text-cream/90 leading-relaxed text-lg z-10 mt-12">
                                <span className="font-semibold text-orange block mb-2">{card.prefix}</span>
                                {card.text}
                                {card.highlight && (
                                    <span className="brand-gradient-text font-bold ml-1">{card.highlight}</span>
                                )}
                            </p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
