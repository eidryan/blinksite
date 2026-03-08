import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import OrigamiStar from './OrigamiStar';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [blueprintOpen, setBlueprintOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > window.innerHeight * 0.9) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleBlueprint = () => {
        setBlueprintOpen(!blueprintOpen);
        document.body.classList.toggle('blueprint-active');
    };

    const closeBlueprint = () => {
        setBlueprintOpen(false);
        document.body.classList.remove('blueprint-active');
    };

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
                className={`fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center justify-between px-6 py-3 rounded-full transition-all duration-400 ease-in-out w-[90%] max-w-5xl ${isScrolled || blueprintOpen
                    ? 'bg-[#FDFAF4]/80 backdrop-blur-md text-dark border border-[#FF6A00]/15'
                    : 'bg-transparent text-cream border border-transparent'
                    }`}
            >
                <div className="flex items-center gap-3 cursor-pointer" onClick={closeBlueprint}>
                    <OrigamiStar className="w-8 h-8" />
                    <span className="font-display font-semibold lowercase text-xl mt-1 tracking-tight">blink</span>
                </div>

                {/* Blueprint Toggle Button */}
                <button
                    className="p-2 flex items-center gap-2 group hover:text-orange transition-colors"
                    onClick={toggleBlueprint}
                    data-cursor="action"
                >
                    <span className="hidden lg:block font-mono text-xs uppercase tracking-widest mt-1">
                        {blueprintOpen ? 'Fechar' : 'Explorar'}
                    </span>
                    {blueprintOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Blueprint 3D Overlay Navigation */}
            {blueprintOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto" style={{ perspective: '1200px' }}>
                    <div className="flex flex-col items-center gap-6 lg:gap-10 font-display text-5xl lg:text-7xl"
                         style={{ transform: 'rotateX(-10deg)', transformStyle: 'preserve-3d' }}>
                        {navLinks.map((link, i) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={closeBlueprint}
                                data-cursor="link"
                                className="text-cream/40 hover:text-orange transition-all duration-500 hover:scale-110 hover:translate-z-10 group relative block"
                                style={{ 
                                    animation: `fadeInUp 0.5s ease forwards ${i * 0.1}s`,
                                    opacity: 0,
                                    transform: 'translateY(30px) rotateX(10deg)'
                                }}
                            >
                                <span className="absolute -left-12 top-1/2 -translate-y-1/2 text-xs font-mono tracking-widest text-cream/20 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block">
                                    0{i + 1} —
                                </span>
                                {link.name}
                            </a>
                        ))}
                    </div>
                </div>
            )}
            
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes fadeInUp {
                    to {
                        opacity: 1;
                        transform: translateY(0) rotateX(0deg);
                    }
                }
            `}} />
        </>
    );
}
