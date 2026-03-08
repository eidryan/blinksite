import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
    const footerRef = useRef(null);
    const textRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(textRef.current, {
                scrollTrigger: {
                    trigger: footerRef.current,
                    start: "top 60%",
                },
                y: 50,
                opacity: 0,
                rotateX: -10,
                duration: 1.2,
                ease: "power3.out"
            });
        }, footerRef);
        return () => ctx.revert();
    }, []);

    return (
        <footer
            id="contato"
            ref={footerRef}
            data-theme="dark"
            className="bg-[#1A1A1A] pt-32 pb-10 px-6 lg:px-20 text-cream relative"
            style={{ borderRadius: '6rem 6rem 0 0', marginTop: '-3rem', zIndex: 10 }}
        >
            <div className="absolute top-0 left-0 w-full brand-gradient-divider" style={{ borderRadius: '6rem 6rem 0 0' }}></div>
            <div className="max-w-7xl mx-auto flex flex-col justify-between min-h-[50vh]">

                <div>
                    <div className="flex justify-between items-start mb-16">
                        <span className="font-mono text-xs uppercase tracking-widest text-orange border border-orange/40 rounded-full px-3 py-1">
                            05 — Contato
                        </span>
                        {/* Origami Arrow Easter Egg */}
                        <div className="w-6 h-6 opacity-60 origin-center -rotate-45" style={{ perspective: '300px' }}>
                            <svg viewBox="0 0 100 100" fill="none">
                                <polygon points="20,80 80,80 50,20" fill="#FF6A00" />
                                <polygon points="50,20 80,80 70,90 50,40" fill="#F21A1A" />
                            </svg>
                        </div>
                    </div>

                    <h2 ref={textRef} className="font-display font-semibold text-5xl lg:text-8xl mb-6 tracking-tight">
                        <span className="clip-text-wrap inline-block">
                            <span className="word-inner clip-text-inner inline-block" style={{ transform: 'rotateX(0deg) translateY(0px)' }}>Vamos</span>
                        </span>
                        <br/>
                        <span className="clip-text-wrap inline-block">
                            <span className="word-inner clip-text-inner inline-block" style={{ transform: 'rotateX(0deg) translateY(0px)' }}>conversar.</span>
                        </span>
                    </h2>
                    <p className="font-body text-xl lg:text-2xl text-cream/70 max-w-2xl">
                        Uma conversa sem compromisso. Se fizer sentido, a gente constrói junto.
                    </p>
                </div>

                <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Main CTAs */}
                    <div className="lg:col-span-2">
                        <a
                            href="mailto:contato@blinkgroup.com.br"
                            data-cursor="action"
                            className="inline-flex items-center justify-center brand-gradient text-dark font-body font-bold text-xl lg:text-2xl px-10 py-5 rounded-full transition-transform mb-4 mr-4 group relative overflow-hidden"
                            style={{ transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
                            onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const y = e.clientY - rect.top;
                                const width = rect.width;
                                const angle = (x / width) * 135;
                                e.currentTarget.style.setProperty('--gradient-angle', `${angle}deg`);
                                
                                const centerX = rect.left + rect.width / 2;
                                const centerY = rect.top + rect.height / 2;
                                const pullX = (e.clientX - centerX) * 0.15;
                                const pullY = (e.clientY - centerY) * 0.15;
                                e.currentTarget.style.transform = `translate(${pullX}px, ${pullY}px) scale(1.05)`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.setProperty('--gradient-angle', `135deg`);
                                e.currentTarget.style.transform = `translate(0px, 0px) scale(1)`;
                            }}
                        >
                            Fale Conosco
                        </a>
                    </div>

                    {/* Contact Links */}
                    <div className="flex flex-col gap-4 font-body text-lg">
                        <p className="font-mono text-xs tracking-widest text-orange uppercase mb-2">Conecte-se</p>
                        <a href="https://wa.me/5521999999999" target="_blank" rel="noreferrer" data-cursor="link" className="hover:text-orange transition-colors">WhatsApp</a>
                        <a href="mailto:contato@blinkgroup.com.br" data-cursor="link" className="hover:text-orange transition-colors">contato@blinkgroup.com.br</a>
                        <a href="https://linkedin.com/company/blink-tecnologia" target="_blank" rel="noreferrer" data-cursor="link" className="hover:text-orange transition-colors">LinkedIn</a>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-24 pt-8 flex flex-col lg:flex-row justify-between items-center gap-4 font-mono text-[10px] lg:text-xs text-cream/40 tracking-widest uppercase">
                    <p>© {new Date().getFullYear()} Blink Tecnologia. Rio de Janeiro, Brasil.</p>
                    <p>Feito com obsessão por detalhes.</p>
                </div>

            </div>
        </footer>
    );
}
