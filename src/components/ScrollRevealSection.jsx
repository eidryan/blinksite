import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import DitherReveal from "./ui/DitherReveal";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollRevealSection({ hero, children }) {
    const containerRef = useRef(null);
    const shaderRef = useRef(null);
    const contentRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "+=150%", // 150vh scroll duration for the tunnel
                    pin: true,
                    scrub: 0.5,
                    anticipatePin: 1,
                }
            });

            // 1 & 2. Tying WebGL and clipPath mathematically
            // This ensures the CSS clip-path perfectly tracks the WebGL innerRadius.
            // In the shader: innerRadius = p * 1.6 - 0.25
            tl.to({ p: 0 }, {
                p: 1.0,
                ease: "none",
                onUpdate: function () {
                    const p = this.targets()[0].p;
                    if (shaderRef.current) {
                        shaderRef.current.progress = p;
                    }
                    if (contentRef.current) {
                        if (p > 0.99) {
                            contentRef.current.style.clipPath = 'none';
                        } else {
                            let r = p * 1.6 - 0.25;
                            r = Math.max(0, r); // Clamp to 0
                            contentRef.current.style.clipPath = `circle(${r * 100}vh at 50% 50vh)`;
                        }
                    }
                }
            }, 0);

            // 3. Zoom effect on the revealed content (ONLY the first section)
            // By targeting the first child, we prevent the entire 6000px page from scaling 
            // and pulling lower sections like "Como Atuamos" into the viewport unexpectedly.
            if (contentRef.current && contentRef.current.firstElementChild) {
                tl.fromTo(contentRef.current.firstElementChild,
                    { scale: 0.75, transformOrigin: "50% 50vh" },
                    { scale: 1.0, transformOrigin: "50% 50vh", ease: "none" },
                    0);
            }

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="relative w-full z-0">

            {/* Layer 0: The Hero block. Positioned absolute at the top so it sits behind the content. */}
            {/* It will just be visually covered by the content layer growing over it. */}
            <div className="absolute top-0 left-0 w-full h-screen z-0">
                {hero}
            </div>

            {/* Layer 1: The rest of the page content. */}
            {/* Starts fully clipped (invisible), and geometrically expands via clip-path. */}
            {/* bg-cream is critical so it actually masks the Hero when unclipped. */}
            <div
                ref={contentRef}
                className="relative z-10 w-full min-h-screen bg-cream"
            >
                {children}
            </div>

            {/* Layer 2: The WebGL Overlay. */}
            {/* Absolute top-0 h-screen ensures it only covers the viewport during the pin. */}
            {/* When the pin ends and the user scrolls down, this canvas naturally scrolls away. */}
            <div className="absolute top-0 left-0 w-full h-screen z-20 pointer-events-none">
                <DitherReveal ref={shaderRef} />
            </div>

        </div>
    );
}
