import React from 'react';

export default function Footer() {
    const whatsappHref = 'https://wa.me/5521990230538';
    const linkedInHref = 'https://www.linkedin.com/company/blinkbr';

    return (
        <footer
            id="contato"
            data-theme="dark"
            className="bg-[#1A1A1A] pt-32 pb-10 px-6 lg:px-20 text-cream relative"
            style={{ borderRadius: '3rem 3rem 0 0' }}
        >
            {/* Brand divider visually placed inside the rounded top */}
            <div className="absolute top-0 left-0 w-full brand-gradient-divider" style={{ borderRadius: '3rem 3rem 0 0' }}></div>
            <div className="max-w-7xl mx-auto flex flex-col justify-between min-h-[50vh]">

                <div>
                    <div className="flex justify-between items-start mb-16">
                        <span className="font-mono text-xs uppercase tracking-widest text-orange border border-orange/40 rounded-full px-3 py-1">
                            05. Contato
                        </span>
                        {/* Origami Arrow Easter Egg */}
                        <div className="w-6 h-6 opacity-60 animate-[breathe_6s_infinite] origin-center -rotate-45" style={{ perspective: '300px' }}>
                            <svg viewBox="0 0 100 100" fill="none">
                                <polygon points="20,80 80,80 50,20" fill="#FF6A00" />
                                <polygon points="50,20 80,80 70,90 50,40" fill="#F21A1A" />
                            </svg>
                        </div>
                    </div>

                    <h2 className="font-display font-semibold text-5xl lg:text-7xl mb-6">
                        Vamos conversar.
                    </h2>
                    <p className="font-body text-xl lg:text-2xl text-cream/70 max-w-2xl">
                        Fale com a Blink pelo WhatsApp. Se fizer sentido, a gente avança juntos.
                    </p>
                </div>

                <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Main CTAs */}
                    <div className="lg:col-span-2">
                        <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noreferrer"
                            data-cursor="action"
                            className="inline-block brand-gradient text-dark font-body font-bold text-xl lg:text-2xl px-8 py-4 rounded-full hover:scale-105 transition-transform mb-4 mr-4"
                        >
                            Fale Conosco
                        </a>
                    </div>

                    {/* Contact Links */}
                    <div className="flex flex-col gap-4 font-body text-lg">
                        <p className="font-mono text-xs tracking-widest text-orange uppercase mb-2">Conecte-se</p>
                        <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noreferrer"
                            data-cursor="link"
                            className="hover:text-orange transition-colors"
                        >
                            WhatsApp
                        </a>
                        <a href="mailto:contato@blinkgroup.com.br" data-cursor="link" className="hover:text-orange transition-colors">contato@blinkgroup.com.br</a>
                        <a
                            href={linkedInHref}
                            target="_blank"
                            rel="noreferrer"
                            data-cursor="link"
                            className="hover:text-orange transition-colors"
                        >
                            LinkedIn
                        </a>
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

