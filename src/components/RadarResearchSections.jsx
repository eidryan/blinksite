import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, BookOpenText, RadioTower } from 'lucide-react';
import RadarIllustration from './illustrations/RadarIllustration';
import ResearchIllustration from './illustrations/ResearchIllustration';

gsap.registerPlugin(ScrollTrigger);

const contentSections = [
    {
        id: 'radar',
        title: 'O que está mudando no mercado, antes de virar consenso.',
        eyebrow: 'Sinais de mercado para PMEs',
        body: 'Uma leitura prática de notícias, movimentos e sinais que importam para pequenas e médias empresas. O Radar mostra por que cada mudança merece atenção e o que ela pode provocar na operação real.',
        cta: 'Conhecer o Radar',
        overlayCta: 'Ver mais',
        href: '/radar',
        theme: 'dark',
        align: 'left',
        icon: RadioTower,
        notes: ['curadoria', 'sinais', 'por que importa'],
    },
    {
        id: 'research',
        title: 'Pesquisa aplicada para aproximar academia e mercado.',
        eyebrow: 'Papers, pesquisas e ferramentas aplicadas',
        body: 'O ambiente onde a Blink aproxima as PMEs brasileiras do que está sendo produzido na academia: papers, pesquisas e ferramentas aplicadas que podem sair do laboratório e virar decisão, operação e produto no mercado real.',
        cta: 'Explorar Research',
        overlayCta: 'Ver mais',
        href: '/research',
        theme: 'light',
        align: 'right',
        icon: BookOpenText,
        notes: ['papers', 'pesquisa aplicada', 'ferramentas'],
    },
];

