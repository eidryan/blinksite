import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import luanPhoto from '../assets/founders/luan.jpg';
import adrianPhoto from '../assets/founders/adrian.jpg';

const founders = [
    {
        name: "Luan Carvalho",
        role: "CO-FUNDADOR, DESENVOLVIMENTO",
        desc: "Arquitetura de sistemas, full-stack e automação. Constrói as ferramentas que a operação pede.",
        photo: luanPhoto,
        photoPosition: 'center 25%'
    },
    {
        name: "Adrian Villela",
        role: "CO-FUNDADOR, OPERAÇÕES & ESTRATÉGIA",
        desc: "Engenharia de produção, mapeamento de processos e estratégia de produto. Encontra a dor antes de construir.",
        photo: adrianPhoto,
        photoPosition: 'center 18%'
    }
];

export default function Fundadores() {
    const sectionRef = useRef(null);
    const cardsRef = useRef([]);

    // Per-card tilt on mouse move
    const handleMouseMove = (e, idx) => {
        const card = cardsRef.current[idx];
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const percentX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const percentY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
        gsap.to(card, {
            rotateX: percentY * 1.5,
            rotateY: percentX * 1.5,
            duration: 0.5,
            ease: 'power2.out',
            transformPerspective: 800
        });
    };

    const handleMouseLeave = (idx) => {
        gsap.to(cardsRef.current[idx], {
            rotateX: 0, rotateY: 0,
            duration: 0.8,
            ease: 'elastic.out(1, 0.3)'
        });
    };

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(cardsRef.current, {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 70%',
                    toggleActions: 'play none none reverse',
                },
                y: 50,
                opacity: 0,
                duration: 0.9,
                stagger: 0.15,
                ease: 'power3.out'
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section
            id="fundadores"
            ref={sectionRef}
            data-theme="dark"
            className="py-32 px-6 lg:px-20 bg-dark text-cream relative overflow-hidden"
        >
            <div className="brand-gradient-divider absolute top-0 left-0" />

            <div className="max-w-7xl mx-auto">

                <span className="font-mono text-xs uppercase tracking-widest text-orange border border-orange/40 rounded-full px-3 py-1 inline-block mb-12">
                    04. Fundadores
                </span>

                <h2 className="font-display font-semibold text-4xl lg:text-5xl mb-20" style={{ textWrap: 'balance' }}>
                    Quem está por trás.
                </h2>

                {/* Founder cards - side-by-side layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                    {founders.map((founder, i) => (
                        <div
                            key={i}
                            ref={el => cardsRef.current[i] = el}
                            onMouseMove={(e) => handleMouseMove(e, i)}
                            onMouseLeave={() => handleMouseLeave(i)}
                            className="group will-change-transform flex flex-row gap-6 items-start"
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            {/* Photo - compact */}
                            <div className="relative rounded-xl overflow-hidden border border-white/10 group-hover:border-orange/20 transition-colors duration-500 bg-[#1A1A1A] shrink-0 w-[140px] lg:w-[180px]">
                                <div className="h-[2px] w-full brand-gradient opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                                <div
                                    className="image-canvas-wrapper relative w-full"
                                    data-canvas="image"
                                    style={{ aspectRatio: '4 / 5' }}
                                >
                                    <img
                                        src={founder.photo}
                                        alt={founder.name}
                                        data-cursor="image"
                                        className="absolute inset-0 w-full h-full object-cover"
                                        style={{ objectPosition: founder.photoPosition }}
                                        loading="lazy"
                                    />
                                </div>
                            </div>

                            {/* Bio - more space */}
                            <div className="flex-1 pt-2">
                                <h3 className="font-display font-bold text-2xl lg:text-3xl mb-1">
                                    {founder.name}
                                </h3>
                                <p className="font-mono text-xs text-orange tracking-widest uppercase mb-3">
                                    {founder.role}
                                </p>
                                <p className="font-body text-base text-cream/70 leading-relaxed">
                                    {founder.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quote block */}
                <div className="mt-24 lg:mt-32 max-w-3xl mx-auto text-center">
                    <p className="font-display text-2xl lg:text-3xl leading-relaxed text-cream/90 mb-6 italic">
                        &quot;Pode haver tanto valor em um piscar de olhos quanto em meses de análise racional.&quot;
                    </p>
                    <p className="font-mono text-xs uppercase tracking-widest text-[#FF8A1C]">
                        Malcolm Gladwell, Blink
                    </p>
                </div>

            </div>
        </section>
    );
}

