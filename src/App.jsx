import React, { useEffect, useRef, useState } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Sobre from './components/Sobre';
import ComoAtuamos from './components/ComoAtuamos';
import Portfolio from './components/Portfolio';
import Fundadores from './components/Fundadores';
import Footer from './components/Footer';
import OrigamiStar from './components/OrigamiStar';

// Premium Features
import BrandCursor from './components/BrandCursor';
import HeroCanvas from './components/webgl/HeroCanvas';
import ImageHoverEffect from './components/webgl/ImageHoverEffect';
import ScrollVelocityReactor from './components/ScrollVelocityReactor';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [loading, setLoading] = useState(true);
  const loaderStarRef = useRef(null);
  const loaderBgRef = useRef(null);

  useEffect(() => {
    // --------------------------------------------------------
    // Lenis Smooth Scroll Setup
    // --------------------------------------------------------
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);
    lenis.on('scroll', ({ velocity }) => {
      document.documentElement.style.setProperty('--scroll-velocity', Math.abs(velocity).toFixed(2));
      document.body.dataset.scrollVelocity = Math.abs(velocity).toFixed(2);
    });

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // --------------------------------------------------------
    // Loading Sequence Animation (The Master's Crease)
    // --------------------------------------------------------
    const finishLoading = () => {
      setLoading(false);
      ScrollTrigger.refresh();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.dispatchEvent(new CustomEvent('loaderComplete'));
        });
      });
    };

    const fallbackTimer = setTimeout(finishLoading, 4000); // Extended for complex sequence

    if (loaderStarRef.current && loaderBgRef.current) {
      const thread = document.getElementById('loader-thread');
      const tl = gsap.timeline({
        onComplete: () => {
          clearTimeout(fallbackTimer);
          finishLoading();
        }
      });
      
      // The Master's Crease Sequence
      // 1. Thread slices across
      tl.to(thread, { width: '200px', duration: 0.8, ease: 'power4.inOut' })
        // 2. Thread pauses and pulses
        .to(thread, { height: '2px', boxShadow: '0 0 20px #FF6A00', duration: 0.2 })
        .to(thread, { opacity: 0, duration: 0.2, delay: 0.2 })
        // 3. Star takes over, already scaled down, and unfolds
        .fromTo(loaderStarRef.current, { scale: 0.1, rotationY: 90 }, { scale: 1.5, rotationY: 0, opacity: 1, duration: 1.2, ease: 'elastic.out(1, 0.5)' }, "-=0.2")
        // 4. Shrink and lock to Navbar
        .to(loaderStarRef.current, { y: '-40vh', x: '-40vw', scale: 0.5, duration: 1.2, ease: 'power3.inOut' }, "+=0.4")
        // 5. Fade out overlay
        .to(loaderBgRef.current, { opacity: 0, duration: 0.6 }, "-=0.4");
    }

    // --------------------------------------------------------
    // Body Background Transition Logic (Dark/Light themes)
    // --------------------------------------------------------
    const sections = gsap.utils.toArray('section[data-theme], footer[data-theme]');

    sections.forEach((section, i) => {
      const theme = section.getAttribute('data-theme');
      const targetBg = theme === 'dark' ? '#212121' : '#FDFAF4';

      ScrollTrigger.create({
        trigger: section,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => gsap.to(document.body, { backgroundColor: targetBg, duration: 0.5, overwrite: "auto" }),
        onEnterBack: () => gsap.to(document.body, { backgroundColor: targetBg, duration: 0.5, overwrite: "auto" })
      });
    });

    // --------------------------------------------------------
    // C. Parallax Depth via data-speed
    // --------------------------------------------------------
    const parallaxElements = gsap.utils.toArray('[data-speed]');
    parallaxElements.forEach((el) => {
      const speed = parseFloat(el.getAttribute('data-speed'));
      gsap.to(el, {
        y: (i, target) => {
          // If speed is 1 (default), no parallax relative displacement
          // If speed < 1, moves slower (lag behind)
          // If speed > 1, moves faster
          // We calculate a relative offset
          return -100 * (1 - speed);
        },
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });

    // --------------------------------------------------------
    // Origami Hinge Folding Engine
    // --------------------------------------------------------
    const mainSections = gsap.utils.toArray('main > section');
    // Only apply on non-touch devices for performance
    if (window.innerWidth >= 1024) {
      mainSections.forEach((section, index) => {
        // Skip hero
        if (index === 0) return;

        gsap.set(section, { transformPerspective: 1500, transformOrigin: 'top center' });
        
        ScrollTrigger.create({
          trigger: section,
          start: 'top bottom', // Start when top of section hits bottom of viewport
          end: 'top top',      // End when top of section hits top of viewport
          scrub: true,
          onUpdate: (self) => {
              // It starts folded in (90deg) and unfolds to flat (0deg)
              const rotation = (1 - self.progress) * 90;
              // Fade in slightly as it unfolds
              const opacity = 0.5 + (self.progress * 0.5);
              
              gsap.set(section, { 
                  rotationX: rotation,
                  opacity: opacity,
                  willChange: self.progress > 0 && self.progress < 1 ? 'transform, opacity' : 'auto'
              });
          }
        });

        // Fold away as it scrolls out top
        ScrollTrigger.create({
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            onUpdate: (self) => {
                // Folds backwards (-90deg)
                const rotation = self.progress * -90;
                gsap.set(section, {
                    rotationX: rotation,
                    willChange: self.progress > 0 && self.progress < 1 ? 'transform' : 'auto'
                });
            }
        });
      });
    }

    // --------------------------------------------------------
    // D. Origami Divider Unfold Animations
    // --------------------------------------------------------
    const dividers = gsap.utils.toArray('.brand-gradient-divider');
    dividers.forEach(divider => {
      gsap.to(divider, {
        scrollTrigger: {
          trigger: divider,
          start: "top 90%",
          toggleActions: "play none none reverse"
        },
        scaleX: 1,
        rotationY: 0,
        duration: 1,
        ease: "power3.out"
      });
    });

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach(t => t.kill());
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return (
    <>
      {/* Noise Overlay Filter globally applied */}
      <svg className="hidden">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
      </svg>
      <div className="noise-overlay" style={{ filter: 'url(#noiseFilter)' }}></div>

      {/* Initial Loader (removed from DOM after completion to avoid blocking interactions) */}
      {loading && (
        <div
          ref={loaderBgRef}
          className="fixed inset-0 z-[100] bg-dark flex flex-col items-center justify-center brand-gradient pointer-events-none"
        >
          <div className="absolute inset-0 bg-dark/95"></div>
          
          {/* The Master's Crease Thread */}
          <div id="loader-thread" className="relative z-10 h-[1px] w-0 brand-gradient opacity-100 mb-4"></div>
          
          <div ref={loaderStarRef} className="relative z-10 opacity-0 scale-50">
            <OrigamiStar className="w-16 h-16 main-loader-star" />
          </div>
        </div>
      )}

      <BrandCursor />
      <HeroCanvas />
      <ImageHoverEffect />
      <ScrollVelocityReactor />

      {/* Blueprint Navigation Overlay */}
      <div className="blueprint-nav-overlay pointer-events-none"></div>

      {/* Content wrapper with Blueprint 3D context */}
      <div className={loading ? "opacity-0" : "opacity-100 transition-opacity duration-300"}>
        <Navbar />
        <div id="blueprint-wrapper" className="blueprint-wrapper w-full h-full preserve-3d">
          <main>
            <Hero />
            <Sobre />
            <ComoAtuamos />
            <Portfolio />
            <Fundadores />
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}

export default App;
