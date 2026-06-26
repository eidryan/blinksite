import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, BookOpenText, RadioTower } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const contentSections = [
    {
        id: 'radar',
        label: '04. Radar',
        title: 'O que está mudando no mercado, antes de virar consenso.',
        eyebrow: 'Sinais de mercado para PMEs',
        body: 'Uma leitura prática de notícias, movimentos e sinais que importam para pequenas e médias empresas. O Radar mostra por que cada mudança merece atenção e o que ela pode provocar na operação real.',
        cta: 'Conhecer o Radar',
        href: '/radar',
        theme: 'dark',
        icon: RadioTower,
        accent: 'RADAR',
        notes: ['curadoria', 'sinais', 'por que importa'],
    },
    {
        id: 'research',
        label: '05. Research',
        title: 'Pesquisa aplicada para aproximar academia e mercado.',
        eyebrow: 'Papers, pesquisas e ferramentas aplicadas',
        body: 'O ambiente onde a Blink aproxima as PMEs brasileiras do que está sendo produzido na academia: papers, pesquisas e ferramentas aplicadas que podem sair do laboratório e virar decisão, operação e produto no mercado real.',
        cta: 'Explorar Research',
        href: '/research',
        theme: 'light',
        icon: BookOpenText,
        accent: 'RESEARCH',
        notes: ['papers', 'pesquisa aplicada', 'ferramentas'],
    },
];

export default function RadarResearchSections() {
    const sectionRefs = useRef([]);
    const panelRefs = useRef([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            panelRefs.current.forEach((panel, index) => {
                if (!panel) return;

                gsap.from(panel, {
                    scrollTrigger: {
                        trigger: sectionRefs.current[index],
                        start: 'top 70%',
                        toggleActions: 'play none none reverse',
                    },
                    y: 56,
                    opacity: 0,
                    duration: 0.95,
                    ease: 'power3.out',
                });
            });
        });

        return () => ctx.revert();
    }, []);

    const handleMouseMove = (event, index) => {
        const panel = panelRefs.current[index];
        if (!panel) return;

        const rect = panel.getBoundingClientRect();
        const percentX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        const percentY = -((event.clientY - rect.top) / rect.height - 0.5) * 2;

        gsap.to(panel, {
            rotateX: percentY * 1.4,
            rotateY: percentX * 1.4,
            duration: 0.5,
            ease: 'power2.out',
            transformPerspective: 900,
        });
    };

    const handleMouseLeave = (index) => {
        const panel = panelRefs.current[index];
        if (!panel) return;

        gsap.to(panel, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.8,
            ease: 'elastic.out(1, 0.35)',
        });
    };

    return (
        <>
            {contentSections.map((section, index) => {
                const isDark = section.theme === 'dark';
                const Icon = section.icon;

                return (
                    <section
                        key={section.id}
                        id={section.id}
                        ref={(element) => { sectionRefs.current[index] = element; }}
                        data-theme={section.theme}
                        className={`relative overflow-hidden px-6 py-28 lg:px-20 lg:py-32 ${isDark ? 'bg-dark text-cream' : 'bg-cream text-dark'}`}
                    >
                        <div className="brand-gradient-divider absolute top-0 left-0" />

                        <div className="relative z-10 mx-auto flex max-w-7xl justify-center" style={{ perspective: '900px' }}>
                            <div
                                ref={(element) => { panelRefs.current[index] = element; }}
                                onMouseMove={(event) => handleMouseMove(event, index)}
                                onMouseLeave={() => handleMouseLeave(index)}
                                className={`group relative flex w-full max-w-[980px] flex-col justify-between overflow-hidden rounded-[2rem] border p-8 shadow-2xl will-change-transform md:p-12 lg:aspect-square lg:p-16 ${isDark
                                    ? 'border-white/10 bg-[#181818] text-cream shadow-black/30'
                                    : 'border-dark/10 bg-[#FFF8EA] text-dark shadow-orange/10'
                                    }`}
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className={`absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-80 ${isDark ? 'bg-orange/20 opacity-45' : 'bg-orange/15 opacity-60'}`} />
                                    <div className={`absolute bottom-0 left-0 h-[2px] w-full brand-gradient ${isDark ? 'opacity-70' : 'opacity-90'}`} />
                                </div>

                                <div className="relative z-10 flex items-start justify-between gap-6">
                                    <span className={`font-mono text-xs uppercase tracking-widest border rounded-full px-3 py-1 ${isDark ? 'text-orange border-orange/40' : 'text-orange border-orange'}`}>
                                        {section.label}
                                    </span>

                                    <div className={`flex h-12 w-12 items-center justify-center rounded-full border ${isDark ? 'border-white/10 bg-white/5 text-orange' : 'border-dark/10 bg-dark/5 text-orange'}`}>
                                        <Icon size={22} strokeWidth={1.7} />
                                    </div>
                                </div>

                                <div className="relative z-10 my-16 max-w-2xl lg:my-0">
                                    <p className={`mb-6 font-mono text-xs uppercase tracking-[0.18em] ${isDark ? 'text-[#FF8A1C]' : 'text-orange'}`}>
                                        {section.eyebrow}
                                    </p>

                                    <h2 className={`font-display text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl ${isDark ? 'text-cream' : 'text-dark'}`} style={{ textWrap: 'balance' }}>
                                        {section.title}
                                    </h2>

                                    <p className={`mt-8 max-w-xl font-body text-lg leading-relaxed md:text-xl ${isDark ? 'text-cream/70' : 'text-dark/70'}`}>
                                        {section.body}
                                    </p>
                                </div>

                                <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                                    <div className="flex flex-wrap gap-3">
                                        {section.notes.map((note) => (
                                            <span
                                                key={note}
                                                className={`rounded-full border px-3 py-1 font-mono text-[0.68rem] uppercase tracking-widest ${isDark
                                                    ? 'border-white/10 bg-white/5 text-cream/65'
                                                    : 'border-dark/10 bg-dark/5 text-dark/65'
                                                    }`}
                                            >
                                                {note}
                                            </span>
                                        ))}
                                    </div>

                                    <a
                                        href={section.href}
                                        data-cursor="action"
                                        className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-body font-semibold transition-transform hover:scale-105 ${isDark
                                            ? 'brand-gradient text-dark'
                                            : 'bg-dark text-cream hover:bg-dark/90'
                                            }`}
                                    >
                                        {section.cta}
                                        <ArrowUpRight size={18} strokeWidth={2} />
                                    </a>
                                </div>

                                <div className={`pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 font-mono text-[5.5rem] font-bold tracking-[0.2em] opacity-[0.035] lg:block ${isDark ? 'text-cream' : 'text-dark'}`}>
                                    {section.accent}
                                </div>
                            </div>
                        </div>
                    </section>
                );
            })}
        </>
    );
}
