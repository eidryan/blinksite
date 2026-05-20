import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import gustavoImg from '../assets/gustavo_foto.jpg';

const founders = [
    {
        name: "Luan Carvalho",
        role: "CO-FUNDADOR, DESENVOLVIMENTO",
        desc: "Traduz problemas reais em sistemas que duram. Lidera a arquitetura e o desenvolvimento de cada produto da Blink, do backend ao deploy.",
        img: "https://images.unsplash.com/photo-1549692520-acc6669e2f0c?q=80&w=600&auto=format&fit=crop"
    },
    {
        name: "Adrian Villela",
        role: "CO-FUNDADOR, OPERAÇÕES & ESTRATÉGIA",
        desc: "Entra na operação, entende o que falta e define o caminho. Engenharia de produção aplicada a negócios que precisam de ferramenta própria.",
        img: "https://images.unsplash.com/photo-1537511446984-935f663eb1f4?q=80&w=600&auto=format&fit=crop"
    },
    {
        name: "Gustavo Ferreira",
        role: "SÓCIO, DISTRIBUIÇÃO & MARKETING",
        desc: "Leva o produto até quem precisa. Reels, posts e estratégia de conteúdo para transformar o que a Blink constrói em audiência real.",
        img: gustavoImg
    }
];

export default function Fundadores() {
    const [activeIndex, setActiveIndex] = useState(0);
    const biosRef = useRef(null);
    const stackRef = useRef(null);

    useEffect(() => {
        // Auto-advance
        const interval = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % founders.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Crossfade bios
        const children = biosRef.current.children;
        gsap.to(children, {
            opacity: 0,
            y: 10,
            duration: 0.4,
            ease: "power2.inOut"
        });
        gsap.to(children[activeIndex], {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            delay: 0.2
        });

        // Fire custom event for ImageHoverEffect vertex spike
        const photoWrappers = document.querySelectorAll('#fundadores .image-canvas-wrapper');
        if (photoWrappers[activeIndex]) {
            const event = new CustomEvent('spikeshader');
            photoWrappers[activeIndex].dispatchEvent(event);
        }
    }, [activeIndex]);

    const handleMouseMove = (e) => {
        if (!stackRef.current) return;
        const rect = stackRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const percentX = (x - centerX) / centerX;
        const percentY = -((y - centerY) / centerY);

        gsap.to(stackRef.current, {
            duration: 0.5,
            rotateX: percentY * 3,
            rotateY: percentX * 3,
            ease: 'power2.out',
            transformPerspective: 800
        });
    };

    const handleMouseLeave = () => {
        if (!stackRef.current) return;
        gsap.to(stackRef.current, {
            duration: 0.8,
            rotateX: 0,
            rotateY: 0,
            ease: 'elastic.out(1, 0.3)'
        });
    };

    return (
        <section
            id="fundadores"
            data-theme="dark"
            className="py-32 px-6 lg:px-20 bg-dark text-cream relative overflow-hidden"
        >
            <div className="brand-gradient-divider absolute top-0 left-0"></div>

            <div className="max-w-7xl mx-auto flex flex-col h-full">

                <span className="font-mono text-xs uppercase tracking-widest text-orange border border-orange/40 rounded-full px-3 py-1 self-start mb-12">
                    04 — Fundadores
                </span>

                <h2 className="font-display font-semibold text-4xl lg:text-5xl mb-20">
                    Quem está por trás.
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center flex-1">

                    {/* Photo Stack */}
                    <div
                        ref={stackRef}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        className="relative h-[400px] w-full max-w-md mx-auto perspective-1000 will-change-transform"
                    >
                        {founders.map((founder, i) => {
                            const isActive = i === activeIndex;
                            const rotations = [-4, 6, -6];
                            const rotation = rotations[i] ?? 5;
                            return (
                                <div
                                    key={i}
                                    className="absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] origin-bottom"
                                    style={{
                                        zIndex: isActive ? 10 : 0,
                                        opacity: isActive ? 1 : 0.4,
                                        transform: isActive ? `rotate(0deg) scale(1) translateY(0)` : `rotate(${rotation}deg) scale(0.95) translateY(20px)`
                                    }}
                                >
                                    <div className="bg-cream p-3 pb-12 rounded-lg shadow-xl shadow-black/50 h-full">
                                        {/* Prompt 2 hook wrapper */}
                                        <div className="image-canvas-wrapper w-full h-full relative" data-canvas="image">
                                            <img
                                                src={founder.img}
                                                alt={founder.name}
                                                className="w-full h-full object-cover rounded pointer-events-none filter grayscale hover:grayscale-0 transition-all duration-700"
                                                data-cursor="image"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Bios */}
                    <div className="relative h-56" ref={biosRef}>
                        {founders.map((founder, i) => (
                            <div
                                key={i}
                                className="absolute inset-0"
                                style={{ opacity: i === 0 ? 1 : 0 }}
                            >
                                <h3 className="font-display font-bold text-3xl mb-2">
                                    {founder.name}
                                </h3>
                                <p className="font-mono text-xs text-orange tracking-widest mb-6">
                                    {founder.role}
                                </p>
                                <p className="font-body text-lg text-cream/70">
                                    {founder.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                </div>

                {/* Quote */}
                <div className="mt-24 lg:mt-32 max-w-3xl mx-auto text-center">
                    <p className="font-display text-2xl lg:text-3xl leading-relaxed text-cream/90 mb-6 italic">
                        "Pode haver tanto valor em um piscar de olhos quanto em meses de análise racional."
                    </p>
                    <p className="font-mono text-xs uppercase tracking-widest text-[#FF8A1C]">
                        — Malcolm Gladwell, Blink
                    </p>
                </div>

            </div>
        </section>
    );
}
