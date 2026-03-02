import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Portfolio() {
    const sectionRef = useRef(null);
    const cardRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(cardRef.current, {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 70%",
                    toggleActions: "play none none reverse",
                },
                y: 50,
                opacity: 0,
                duration: 1,
                ease: "power3.out"
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element.
        const y = e.clientY - rect.top;  // y position within the element.

        // Normalize coordinates from -1 to 1 based on center axis
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const percentX = (x - centerX) / centerX;
        const percentY = -((y - centerY) / centerY); // inverted Y for correct 3D rotation logic

        // Max rotation 3 deg
        gsap.to(cardRef.current, {
            duration: 0.5,
            rotateX: percentY * 3,
            rotateY: percentX * 3,
            ease: 'power2.out',
            transformPerspective: 800,
            transformOrigin: 'center'
        });
    };

    const handleMouseLeave = () => {
        if (!cardRef.current) return;
        gsap.to(cardRef.current, {
            duration: 0.8,
            rotateX: 0,
            rotateY: 0,
            ease: 'elastic.out(1, 0.3)'
        });
    };

    return (
        <section
            id="portfolio"
            ref={sectionRef}
            data-theme="light"
            className="py-32 px-6 lg:px-20 bg-cream text-dark relative"
        >
            <div className="brand-gradient-divider absolute top-0 left-0"></div>

            <div className="max-w-7xl mx-auto flex flex-col items-center" style={{ perspective: '800px' }}>

                <div className="mb-20 text-center w-full">
                    <span className="font-mono text-xs uppercase tracking-widest text-orange border border-orange rounded-full px-3 py-1 mb-6 inline-block">
                        03 — Portfólio
                    </span>
                    <h2 className="font-display font-semibold text-4xl lg:text-5xl mx-auto max-w-2xl leading-tight text-dark">
                        Cada nicho, uma ferramenta.
                    </h2>

                    {/* Sparkle Cluster */}
                    <div className="flex justify-center mt-6 gap-2">
                        {[1, 2].map((i) => (
                            <svg
                                key={i}
                                className={`w-4 h-4 text-orange animate-[pulse_3s_ease-in-out_infinite] ${i === 2 ? 'opacity-60 scale-75' : ''}`}
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                            </svg>
                        ))}
                    </div>
                </div>

                {/* Cadencio Active Card */}
                <div
                    ref={cardRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="w-full lg:w-[70%] bg-[#212121] text-cream rounded-[2rem] p-10 lg:p-14 relative overflow-hidden group shadow-2xl hover:shadow-orange/10 transition-shadow duration-500 will-change-transform preserve-3d"
                >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FFA52E]/20 to-[#F21A1A]/0 rounded-bl-full opacity-50 blur-3xl transition-opacity group-hover:opacity-100"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">

                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-8">
                                <span className="flex h-3 w-3 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <span className="font-mono text-xs text-green-400 font-semibold tracking-widest">
                                    ATIVO
                                </span>
                            </div>

                            <h3 className="font-display font-bold text-5xl lg:text-6xl mb-4 text-cream tracking-tight">
                                Cadencio
                            </h3>

                            <p className="font-mono text-xs uppercase tracking-widest text-[#FF8A1C] mb-6">
                                Gestão para estúdios e academias
                            </p>

                            <p className="font-body text-lg lg:text-xl text-cream/70 max-w-md">
                                Presença, turmas e operação para quem ensina movimento.
                            </p>
                        </div>

                        <div>
                            <a
                                href="https://cadencio.app"
                                target="_blank"
                                rel="noreferrer"
                                data-cursor="link"
                                className="inline-flex items-center gap-2 bg-cream/10 hover:bg-cream/20 font-body font-semibold text-cream px-6 py-3 rounded-full transition-colors border border-white/10"
                            >
                                cadencio.app
                                <ExternalLink size={16} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Ghost Cards */}
                <div className="w-full lg:w-[70%] mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map(i => (
                        <div key={i} className="border-2 border-dashed border-dark/10 rounded-[2rem] p-8 flex items-center justify-center bg-dark/5 opacity-40 hover:opacity-60 transition-opacity">
                            <div className="text-center animate-pulse">
                                <p className="font-mono text-xs uppercase tracking-wide text-dark/50">Em desenvolvimento</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
