import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import logoBrancaCompleta from '../assets/brand/LogoBlink_Completa_Branca.png';
import logoPretaCompleta from '../assets/brand/LogoBlink_Completa_Preta.png';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const whatsappHref = 'https://wa.me/5521990230538';

    useEffect(() => {
        const handleScroll = () => {
            // Transition navbar when past hero (assumed hero is ~100vh)
            if (window.scrollY > window.innerHeight * 0.9) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);

        // ScrollSpy Observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, { rootMargin: '-30% 0px -70% 0px' });

        const sections = document.querySelectorAll('section[id], footer[id]');
        sections.forEach(section => observer.observe(section));

        return () => {
            window.removeEventListener('scroll', handleScroll);
            sections.forEach(section => observer.unobserve(section));
        };
    }, []);

    const navLinks = [
        { name: 'Sobre', href: '#sobre' },
        { name: 'Como Atuamos', href: '#como-atuamos' },
        { name: 'Portfólio', href: '#portfolio' },
        { name: 'Fundadores', href: '#fundadores' },
        { name: 'Contato', href: '#contato' },
    ];

    return (
        <>
            <nav
                className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 py-3 rounded-full transition-all duration-400 ease-in-out w-[90%] max-w-5xl ${isScrolled
                    ? 'bg-[#FDFAF4]/80 backdrop-blur-md text-dark border border-[#FF6A00]/15'
                    : 'bg-transparent text-cream border border-transparent'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <img
                        src={isScrolled ? logoPretaCompleta : logoBrancaCompleta}
                        alt="Blink"
                        className={`w-auto transition-all duration-300 ${isScrolled ? 'h-12 lg:h-14' : 'h-14 lg:h-16'}`}
                    />
                </div>

                {/* Desktop Links */}
                <div className="hidden lg:flex items-center gap-8 font-body font-medium text-sm">
                    {navLinks.map((link) => {
                        const sectionId = link.href.substring(1);
                        const isActive = activeSection === sectionId;
                        return (
                            <a
                                key={link.name}
                                href={link.href}
                                data-cursor="link"
                                className={`relative hover:text-orange py-1 transition-colors ${isActive ? 'text-orange' : ''}`}
                            >
                                {link.name}
                                {isActive && (
                                    <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-orange rounded-full animate-[underlineSlide_0.3s_ease-out]" />
                                )}
                            </a>
                        );
                    })}
                </div>

                {/* Desktop CTA */}
                <div className="hidden lg:block">
                    <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noreferrer"
                        data-cursor="action"
                        className="brand-gradient text-dark font-body font-semibold text-sm px-6 py-2.5 rounded-full hover:scale-105 transition-transform inline-block relative overflow-hidden group"
                        onMouseMove={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const width = rect.width;
                            // Map x position linearly from 0deg (left edge) to 135deg (right edge)
                            const angle = (x / width) * 135;
                            e.currentTarget.style.setProperty('--gradient-angle', `${angle}deg`);
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.setProperty('--gradient-angle', `135deg`);
                        }}
                    >
                        Fale Conosco
                    </a>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="lg:hidden p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Mobile Menu Fullscreen Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-dark text-cream flex flex-col justify-center items-center">
                    <div className="flex flex-col items-center gap-8 font-display text-4xl">
                        {navLinks.map((link) => {
                            const sectionId = link.href.substring(1);
                            const isActive = activeSection === sectionId;
                            return (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`relative hover:text-orange transition-colors ${isActive ? 'text-orange' : ''}`}
                                >
                                    {link.name}
                                </a>
                            );
                        })}
                        <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => setMobileMenuOpen(false)}
                            className="mt-8 brand-gradient text-dark font-body font-semibold text-lg px-8 py-4 rounded-full"
                        >
                            Fale Conosco
                        </a>
                    </div>
                </div>
            )}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes underlineSlide {
                    from { transform: scaleX(0); transform-origin: left; }
                    to { transform: scaleX(1); transform-origin: left; }
                }
            `}} />
        </>
    );
}