export default function RadarResearchSections() {
    const sectionRefs = useRef([]);
    const panelRefs = useRef([]);
    const [isStickyActive, setIsStickyActive] = useState(false);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        const mm = gsap.matchMedia();

        mm.add({
            isDesktop: '(min-width: 1024px) and (min-height: 750px) and (hover: hover)',
            isMobile: '(max-width: 1023px), (max-height: 749px), (hover: none)',
        }, (context) => {
            const { isDesktop } = context.conditions;

            if (isMounted.current) {
                setIsStickyActive(isDesktop);
            }

            if (isDesktop) {
                // DESKTOP animation sequence

                // 1. Entrance reveal for the first card (#radar) — subtle scale + fade
                const radarPanel = panelRefs.current[0];
                if (radarPanel) {
                    gsap.fromTo(radarPanel, 
                        { y: 40, scale: 0.96, opacity: 0 },
                        {
                            y: 0,
                            scale: 1,
                            opacity: 1,
                            duration: 1,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: sectionRefs.current[0],
                                start: 'top 80%',
                                toggleActions: 'play none none reverse',
                                invalidateOnRefresh: true,
                            }
                        }
                    );
                }

                // 2. Pin the first section (#radar) so research slides over it
                ScrollTrigger.create({
                    trigger: sectionRefs.current[0],
                    pin: true,
                    pinSpacing: false,
                    start: 'top top',
                    end: 'bottom top',
                    invalidateOnRefresh: true,
                });

                // 3. Fade out + scale down the first card as research covers it
                if (radarPanel) {
                    gsap.to(radarPanel, {
                        scale: 0.9,
                        opacity: 0.3,
                        filter: 'blur(4px)',
                        ease: 'none',
                        scrollTrigger: {
                            trigger: sectionRefs.current[1],
                            start: 'top bottom',
                            end: 'top 30%',
                            scrub: true,
                            invalidateOnRefresh: true,
                        }
                    });
                }

                // 4. Entrance reveal for the second card (#research) — scrub-driven slide-up
                const researchPanel = panelRefs.current[1];
                if (researchPanel) {
                    gsap.fromTo(researchPanel,
                        { y: 60, scale: 0.96, opacity: 0 },
                        {
                            y: 0,
                            scale: 1,
                            opacity: 1,
                            duration: 1,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: sectionRefs.current[1],
                                start: 'top 80%',
                                toggleActions: 'play none none reverse',
                                invalidateOnRefresh: true,
                            }
                        }
                    );
                }
            } else {
                // MOBILE: clean vertical-only fade-up (no x offset to avoid overflow clipping)
                panelRefs.current.forEach((panel, index) => {
                    if (!panel) return;

                    gsap.fromTo(panel,
                        { y: 50, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 1,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: sectionRefs.current[index],
                                start: 'top 85%',
                                toggleActions: 'play none none reverse',
                                invalidateOnRefresh: true,
                            }
                        }
                    );
                });
            }
        });

        return () => mm.revert();
    }, []);

    const handleMouseMove = (event, index) => {
        const panel = panelRefs.current[index];
        if (!panel) return;

        const rect = panel.getBoundingClientRect();
        const percentX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        const percentY = -((event.clientY - rect.top) / rect.height - 0.5) * 2;

        gsap.to(panel, {
            rotateX: percentY * 2,
            rotateY: percentX * 2,
            duration: 0.5,
            ease: 'power2.out',
            transformPerspective: 1000,
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
                const isRight = section.align === 'right';
                const Icon = section.icon;
                const zIndexClass = index === 0 ? 'z-10' : 'z-20';

                return (
                    <section
                        key={section.id}
                        id={section.id}
                        ref={(element) => { sectionRefs.current[index] = element; }}
                        data-theme={section.theme}
                        className={`relative overflow-hidden px-6 py-28 lg:px-20 ${
                            isStickyActive
                                ? 'lg:h-screen lg:py-0 lg:flex lg:items-center lg:justify-center'
                                : 'lg:py-36'
                        } ${zIndexClass} ${isDark ? 'bg-dark text-cream' : 'bg-cream text-dark'}`}
                    >
                        <div className="brand-gradient-divider absolute top-0 left-0" />

                        <div className={`relative z-10 mx-auto flex w-full max-w-7xl ${isRight ? 'justify-end' : 'justify-start'}`} style={{ perspective: '1200px' }}>
                            <div
                                ref={(element) => { panelRefs.current[index] = element; }}
                                onMouseMove={(event) => handleMouseMove(event, index)}
                                onMouseLeave={() => handleMouseLeave(index)}
                                className={`group relative flex w-full max-w-[850px] flex-col justify-between overflow-hidden rounded-2xl lg:rounded-[2.5rem] border p-8 shadow-2xl will-change-transform md:p-12 lg:p-16 ${isDark
                                    ? 'border-white/15 bg-[#181818]/65 text-cream shadow-black/40'
                                    : 'border-dark/10 bg-[#FFF8EA]/65 text-dark shadow-orange/10'
                                    } backdrop-blur-md`}
                            >
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className={`absolute ${isRight ? '-left-24' : '-right-24'} -top-24 h-72 w-72 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-80 ${isDark ? 'bg-orange/20 opacity-45' : 'bg-orange/15 opacity-60'}`} />
                                    <div className={`absolute bottom-0 left-0 h-[3px] w-full brand-gradient ${isDark ? 'opacity-80' : 'opacity-100'}`} />
                                </div>

                                <div className={`relative z-10 flex items-start ${isRight ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex h-14 w-14 items-center justify-center rounded-full border ${isDark ? 'border-white/10 bg-white/5 text-orange' : 'border-dark/10 bg-dark/5 text-orange'}`}>
                                        <Icon size={26} strokeWidth={1.5} />
                                    </div>
                                </div>

                                <div className={`relative z-10 my-10 max-w-3xl md:my-14 ${isRight ? 'text-right ml-auto' : 'text-left mr-auto'}`}>
                                    <p className={`mb-5 font-mono text-sm uppercase tracking-[0.2em] ${isDark ? 'text-[#FF8A1C]' : 'text-[#C2410C]'}`}>
                                        {section.eyebrow}
                                    </p>

                                    <h2 className={`font-display text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl ${isDark ? 'text-cream' : 'text-dark'}`} style={{ textWrap: 'balance' }}>
                                        {section.title}
                                    </h2>

                                    <p className={`mt-8 font-body text-lg leading-relaxed md:text-xl ${isDark ? 'text-cream/70' : 'text-dark/70'} ${isRight ? 'ml-auto max-w-2xl' : 'mr-auto max-w-2xl'} line-clamp-6 sm:line-clamp-4 lg:line-clamp-none`}>
                                        {section.body}
                                    </p>
                                </div>

                                {/* Representative placeholder image with hover overlay action */}
                                <div className={`relative aspect-[16/9] w-full overflow-hidden rounded-2xl border mt-6 mb-8 ${isDark ? 'border-white/10' : 'border-dark/10'}`}>
                                    {index === 0 ? (
                                        <RadarIllustration className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-110" />
                                    ) : (
                                        <ResearchIllustration className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-110" />
                                    )}
 
                                    {/* Hover Overlay Action (desktop) / Tap target (mobile) */}
                                    {isStickyActive ? (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-sm transition-all duration-300 ease-out group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto z-20">
                                            <a
                                                href={section.href}
                                                data-cursor="action"
                                                className={`inline-flex items-center justify-center gap-3 rounded-full px-8 py-4 font-body font-semibold transform translate-y-4 transition-all duration-500 ease-out group-hover:translate-y-0 focus-visible:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 ${isDark
                                                    ? 'brand-gradient text-dark focus-visible:ring-offset-dark'
                                                    : 'bg-cream text-dark hover:bg-cream/90 focus-visible:ring-offset-cream'
                                                    }`}
                                            >
                                                {section.overlayCta}
                                                <ArrowUpRight size={20} strokeWidth={2} />
                                            </a>
                                        </div>
                                    ) : (
                                        <a href={section.href} className="absolute inset-0 z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-inset rounded-2xl" aria-label={section.cta}>
                                            <span className="sr-only">{section.cta}</span>
                                        </a>
                                    )}
                                </div>
 
                                <div className={`relative z-10 flex flex-col gap-8 md:items-center ${isRight ? 'md:flex-row-reverse md:justify-between' : 'md:flex-row md:justify-between'}`}>
                                    <div className={`flex flex-wrap items-center gap-3 ${isRight ? 'justify-end' : 'justify-start'}`}>
                                        <span className={`font-mono text-[0.65rem] uppercase tracking-widest ${isDark ? 'text-cream/60' : 'text-dark/60'}`}>Temas:</span>
                                        {section.notes.map((note) => (
                                            <span
                                                key={note}
                                                className={`cursor-default rounded-full border px-4 py-1.5 font-mono text-[0.7rem] uppercase tracking-widest transition-colors duration-200 ${isDark
                                                    ? 'border-white/10 bg-white/5 text-cream/65 hover:bg-white/10'
                                                    : 'border-dark/10 bg-dark/5 text-dark/65 hover:bg-dark/10'
                                                    }`}
                                            >
                                                {note}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className={`mt-8 flex ${isRight ? 'justify-end' : 'justify-start'}`}>
                                    <a
                                        href={section.href}
                                        data-cursor="action"
                                        className={`inline-flex items-center justify-center gap-3 rounded-full px-8 py-4 font-body font-semibold transition-all duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 ${isDark
                                            ? 'brand-gradient text-dark focus-visible:ring-offset-dark'
                                            : 'bg-dark text-cream hover:bg-dark/90 focus-visible:ring-offset-cream'
                                            }`}
                                    >
                                        {section.cta}
                                        <ArrowUpRight size={20} strokeWidth={2} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>
                );
            })}
        </>
    );
}
// id="radar" id="research" href="/radar" href="/research"
// overlayCta cta
