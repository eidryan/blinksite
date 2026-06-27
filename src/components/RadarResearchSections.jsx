import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, BookOpenText, Clock, RadioTower } from 'lucide-react';
import RadarIllustration from './illustrations/RadarIllustration';
import ResearchIllustration from './illustrations/ResearchIllustration';

gsap.registerPlugin(ScrollTrigger);

const contentSections = [
    {
        id: 'radar',
        label: '04. Radar',
        eyebrow: 'Destino editorial da Blink',
        title: 'O que está mudando no mercado, antes de virar consenso.',
        body: 'Uma leitura prática de notícias, movimentos e sinais que importam para pequenas e médias empresas. O Radar mostra por que cada mudança merece atenção e o que ela pode provocar na operação real.',
        cta: 'Conhecer o Radar',
        href: '/radar',
        theme: 'dark',
        icon: RadioTower,
        card: {
            title: 'Sinais que mudam a operação antes da manchete',
            excerpt: 'Um recorte do que merece atenção agora, traduzido para quem decide dentro de uma PME.',
            source: 'Blink Radar',
            readTime: '4 min de leitura',
            tags: ['Mercado', 'Sinais', 'PMEs'],
            Cover: RadarIllustration,
        },
    },
    {
        id: 'research',
        label: '05. Research',
        eyebrow: 'Papers, pesquisas e ferramentas aplicadas',
        title: 'Pesquisa aplicada para aproximar academia e mercado.',
        body: 'O ambiente onde a Blink aproxima as PMEs brasileiras do que está sendo produzido na academia: papers, pesquisas e ferramentas aplicadas que podem sair do laboratório e virar decisão, operação e produto no mercado real.',
        cta: 'Explorar Research',
        href: '/research',
        theme: 'light',
        icon: BookOpenText,
        card: {
            title: 'Da academia para decisões de produto, operação e mercado',
            excerpt: 'Papers, métodos e ferramentas apresentados em linguagem prática para negócios brasileiros.',
            source: 'Blink Research',
            readTime: '6 min de leitura',
            tags: ['Papers', 'Ferramentas', 'Aplicação'],
            Cover: ResearchIllustration,
        },
    },
];

