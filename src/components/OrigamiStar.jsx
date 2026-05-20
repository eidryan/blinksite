import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function OrigamiStar({ className = "w-10 h-10", style, isLoaded = false }) {
    const containerRef = useRef(null);

    // Create refs for individual polygon faces to fold them independently
    const face1 = useRef(null);
    const face2 = useRef(null);
    const face3 = useRef(null);
    const face4 = useRef(null);
    const face5 = useRef(null);

    useEffect(() => {
        // Prevent double-running if this is just a decorative instance that isn't the main loader
        if (!containerRef.current || !containerRef.current.classList.contains('main-loader-star')) return;

        // A. Page Load - Star unfold (CSS 3D illusion)
        // The star starts as a flat horizontal line, then folds open
        const faces = [face1.current, face2.current, face3.current, face4.current, face5.current];

        // Initial flat state
        gsap.set(containerRef.current, { scaleY: 0.02, rotationX: 90 });
        gsap.set(faces, { rotationX: 180 }); // Folded tight

        // Sequence
        const tl = gsap.timeline();

        // Container stretches to proper height while rotating forward slightly
        tl.to(containerRef.current, {
            scaleY: 1,
            rotationX: 0,
            duration: 0.8,
            ease: "power2.out"
        });

        // Faces bloom open in staggering sequence
        faces.forEach((face, idx) => {
            tl.to(face, {
                rotationX: 0,
                duration: 0.8,
                ease: "back.out(1.5)",
            }, i => i * 0.05 + 0.2); // slight stagger
        });

    }, []);

    return (
        <div
            ref={containerRef}
            className={`preserve-3d-wrapper ${className}`}
            style={{ ...style, perspective: '600px', transformStyle: 'preserve-3d' }}
        >
            <svg
                className="w-full h-full star-svg transition-transform duration-500 hover:scale-105"
                viewBox="0 0 100 100"
                fill="none"
                style={{ transformStyle: 'preserve-3d', overflow: 'visible' }}
                xmlns="http://www.w3.org/2000/svg"
                onMouseEnter={(e) => {
                    gsap.to([face1.current, face2.current, face3.current, face4.current, face5.current], {
                        rotationX: (i) => i % 2 === 0 ? 5 : -5,
                        rotationY: (i) => i % 2 === 0 ? -3 : 3,
                        duration: 0.4,
                        ease: "back.out(2)"
                    });
                }}
                onMouseLeave={(e) => {
                    gsap.to([face1.current, face2.current, face3.current, face4.current, face5.current], {
                        rotationX: 0,
                        rotationY: 0,
                        duration: 0.6,
                        ease: "elastic.out(1, 0.4)"
                    });
                }}
            >
                <defs>
                    {/* Gradients to enhance the 3D folded paper look */}
                    <linearGradient id="fold-light" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFA52E" />
                        <stop offset="100%" stopColor="#FF8A1C" />
                    </linearGradient>
                    <linearGradient id="fold-main" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF8A1C" />
                        <stop offset="100%" stopColor="#FF6A00" />
                    </linearGradient>
                    <linearGradient id="fold-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF6A00" />
                        <stop offset="100%" stopColor="#F21A1A" />
                    </linearGradient>
                    <linearGradient id="fold-deep" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F21A1A" />
                        <stop offset="100%" stopColor="#C81010" />
                    </linearGradient>
                </defs>

                <g style={{ transformStyle: 'preserve-3d' }}>
                    {/* Top-left point elongates upward-left */}
                    <g ref={face1} style={{ transformOrigin: '50px 50px', transformStyle: 'preserve-3d' }}>
                        {/* Top Light Face */}
                        <polygon points="50,50 15,10 40,50" fill="url(#fold-light)" />
                    </g>

                    <g ref={face2} style={{ transformOrigin: '50px 50px', transformStyle: 'preserve-3d' }}>
                        {/* Right Shadow Face */}
                        <polygon points="50,50 85,30 40,50" fill="url(#fold-deep)" />
                    </g>

                    <g ref={face3} style={{ transformOrigin: '50px 50px', transformStyle: 'preserve-3d' }}>
                        {/* Bottom Right extending down-right Main Face */}
                        <polygon points="50,50 85,30 90,95" fill="url(#fold-main)" />
                    </g>

                    <g ref={face4} style={{ transformOrigin: '50px 50px', transformStyle: 'preserve-3d' }}>
                        {/* Bottom Left Deep Shadow Face */}
                        <polygon points="50,50 90,95 20,75" fill="url(#fold-shadow)" />
                    </g>

                    <g ref={face5} style={{ transformOrigin: '50px 50px', transformStyle: 'preserve-3d' }}>
                        {/* Left returning Face */}
                        <polygon points="50,50 20,75 15,10" fill="url(#fold-deep)" opacity="0.9" />
                    </g>

                    {/* Center overlaps to give more fold dimension - kept static relative to center */}
                    <polygon points="50,50 40,50 15,10" fill="#FFA52E" opacity="0.8" />
                    <polygon points="50,50 40,50 85,30" fill="#FF6A00" opacity="0.9" />
                    <polygon points="50,50 85,30 90,95" fill="#F21A1A" opacity="0.85" />
                </g>
            </svg>
        </div>
    );
}

