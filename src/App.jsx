import React, { useEffect, useRef, useState } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Sobre from './components/Sobre';
import ComoAtuamos from './components/ComoAtuamos';
import Portfolio from './components/Portfolio';
import RadarResearchSections from './components/RadarResearchSections';
import Fundadores from './components/Fundadores';
import Footer from './components/Footer';
import brandLogoCompleteWhite from './assets/brand/LogoBlink_Completa_Branca.png';
import ScrollRevealSection from './components/ScrollRevealSection';

// Premium Features
import BrandCursor from './components/BrandCursor';
import ImageHoverEffect from './components/webgl/ImageHoverEffect';
import ScrollVelocityReactor from './components/ScrollVelocityReactor';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [loading, setLoading] = useState(true);
  const loaderStarRef = useRef(null);
  const loaderBgRef = useRef(null);
  const loadingDoneRef = useRef(false);

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
    // Loading Sequence Animation
    // --------------------------------------------------------
    const finishLoading = () => {
      if (loadingDoneRef.current) return;
      loadingDoneRef.current = true;
      setLoading(false);
      ScrollTrigger.refresh();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.dispatchEvent(new CustomEvent('loaderComplete'));
        });
      });
    };

    // Safety fallback: always reveal content after 2.5s even if GSAP fails
    const fallbackTimer = setTimeout(finishLoading, 2500);
    const onWindowLoad = () => finishLoading();
    window.addEventListener('load', onWindowLoad);

    if (loaderStarRef.current && loaderBgRef.current) {
      const tl = gsap.timeline({
        onComplete: () => {
          clearTimeout(fallbackTimer);
          finishLoading();
        }
      });
      // Sequence: scale star up, fade in
      tl.to(loaderStarRef.current, { scale: 1, opacity: 1, duration: 0.6, ease: 'power2.out' })
        // Translate up to navbar area while shrinking
        .to(loaderStarRef.current, { y: '-40vh', scale: 0.8, duration: 0.8, ease: 'power3.inOut' })
        // Fade out overlay
        .to(loaderBgRef.current, { opacity: 0, duration: 0.4 }, "-=0.2");
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
      window.removeEventListener('load', onWindowLoad);
    };
  }, []);

  return (
    <>

      {/* Initial Loader (removed from DOM after completion to avoid blocking interactions) */}
      {loading && (
        <div
          ref={loaderBgRef}
          className="fixed inset-0 z-[100] bg-dark flex items-center justify-center brand-gradient pointer-events-none"
        >
          {/* Overriding gradient visually, just mixing dark background */}
          <div className="absolute inset-0 bg-dark/95"></div>
          <div ref={loaderStarRef} className="relative z-10 opacity-0 scale-50 w-48 md:w-64">
            <img src={brandLogoCompleteWhite} alt="Blink Logo" className="w-full h-auto object-contain" />
          </div>
        </div>
      )}

      <BrandCursor />
      <ImageHoverEffect />
      <ScrollVelocityReactor />

      {/* Content wrapper */}
      <div className={loading ? "opacity-100" : "opacity-100 transition-opacity duration-300"}>
        <Navbar />
        <main>
          {/* ScrollRevealSection ONLY contains the Hero and the first section to transition seamlessly.
              Wait! If it only wraps Sobre, then ComoAtuamos flows naturally below the pin-spacer! */}
          <ScrollRevealSection hero={<Hero />}>
            <Sobre />
          </ScrollRevealSection>
          <ComoAtuamos />
          <Portfolio />
          <RadarResearchSections />
          <Fundadores />
          <Footer />
        </main>
      </div>
    </>
  );
}

export default App;