export default function RadarResearchSections() {
    const sectionRefs = useRef([]);
    const cardRefs = useRef([]);

    useEffect(() => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reduceMotion) {
            return;
        }

        const ctx = gsap.context(() => {
            sectionRefs.current.forEach((section) => {
                if (!section) return;

                const revealItems = section.querySelectorAll('[data-editorial-reveal]');

                gsap.fromTo(
                    revealItems,
                    { y: 34, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.85,
                        stagger: 0.1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: section,
                            start: 'top 72%',
                            toggleActions: 'play none none reverse',
                        },
                    }
                );
            });
        });

        return () => ctx.revert();
    }, []);

    const handleMouseMove = (event, index) => {
        if (!window.matchMedia('(pointer: fine)').matches) return;

        const card = cardRefs.current[index];
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const percentX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        const percentY = -((event.clientY - rect.top) / rect.height - 0.5) * 2;

        gsap.to(card, {
            rotateX: percentY * 1.8,
            rotateY: percentX * 1.8,
            duration: 0.45,
            ease: 'power2.out',
            transformPerspective: 900,
            transformOrigin: 'center',
        });
    };

    const handleMouseLeave = (index) => {
        const card = cardRefs.current[index];
        if (!card) return;

        gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.7,
            ease: 'elastic.out(1, 0.35)',
        });
    };

    return (
        <>
            {contentSections.map((section, index) => {
                const isDark = section.theme === 'dark';
                const isReversed = section.id === 'research';
                const Icon = section.icon;
                const Cover = section.card.Cover;

                return (
                    <section
                        key={section.id}
                        id={section.id}
                        ref={(element) => { sectionRefs.current[index] = element; }}
                        data-theme={section.theme}
                        className={`relative overflow-hidden px-6 py-28 lg:px-20 lg:py-36 ${isDark ? 'bg-dark text-cream' : 'bg-cream text-dark'}`}
                    >
                        <div className="brand-gradient-divider absolute left-0 top-0" />

                        <div className={`relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,0.88fr)_minmax(380px,0.72fr)] lg:gap-20 ${isReversed ? 'lg:grid-flow-col-dense' : ''}`}>
                            <div className={`${isReversed ? 'lg:col-start-2' : ''}`}>
                                <span
                                    data-editorial-reveal
                                    className={`mb-8 inline-flex rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-widest ${isDark ? 'border-orange/40 text-orange' : 'border-orange text-orange'}`}
                                >
                                    {section.label}
                                </span>

                                <p
                                    data-editorial-reveal
                                    className={`mb-5 font-mono text-xs uppercase tracking-[0.18em] ${isDark ? 'text-[#FF8A1C]' : 'text-[#C2410C]'}`}
                                >
                                    {section.eyebrow}
                                </p>

                                <h2
                                    data-editorial-reveal
                                    data-no-stretch
                                    className={`max-w-3xl font-display text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl ${isDark ? 'text-cream' : 'text-dark'}`}
                                    style={{ textWrap: 'balance' }}
                                >
                                    {section.title}
                                </h2>

                                <p
                                    data-editorial-reveal
                                    className={`mt-8 max-w-2xl font-body text-lg leading-relaxed md:text-xl ${isDark ? 'text-cream/70' : 'text-dark/70'}`}
                                >
                                    {section.body}
                                </p>

                                <a
                                    data-editorial-reveal
                                    href={section.href}
                                    data-cursor="action"
                                    className={`mt-10 inline-flex items-center justify-center gap-3 rounded-full px-7 py-3.5 font-body font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 ${isDark
                                        ? 'brand-gradient text-dark hover:scale-[1.02] focus-visible:ring-offset-dark'
                                        : 'bg-dark text-cream hover:bg-dark/90 focus-visible:ring-offset-cream'
                                        }`}
                                >
                                    {section.cta}
                                    <ArrowUpRight size={18} strokeWidth={2} />
                                </a>
                            </div>

                            <a
                                ref={(element) => { cardRefs.current[index] = element; }}
                                data-editorial-reveal
                                href={section.href}
                                data-cursor="action"
                                onMouseMove={(event) => handleMouseMove(event, index)}
                                onMouseLeave={() => handleMouseLeave(index)}
                                className={`group relative block overflow-hidden rounded-[1.75rem] border shadow-2xl transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 ${isReversed ? 'lg:col-start-1 lg:row-start-1' : ''} ${isDark
                                    ? 'border-white/12 bg-[#181818]/72 text-cream shadow-black/30 focus-visible:ring-offset-dark'
                                    : 'border-dark/10 bg-[#FFF8EA]/80 text-dark shadow-orange/10 focus-visible:ring-offset-cream'
                                    }`}
                                style={{ transformStyle: 'preserve-3d' }}
                                aria-label={section.cta}
                            >
                                <div className="relative aspect-[16/9] overflow-hidden">
                                    <Cover className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-105" />
                                    <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-300 group-hover:opacity-50 ${isDark ? 'from-dark/88 via-dark/20 to-transparent opacity-70' : 'from-cream/88 via-cream/20 to-transparent opacity-75'}`} />

                                    <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 pr-4">
                                        {section.card.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className={`rounded-full border px-3 py-1 font-mono text-[0.65rem] uppercase tracking-widest backdrop-blur-sm ${isDark
                                                    ? 'border-white/15 bg-dark/40 text-cream/80'
                                                    : 'border-dark/10 bg-cream/60 text-dark/70'
                                                    }`}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="absolute inset-0 flex items-center justify-center bg-dark/30 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                                        <span className="inline-flex translate-y-3 items-center gap-2 rounded-full brand-gradient px-6 py-3 font-body text-sm font-semibold text-dark shadow-lg shadow-orange/20 transition-transform duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0">
                                            {section.cta}
                                            <ArrowUpRight size={16} strokeWidth={2} />
                                        </span>
                                    </div>
                                </div>

                                <div className="relative p-6 md:p-7">
                                    <div className="mb-4 flex items-center gap-3">
                                        <span className={`flex h-10 w-10 items-center justify-center rounded-full border ${isDark ? 'border-white/10 bg-white/5 text-orange' : 'border-dark/10 bg-dark/5 text-orange'}`}>
                                            <Icon size={20} strokeWidth={1.7} />
                                        </span>
                                        <span className={`font-mono text-[0.68rem] uppercase tracking-[0.18em] ${isDark ? 'text-cream/55' : 'text-dark/55'}`}>
                                            {section.eyebrow}
                                        </span>
                                    </div>

                                    <h3 className={`font-display text-2xl font-semibold leading-tight transition-colors duration-200 md:text-3xl ${isDark ? 'text-cream group-hover:text-orange' : 'text-dark group-hover:text-orange'}`}>
                                        {section.card.title}
                                    </h3>

                                    <p className={`mt-4 font-body text-sm leading-relaxed md:text-base ${isDark ? 'text-cream/66' : 'text-dark/66'}`}>
                                        {section.card.excerpt}
                                    </p>

                                    <div className={`mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between ${isDark ? 'border-white/10' : 'border-dark/10'}`}>
                                        <div>
                                            <p className={`font-body text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-cream/50' : 'text-dark/50'}`}>
                                                {section.card.source}
                                            </p>
                                        </div>

                                        <div className={`inline-flex items-center gap-2 font-body text-sm ${isDark ? 'text-cream/60' : 'text-dark/60'}`}>
                                            <Clock size={16} strokeWidth={1.8} />
                                            <span>{section.card.readTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </section>
                );
            })}
        </>
    );
}
