import { useEffect, useRef, useState } from 'react';
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
        align: 'left',
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
        align: 'right',
        icon: BookOpenText,
        accent: 'RESEARCH',
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
            isDesktop: '(min-width: 1024px) and (min-height: 750px)',
            isMobile: '(max-width: 1023px), (max-height: 749px)',
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
                                className={`group relative flex w-full max-w-[850px] flex-col justify-between overflow-hidden rounded-[2.5rem] border p-10 shadow-2xl will-change-transform md:p-12 lg:p-16 ${isDark
                                    ? 'border-white/15 bg-[#181818]/65 text-cream shadow-black/40'
                                    : 'border-dark/10 bg-[#FFF8EA]/65 text-dark shadow-orange/10'
                                    } backdrop-blur-md`}
                            >
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className={`absolute ${isRight ? '-left-24' : '-right-24'} -top-24 h-72 w-72 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-80 ${isDark ? 'bg-orange/20 opacity-45' : 'bg-orange/15 opacity-60'}`} />
                                    <div className={`absolute bottom-0 left-0 h-[3px] w-full brand-gradient ${isDark ? 'opacity-80' : 'opacity-100'}`} />
                                </div>

                                <div className={`relative z-10 flex items-start gap-6 ${isRight ? 'justify-between flex-row-reverse' : 'justify-between flex-row'}`}>
                                    <span className={`font-mono text-xs uppercase tracking-widest border rounded-full px-4 py-1.5 ${isDark ? 'text-orange border-orange/40' : 'text-[#C2410C] border-[#C2410C]'}`}>
                                        {section.label}
                                    </span>

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

                                    <p className={`mt-8 font-body text-lg leading-relaxed md:text-xl ${isDark ? 'text-cream/70' : 'text-dark/70'} ${isRight ? 'ml-auto max-w-2xl' : 'mr-auto max-w-2xl'} line-clamp-3`}>
                                        {section.body}
                                    </p>
                                </div>

                                {/* Representative placeholder image with hover overlay action */}
                                <div className={`relative aspect-[16/9] w-full overflow-hidden rounded-2xl border mt-6 mb-8 ${isDark ? 'border-white/10' : 'border-dark/10'}`}>
                                    {index === 0 ? (
                                        <svg className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-110" viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
                                            <rect width="800" height="450" fill="#181818"/>
                                            <g opacity="0.1">
                                                <line x1="100" y1="0" x2="100" y2="450" stroke="#FF6A00" strokeWidth="1"/>
                                                <line x1="200" y1="0" x2="200" y2="450" stroke="#FF6A00" strokeWidth="1"/>
                                                <line x1="300" y1="0" x2="300" y2="450" stroke="#FF6A00" strokeWidth="1"/>
                                                <line x1="400" y1="0" x2="400" y2="450" stroke="#FF6A00" strokeWidth="1"/>
                                                <line x1="500" y1="0" x2="500" y2="450" stroke="#FF6A00" strokeWidth="1"/>
                                                <line x1="600" y1="0" x2="600" y2="450" stroke="#FF6A00" strokeWidth="1"/>
                                                <line x1="700" y1="0" x2="700" y2="450" stroke="#FF6A00" strokeWidth="1"/>
                                                
                                                <line x1="0" y1="50" x2="800" y2="50" stroke="#FF6A00" strokeWidth="1"/>
                                                <line x1="0" y1="100" x2="800" y2="100" stroke="#FF6A00" strokeWidth="1"/>
                                                <line x1="0" y1="150" x2="800" y2="150" stroke="#FF6A00" strokeWidth="1"/>
                                                <line x1="0" y1="200" x2="800" y2="200" stroke="#FF6A00" strokeWidth="1"/>
                                                <line x1="0" y1="250" x2="800" y2="250" stroke="#FF6A00" strokeWidth="1"/>
                                                <line x1="0" y1="300" x2="800" y2="300" stroke="#FF6A00" strokeWidth="1"/>
                                                <line x1="0" y1="350" x2="800" y2="350" stroke="#FF6A00" strokeWidth="1"/>
                                                <line x1="0" y1="400" x2="800" y2="400" stroke="#FF6A00" strokeWidth="1"/>
                                            </g>
                                            <circle cx="400" cy="225" r="80" stroke="#FF6A00" strokeOpacity="0.2" strokeWidth="1.5" strokeDasharray="6 6"/>
                                            <circle cx="400" cy="225" r="160" stroke="#FF6A00" strokeOpacity="0.25" strokeWidth="1.5"/>
                                            <circle cx="400" cy="225" r="240" stroke="#FF6A00" strokeOpacity="0.1" strokeWidth="1"/>
                                            
                                            <defs>
                                                <linearGradient id="radarSweep" x1="400" y1="225" x2="560" y2="85" gradientUnits="userSpaceOnUse">
                                                    <stop offset="0%" stopColor="#FF6A00" stopOpacity="0"/>
                                                    <stop offset="100%" stopColor="#FF8A1C" stopOpacity="0.3"/>
                                                </linearGradient>
                                            </defs>
                                            <path d="M 400 225 L 560 85 A 200 200 0 0 0 400 25 Z" fill="url(#radarSweep)"/>
                                            
                                            <circle cx="480" cy="140" r="6" fill="#FF8A1C" fillOpacity="0.9"/>
                                            <circle cx="480" cy="140" r="12" stroke="#FF8A1C" strokeWidth="1" strokeOpacity="0.5"/>
                                            
                                            <circle cx="300" cy="290" r="4" fill="#FF6A00" fillOpacity="0.7"/>
                                            <circle cx="580" cy="270" r="5" fill="#FF6A00" fillOpacity="0.6"/>
                                            <circle cx="260" cy="130" r="5" fill="#FF8A1C" fillOpacity="0.8"/>
                                        </svg>
                                    ) : (
                                        <svg className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-110" viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
                                            <rect width="800" height="450" fill="#FFF8EA"/>
                                            <g opacity="0.08">
                                                <line x1="50" y1="0" x2="50" y2="450" stroke="#000000" strokeWidth="0.5"/>
                                                <line x1="100" y1="0" x2="100" y2="450" stroke="#000000" strokeWidth="0.5"/>
                                                <line x1="150" y1="0" x2="150" y2="450" stroke="#000000" strokeWidth="0.5"/>
                                                <line x1="200" y1="0" x2="200" y2="450" stroke="#000000" strokeWidth="0.5"/>
                                                <line x1="250" y1="0" x2="250" y2="450" stroke="#000000" strokeWidth="0.5"/>
                                                <line x1="300" y1="0" x2="300" y2="450" stroke="#000000" strokeWidth="0.5"/>
                                                <line x1="350" y1="0" x2="350" y2="450" stroke="#000000" strokeWidth="0.5"/>
                                                <line x1="400" y1="0" x2="400" y2="450" stroke="#000000" strokeWidth="0.5"/>
                                                <line x1="450" y1="0" x2="450" y2="450" stroke="#000000" strokeWidth="0.5"/>
                                                <line x1="500" y1="0" x2="500" y2="450" stroke="#000000" strokeWidth="0.5"/>
                                                <line x1="550" y1="0" x2="550" y2="450" stroke="#000000" strokeWidth="0.5"/>
                                                <line x1="600" y1="0" x2="600" y2="450" stroke="#000000" strokeWidth="0.5"/>
                                                <line x1="650" y1="0" x2="650" y2="450" stroke="#000000" strokeWidth="0.5"/>
                                                <line x1="700" y1="0" x2="700" y2="450" stroke="#000000" strokeWidth="0.5"/>
                                                <line x1="750" y1="0" x2="750" y2="450" stroke="#000000" strokeWidth="0.5"/>
                                                
                                                <line x1="0" y1="50" x2="800" y2="50" stroke="#000000" strokeWidth="0.5"/>
                                                <line x1="0" y1="100" x2="800" y2="100" stroke="#000000" strokeWidth="0.5"/>
                                                <line x1="0" y1="150" x2="800" y2="150" stroke="#000000" strokeWidth="0.5"/>
                                                <line x1="0" y1="200" x2="800" y2="200" stroke="#000000" strokeWidth="0.5"/>
                                                <line x1="0" y1="250" x2="800" y2="250" stroke="#000000" strokeWidth="0.5"/>
                                                <line x1="0" y1="300" x2="800" y2="300" stroke="#000000" strokeWidth="0.5"/>
                                                <line x1="0" y1="350" x2="800" y2="350" stroke="#000000" strokeWidth="0.5"/>
                                                <line x1="0" y1="400" x2="800" y2="400" stroke="#000000" strokeWidth="0.5"/>
                                            </g>
                                            <path d="M 220 180 L 380 120 L 580 160 L 500 320 L 320 280 Z" stroke="#FF6A00" strokeOpacity="0.25" strokeWidth="2"/>
                                            <path d="M 380 120 L 320 280 M 580 160 L 320 280 M 380 120 L 500 320" stroke="#FF6A00" strokeOpacity="0.15" strokeWidth="1.5"/>
                                            
                                            <circle cx="220" cy="180" r="9" fill="#FF8A1C" fillOpacity="0.9"/>
                                            <circle cx="380" cy="120" r="12" fill="#FF6A00" fillOpacity="0.9"/>
                                            <circle cx="380" cy="120" r="20" stroke="#FF6A00" strokeWidth="1" strokeOpacity="0.4"/>
                                            <circle cx="580" cy="160" r="8" fill="#FFA52E" fillOpacity="0.9"/>
                                            <circle cx="500" cy="320" r="10" fill="#FF8A1C" fillOpacity="0.9"/>
                                            <circle cx="320" cy="280" r="13" fill="#FFA52E" fillOpacity="0.9"/>
                                            <circle cx="320" cy="280" r="22" stroke="#FFA52E" strokeWidth="1" strokeOpacity="0.4"/>
                                        </svg>
                                    )}
 
                                    {/* Hover Overlay Action (desktop) / Tap target (mobile) */}
                                    {isStickyActive ? (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-sm transition-all duration-300 ease-out group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto z-20">
                                            <a
                                                href={section.href}
                                                data-cursor="action"
                                                className={`inline-flex items-center justify-center gap-3 rounded-full px-8 py-4 font-body font-semibold transform translate-y-4 transition-transform duration-500 ease-out group-hover:translate-y-0 ${isDark
                                                    ? 'brand-gradient text-dark'
                                                    : 'bg-cream text-dark hover:bg-cream/90'
                                                    }`}
                                            >
                                                {section.cta}
                                                <ArrowUpRight size={20} strokeWidth={2} />
                                            </a>
                                        </div>
                                    ) : (
                                        <a href={section.href} className="absolute inset-0 z-20" aria-label={section.cta}>
                                            <span className="sr-only">{section.cta}</span>
                                        </a>
                                    )}
                                </div>
 
                                <div className={`relative z-10 flex flex-col gap-8 md:items-center ${isRight ? 'md:flex-row-reverse md:justify-between' : 'md:flex-row md:justify-between'}`}>
                                    <div className={`flex flex-wrap gap-3 ${isRight ? 'justify-end' : 'justify-start'}`}>
                                        {section.notes.map((note) => (
                                            <span
                                                key={note}
                                                className={`rounded-full border px-4 py-1.5 font-mono text-[0.7rem] uppercase tracking-widest ${isDark
                                                    ? 'border-white/10 bg-white/5 text-cream/65'
                                                    : 'border-dark/10 bg-dark/5 text-dark/65'
                                                    }`}
                                            >
                                                {note}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {!isStickyActive && (
                                    <div className={`mt-8 flex ${isRight ? 'justify-end' : 'justify-start'}`}>
                                        <a
                                            href={section.href}
                                            data-cursor="action"
                                            className={`inline-flex items-center justify-center gap-3 rounded-full px-8 py-4 font-body font-semibold ${isDark
                                                ? 'brand-gradient text-dark'
                                                : 'bg-dark text-cream hover:bg-dark/90'
                                                }`}
                                        >
                                            {section.cta}
                                            <ArrowUpRight size={20} strokeWidth={2} />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                );
            })}
        </>
    );
}
// id="radar" id="research" href="/radar" href="/research"
