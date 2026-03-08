#  Blink Institutional Site — Prompt 3: Refinement & Diamond Polish

## Role

You are a senior front-end engineer performing a surgical refinement pass on an institutional site for Blink — a Brazilian tech holding company. The site was built in two prior passes: Prompt 1 (foundation: layout, Lenis, GSAP scroll animations, clip-path reveals, section transitions) and Prompt 2 (premium layer: custom cursor, Three.js WebGL hero canvas, image hover shaders, scroll velocity reactions, horizontal scroll pin, origami CSS 3D).

**You must read `docs/AWARD_SITE_STANDARDS.md` before writing a single line of code.** That file is a formal judge's audit of the current codebase against Awwwards Site of the Year (2023–2025) standards. Every fix in this prompt was derived from it.

**What this prompt builds:**

- All Critical (🔴) and High Priority (🟡) fixes from the audit
- A new origami-geometric WebGL hero canvas replacing the current noise-blob shader
- A redesigned Fundadores section with two side-by-side founder spaces
- Architecture hooks for any Prompt 4 work

**What this prompt does NOT change:**

- Brand identity, color palette, typography system, copy
- The Lenis/GSAP core architecture
- The BrandCursor system (only bug-fixed, not redesigned)
- Any section other than Hero canvas and Fundadores layout

**Critical rule:** Nothing that works correctly in Prompt 1 or 2 should break. This is a fix-and-upgrade pass, not a rebuild.

---

## Reference Files — Read Before Starting


| File                           | Purpose                                                              |
| ------------------------------ | -------------------------------------------------------------------- |
| `docs/AWARD_SITE_STANDARDS.md` | Full audit — every fix in this prompt originates here                |
| `blink-prompt-1-foundation.md` | Original architecture decisions and brand rules                      |
| `blink-prompt-2-premium.md`    | Premium layer spec — understand what was intended before fixing bugs |


---

## Section 1 — Critical Bug Fixes

Fix every 🔴 item from the audit exactly as described. The order matters — fix infrastructure first, then visual.

### 1.1 Font Loading (Performance — Blocks FCP)

**Problem:** Google Fonts is loaded via `@import` in `src/index.css`, which is render-blocking.

**Fix:** Remove the `@import` from `index.css`. In `index.html`, add before the closing `</head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400&family=MuseoModerno:ital,wght@0,200..800;1,200..800&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap">
```

Note `display=swap` at the end — this is critical for preventing invisible text during load.

---

### 1.2 GSAP Plugin Registration (Architecture)

**Problem:** `gsap.registerPlugin(ScrollTrigger)` is called in `App.jsx`, `Sobre.jsx`, `ComoAtuamos.jsx`, and `Portfolio.jsx`. Redundant, indicates architectural inconsistency.

**Fix:** Keep the registration only in `App.jsx` (first file to run). Remove the `gsap.registerPlugin(ScrollTrigger)` call from `Sobre.jsx`, `ComoAtuamos.jsx`, and `Portfolio.jsx`. The plugin is global after first registration.

---

### 1.3 OrigamiStar Loader — Dead Code Fix

**Problem:** `OrigamiStar.jsx` contains a GSAP origami-unfold animation that fires only if the container has class `main-loader-star`. This class is never added in `App.jsx`, so the entire cinematic load animation is dead code. The loader shows a simple scale-up instead.

**Fix in `App.jsx`:** Pass a prop to the loader star instance:

```jsx
<div ref={loaderStarRef} className="relative z-10 opacity-0 scale-50">
  <OrigamiStar className="w-16 h-16 main-loader-star" />
</div>
```

The `className` prop on `OrigamiStar` must be forwarded to the container `div`'s `ref={containerRef}`. Ensure `OrigamiStar.jsx`'s root div applies the passed `className`:

```jsx
<div
  ref={containerRef}
  className={`preserve-3d-wrapper ${className}`}
  ...
>
```

This is already the case in the current code — only the missing `main-loader-star` in the class string prevents the animation from firing. This single addition unlocks the origami unfold.

---

### 1.4 Hero Text Delay — Tie to Loader Completion

**Problem:** `Hero.jsx` has `delay: 1.5` hardcoded, causing a visible black gap on fast connections.

**Fix:** Remove the `delay: 1.5` from Hero's GSAP timeline. Instead, trigger the hero timeline from `App.jsx`'s loader `onComplete` callback. Pass a ref or use a custom event:

In `App.jsx` loader timeline `onComplete`:

```js
onComplete: () => {
  setLoading(false);
  ScrollTrigger.refresh();
  // Dispatch signal for Hero to start its reveal
  window.dispatchEvent(new CustomEvent('loaderComplete'));
}
```

In `Hero.jsx`, listen for the event before starting the timeline:

```js
useEffect(() => {
  const start = () => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    const words = headlineRef.current.querySelectorAll('.word-inner');
    tl.to(words, { y: 0, clipPath: 'inset(0% 0% 0% 0%)', rotationX: 0, duration: 1.2, stagger: 0.08 })
      .fromTo(subtitleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 }, '-=0.8')
      .fromTo(ctaRef.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8 }, '-=0.6');
  };
  window.addEventListener('loaderComplete', start, { once: true });
  return () => window.removeEventListener('loaderComplete', start);
}, []);
```

---

### 1.5 HeroCanvas — Resolution Init Bug

**Problem:** `setSize()` is called before `material` is declared. The `if (material)` guard is false on first call, so `uResolution` is never set at init. Canvas renders at wrong resolution until the first resize event.

**Fix in `HeroCanvas.jsx`:** Restructure so `setSize()` is called after `material` is created:

```js
// 1. Create renderer (no setSize yet)
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' });
container.appendChild(renderer.domElement);

// 2. Create geometry + material
const geometry = new THREE.PlaneGeometry(2, 2, 8, 8);
const material = new THREE.ShaderMaterial({ ... });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// 3. Now call setSize — material exists
setSize();

// 4. Add resize listener
window.addEventListener('resize', setSize);
```

Also update `setSize` to remove the `if (material)` guard since material always exists when called:

```js
const setSize = () => {
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  material.uniforms.uResolution.value.set(
    renderer.domElement.width,
    renderer.domElement.height
  );
};
```

---

### 1.6 HeroCanvas — Scroll-Out Fade

**Problem:** The WebGL hero canvas runs indefinitely throughout the page session. No scroll-out fade or rendering pause is implemented as specified in Prompt 2.

**Fix in `HeroCanvas.jsx`:** After scene setup, add a ScrollTrigger to fade out the canvas as the hero scrolls out of view:

```js
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';
// ...

// After renderer setup:
const heroSection = document.getElementById('hero');
ScrollTrigger.create({
  trigger: heroSection,
  start: 'top top',
  end: 'bottom top',
  onUpdate: (self) => {
    renderer.domElement.style.opacity = 1 - self.progress;
    // Stop rendering when fully scrolled past
    isVisible = self.progress < 1;
  }
});
```

Add `renderer.domElement.style.transition = 'none'` to prevent CSS transitions from interfering with the RAF-driven opacity.

Cleanup: add `ScrollTrigger.getAll().forEach(t => { if (t.trigger === heroSection) t.kill(); })` in the return cleanup.

---

### 1.7 ComoAtuamos — `tl.duration()` Bug

**Problem:** Card active/inactive scale animations are positioned with `startPoint * tl.duration()` and `endPoint * tl.duration()`. Since `tl.duration()` is `0` at call time (before tweens are added), all animations queue at position `0` and fire simultaneously at scroll start.

**Fix in `ComoAtuamos.jsx`:** Replace the duration-based positioning with a separate timeline or use GSAP's label system. The cleanest fix is to add the card scale/opacity tweens to the main scrub timeline using proportional progress values via the second timeline argument:

```js
// After the main xScroll tween is added to tl:
const segmentDuration = 1 / totalCards;

cards.forEach((card, i) => {
  // Each card is "active" during its own scroll segment
  gsap.fromTo(card,
    { scale: 0.92, opacity: 0.4 },
    {
      scale: 1,
      opacity: 1,
      duration: segmentDuration * 0.3,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: `center center+=${i * (containerWidth / totalCards)}px`,
        end: `center center+=${(i + 0.5) * (containerWidth / totalCards)}px`,
        scrub: 1,
      }
    }
  );
});
```

Alternatively — and more cleanly — separate the card scale logic into its own set of individual ScrollTriggers that each reference the pinned section with `containerAnimation` option (the correct GSAP pattern for animating within a pinned scroll section):

```js
cards.forEach((card, i) => {
  gsap.to(card, {
    scale: 1,
    opacity: 1,
    ease: 'power2.out',
    scrollTrigger: {
      containerAnimation: tl.scrollTrigger,
      trigger: card,
      start: 'left center',
      end: 'right center',
      scrub: true,
    }
  });
});
```

This is the GSAP-recommended pattern for "animations within a pinned horizontal scroll."

---

### 1.8 ComoAtuamos — Card Initial Style

**Problem:** `style={{ scale: ... }}` is not valid CSS — `scale` is not a CSS property (it's a GSAP transform alias). The initial inactive card state may render incorrectly before GSAP takes over.

**Fix:** Change the inline style to use `transform`:

```jsx
style={{
  opacity: window.innerWidth >= 1024 ? (idx === 0 ? 1 : 0.4) : 1,
  transform: window.innerWidth >= 1024 ? (idx === 0 ? 'scale(1)' : 'scale(0.92)') : 'scale(1)'
}}
```

---

### 1.9 BrandCursor — Duplicate Transform Assignment

**Problem:** Lines 85–90 in `BrandCursor.jsx` set `ring.style.transform` twice per frame. The first assignment (lines 85–87) is incorrect and causes a micro-flicker.

**Fix:** Delete lines 85–87 entirely. Keep only:

```js
ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;
dot.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0) translate(-50%, -50%) scale(${dot.dataset.scale || 1})`;
```

---

### 1.10 Navbar — ScrollVelocityReactor Blur Check

**Problem:** `ScrollVelocityReactor.jsx` checks `nav.classList.contains('backdrop-blur-md')` to apply velocity-reactive blur. But `backdrop-blur-md` is always present in the JSX (applied unconditionally), so the blur runs even when the nav is transparent (on the hero). The blur should only apply when the nav is in its scrolled state.

**Fix in `ScrollVelocityReactor.jsx`:** Change the condition to check for the scrolled state instead:

```js
const nav = document.querySelector('nav');
if (nav && nav.classList.contains('bg-[#FDFAF4]/80')) {
  // Only blur-boost when nav is showing its solid scrolled state
  const blurAmount = 16 + Math.min(v * 0.1, 12);
  nav.style.backdropFilter = `blur(${blurAmount}px)`;
  nav.style.WebkitBackdropFilter = `blur(${blurAmount}px)`;
}
```

Since Tailwind generates these as hashed classes, a more reliable check:

```js
if (nav && window.scrollY > window.innerHeight * 0.9) {
  const blurAmount = 16 + Math.min(v * 0.1, 12);
  nav.style.backdropFilter = `blur(${blurAmount}px)`;
  nav.style.WebkitBackdropFilter = `blur(${blurAmount}px)`;
}
```

---

## Section 2 — High Priority Upgrades

### 2.1 Mobile Nav Overlay — Entrance Animation

**Problem:** The mobile fullscreen overlay (`{mobileMenuOpen && <div>}`) snaps in with no transition. Prompt 1 specified "staggered clip-path link reveals."

**Fix in `Navbar.jsx`:** Replace the conditional render with always-mounted but GSAP-controlled visibility. Use `useEffect` on `mobileMenuOpen` to drive the animation:

```jsx
const overlayRef = useRef(null);
const linkRefs = useRef([]);

useEffect(() => {
  if (!overlayRef.current) return;

  if (mobileMenuOpen) {
    // Prevent scrolling while menu is open
    document.body.style.overflow = 'hidden';

    gsap.set(overlayRef.current, { display: 'flex', opacity: 0 });
    const tl = gsap.timeline();

    tl.to(overlayRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' })
      .fromTo(
        linkRefs.current,
        { clipPath: 'inset(0 0 100% 0)', y: 20 },
        { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 0.5, stagger: 0.07, ease: 'power4.out' },
        '-=0.1'
      );
  } else {
    document.body.style.overflow = '';
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => { gsap.set(overlayRef.current, { display: 'none' }); }
    });
  }
}, [mobileMenuOpen]);
```

Remove the `{mobileMenuOpen && ...}` conditional. Instead, always render the overlay div (with `display: none` initially) and let GSAP control its visibility:

```jsx
<div
  ref={overlayRef}
  style={{ display: 'none' }}
  className="fixed inset-0 z-40 bg-dark text-cream flex flex-col justify-center items-center"
>
  <div className="flex flex-col items-center gap-8 font-display text-4xl">
    {navLinks.map((link, i) => (
      <a
        key={link.name}
        ref={el => linkRefs.current[i] = el}
        href={link.href}
        onClick={() => setMobileMenuOpen(false)}
        style={{ clipPath: 'inset(0 0 100% 0)' }}
        className="hover:text-orange transition-colors"
      >
        {link.name}
      </a>
    ))}
  </div>
</div>
```

---

### 2.2 Nav Scroll-Spy — Active Section Highlighting

**Add to `Navbar.jsx`:** Track the active section using IntersectionObserver and highlight the corresponding nav link.

```jsx
const [activeSection, setActiveSection] = useState('hero');

useEffect(() => {
  const sectionIds = ['sobre', 'como-atuamos', 'portfolio', 'fundadores', 'contato'];
  const observers = sectionIds.map(id => {
    const el = document.getElementById(id);
    if (!el) return null;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return obs;
  });
  return () => observers.forEach(obs => obs?.disconnect());
}, []);
```

Apply active state in the link render:

```jsx
<a
  key={link.name}
  href={link.href}
  data-cursor="link"
  className={`hover:text-orange transition-colors relative group ${
    activeSection === link.href.replace('#', '') ? 'text-orange' : ''
  }`}
>
  {link.name}
  {/* Sliding underline */}
  <span className={`absolute -bottom-0.5 left-0 h-px bg-orange transition-all duration-300 ${
    activeSection === link.href.replace('#', '') ? 'w-full' : 'w-0 group-hover:w-full'
  }`} />
</a>
```

---

### 2.3 `breathe` Keyframe — Fix or Remove

**Problem:** `animate-[breathe_6s_infinite]` references a non-existent keyframe. The origami diamond accent in `Sobre.jsx` is static.

**Fix in `src/index.css`**, add to the `@layer utilities` block or after it:

```css
@keyframes breathe {
  0%, 100% { transform: scale(1) rotateX(0deg) rotateY(0deg); }
  33%       { transform: scale(1.04) rotateX(3deg) rotateY(-2deg); }
  66%       { transform: scale(0.97) rotateX(-2deg) rotateY(3deg); }
}
```

---

### 2.4 Footer — Entrance Animation

**Add to `Footer.jsx`:**

```jsx
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Inside the component:
const headlineRef = useRef(null);
const subRef = useRef(null);

useEffect(() => {
  const ctx = gsap.context(() => {
    const words = headlineRef.current.querySelectorAll('.word');
    gsap.fromTo(
      words,
      { clipPath: 'inset(0% 0% 100% 0%)', y: 30 },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        y: 0,
        duration: 0.9,
        stagger: 0.06,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: headlineRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        }
      }
    );
    gsap.fromTo(
      subRef.current,
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: subRef.current, start: 'top 85%', toggleActions: 'play none none reverse' }
      }
    );
  });
  return () => ctx.revert();
}, []);
```

Wrap the footer headline text in split spans:

```jsx
<h2 ref={headlineRef} className="font-display font-semibold text-5xl lg:text-7xl mb-6">
  {['Vamos', 'conversar.'].map(w => (
    <span key={w} className="overflow-hidden inline-block mr-4">
      <span className="word inline-block">{w}</span>
    </span>
  ))}
</h2>
<p ref={subRef} className="font-body text-xl lg:text-2xl text-cream/70 max-w-2xl opacity-0">
  Uma conversa sem compromisso. Se fizer sentido, a gente constrói junto.
</p>
```

---

### 2.5 Footer — Fix Gradient Tracking on CTA

**Problem:** The "Fale Conosco" CTA in the footer has no `onMouseMove` gradient angle tracking, unlike the hero CTA and nav CTA.

**Fix in `Footer.jsx`:** Add `onMouseMove` and `onMouseLeave` handlers matching the pattern from `Hero.jsx`:

```jsx
<a
  href="mailto:contato@blinkgroup.com.br"
  data-cursor="action"
  onMouseMove={(e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const angle = (e.clientX - rect.left) / rect.width * 135;
    e.currentTarget.style.setProperty('--gradient-angle', `${angle}deg`);
  }}
  onMouseLeave={(e) => e.currentTarget.style.setProperty('--gradient-angle', '135deg')}
  className="inline-block brand-gradient text-dark font-body font-bold text-xl lg:text-2xl px-8 py-4 rounded-full hover:scale-105 transition-transform mb-4 mr-4"
>
  Fale Conosco
</a>
```

---

### 2.6 Accessibility Fixes

In `Navbar.jsx`, add `aria-label` to the hamburger button:

```jsx
<button
  className="lg:hidden p-2"
  aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
>
```

In `Portfolio.jsx`, add `aria-label` to the Cadencio external link:

```jsx
<a
  href="https://cadencio.app"
  target="_blank"
  rel="noreferrer"
  data-cursor="link"
  aria-label="Visitar Cadencio (abre em nova aba)"
  ...
>
```

---

### 2.7 Typography Polish

**In `Hero.jsx`**, tighten tracking on the headline at large sizes and add text-wrap:

```jsx
<h1
  ref={headlineRef}
  className="font-display font-extrabold text-cream text-[2.5rem] lg:text-[7rem] leading-[1.1] mb-8"
  style={{ perspective: '1000px', letterSpacing: 'clamp(-0.03em, -0.04em, -0.05em)', textWrap: 'balance' }}
>
```

Add `textWrap: 'balance'` to all section `<h2>` elements in Sobre, ComoAtuamos, Portfolio, and Fundadores.

Add `font-medium` (weight 500) to subtitle text in Hero:

```jsx
<p
  ref={subtitleRef}
  className="font-body font-medium text-cream/70 text-lg lg:text-xl max-w-md leading-relaxed mb-12 opacity-0"
>
```

---

## Section 3 — Hero Canvas Redesign: Origami Geometric Field

### Replace the noise-blob shader with an origami-inspired tessellated geometry

**Concept:** The current hero background is a smooth, organic gradient mesh driven by simplex noise — beautiful but disconnected from the brand's origami metaphor. Replace it with a **field of folded triangular faces** that react to the mouse and breathe gently — as if the viewer is looking down at a flat sheet of paper that is slowly folding itself into the origami star.

**Visual description:**

- The background is a grid of triangular polygons (delaunay-style or regular grid subdivided diagonally)
- Each triangle has a slightly different shade from the brand palette — the whole field reads as the brand gradient but made of geometric facets
- The triangles subtly tilt around their own axes over time (very slow, 0.01–0.02 rad/s per face, each with a slightly different phase offset) — creating the impression of a slowly folding paper surface
- The mouse creates a **fold wave**: triangles near the cursor lift their near edges slightly (positive z displacement), making it look like a paper fold radiating outward from the cursor
- The overall opacity stays at 0.18–0.25 (atmospheric, same as the original)
- On scroll, the fold wave collapses — all triangles flatten to z=0 as the hero scrolls out

**Implementation — new `HeroCanvas.jsx`:**

Use Three.js `BufferGeometry` with manually constructed triangle faces (not `PlaneGeometry`). The geometry is a grid of quads each split into 2 triangles, giving full control over per-face coloring.

```glsl
// Vertex shader — per-vertex origami fold
uniform float uTime;
uniform vec2 uMouse;        // normalized 0-1
uniform vec2 uResolution;
uniform float uScrollProgress;  // 0-1

attribute float aPhase;     // per-vertex random phase offset (passed as BufferAttribute)
attribute vec3 aColor;      // per-vertex brand color (interpolated across face)
varying vec3 vColor;
varying float vFold;

void main() {
  vColor = aColor;

  vec3 pos = position;

  // Gentle per-vertex breathing (slow fold oscillation)
  float breathe = sin(uTime * 0.4 + aPhase) * 0.018;
  pos.z += breathe;

  // Mouse fold wave: distance from cursor creates a ridge
  // Convert position to UV space for distance calculation
  vec2 uv = (pos.xy + vec2(1.0)) * 0.5; // remap -1..1 to 0..1
  vec2 aspectMouse = uMouse;
  aspectMouse.x *= uResolution.x / uResolution.y;
  vec2 aspectUv = uv;
  aspectUv.x *= uResolution.x / uResolution.y;

  float dist = distance(aspectUv, aspectMouse);
  float wave = smoothstep(0.35, 0.0, dist) * 0.06;
  // Directional fold: lift toward cursor
  pos.z += wave * (1.0 - uScrollProgress);

  vFold = wave;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

```glsl
// Fragment shader — faceted brand gradient
varying vec3 vColor;
varying float vFold;

void main() {
  // Subtle highlight on folded faces
  vec3 color = vColor + vFold * vec3(0.15, 0.08, 0.0);

  // Heavy vignette (same as before)
  // Note: compute from gl_FragCoord since we don't pass uv in this shader
  gl_FragColor = vec4(color, 0.20 + vFold * 0.06);
}
```

**Geometry construction (JavaScript):**

```js
function buildOrigamiGeometry(cols, rows) {
  const positions = [];
  const colors = [];
  const phases = [];

  // Brand color palette as vec3
  const palette = [
    [1.0, 0.647, 0.18],   // gold   #FFA52E
    [1.0, 0.541, 0.11],   // mid    #FF8A1C
    [1.0, 0.416, 0.0],    // orange #FF6A00
    [1.0, 0.333, 0.08],   // deep   interpolated
    [0.949, 0.102, 0.102] // red    #F21A1A
  ];

  // Create a grid of quads, each split into 2 triangles
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Quad corners in -1..1 space
      const x0 = (c / cols) * 2 - 1;
      const x1 = ((c + 1) / cols) * 2 - 1;
      const y0 = (r / rows) * 2 - 1;
      const y1 = ((r + 1) / rows) * 2 - 1;

      // Pick a face color from palette based on position
      // Diagonal gradient: top-left = gold, bottom-right = red
      const t = ((c / cols) + (r / rows)) / 2;  // 0..1
      const pi = Math.min(Math.floor(t * (palette.length - 1)), palette.length - 2);
      const pf = t * (palette.length - 1) - pi;
      const col = palette[pi].map((v, i) => v + (palette[pi + 1][i] - v) * pf);

      // Add slight per-face variation (±5%)
      const jitter = () => col.map(v => Math.max(0, Math.min(1, v + (Math.random() - 0.5) * 0.08)));
      const faceCol = jitter();

      const phase = Math.random() * Math.PI * 2;

      // Triangle 1: (x0,y0), (x1,y0), (x0,y1)
      positions.push(x0,y0,0, x1,y0,0, x0,y1,0);
      for (let i = 0; i < 3; i++) { colors.push(...faceCol); phases.push(phase); }

      // Triangle 2: (x1,y0), (x1,y1), (x0,y1)
      positions.push(x1,y0,0, x1,y1,0, x0,y1,0);
      for (let i = 0; i < 3; i++) { colors.push(...faceCol); phases.push(phase); }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  geo.setAttribute('aColor',   new THREE.BufferAttribute(new Float32Array(colors), 3));
  geo.setAttribute('aPhase',   new THREE.BufferAttribute(new Float32Array(phases), 1));
  return geo;
}
```

**Scene setup:**

```js
const geometry = buildOrigamiGeometry(24, 16); // 24 cols × 16 rows = 768 quads
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime:           { value: 0 },
    uMouse:          { value: new THREE.Vector2(0.5, 0.5) },
    uResolution:     { value: new THREE.Vector2(1, 1) },
    uScrollProgress: { value: 0 }
  },
  transparent: true,
  depthWrite: false,
  side: THREE.DoubleSide
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
```

**Grid density:** On mobile this component doesn't initialize (same as before). On desktop, 24×16 gives 768 quads (1536 triangles) — well within performance budget.

**Vignette:** Apply as a second pass or by multiplying the alpha by a vignette function in the fragment shader. Keep the same `mix(color, dark, vignette)` pattern from the original so the edges blend into `#212121`.

Add the vignette in the fragment shader:

```glsl
// Vignette — compute from position (already in -1..1 clipspace approximately)
// We'll pass uResolution and compute from gl_FragCoord
uniform vec2 uResolution;
// ...
void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 centeredUv = uv - 0.5;
  centeredUv.x *= uResolution.x / uResolution.y;
  float vignette = smoothstep(0.0, 0.65, length(centeredUv));
  vec3 dark = vec3(0.129);
  vec3 finalColor = mix(vColor + vFold * vec3(0.15, 0.08, 0.0), dark, vignette * 0.88);
  gl_FragColor = vec4(finalColor, 0.22 + vFold * 0.06);
}
```

**Effect character:** Looking at the hero, you should see a field of subtly colored geometric facets — like a sheet of paper that has been lightly crumpled into a low-poly landscape of brand colors. Moving the mouse should create a visible fold rippling outward from the cursor. The overall impression is: origami paper that hasn't been folded yet, but is about to be. This is the ambient promise of the brand.

---

## Section 4 — Fundadores Section Redesign

### Replace the polaroid photo stack with a dual-founder split layout

**Problem with current design:**

- The polaroid photo stack (cream border, random rotation) feels decorative and out of place against the dark-on-dark architecture of the rest of the site
- The auto-advance creates an information hierarchy problem: only one founder is visible at a time, the other is hidden
- Placeholder Unsplash photos make the polaroid conceit feel even less grounded
- The section undersells the founding team, which is a key trust-building element

**New layout concept:**

Two founder cards, side by side at desktop (single column at mobile), each taking approximately equal space. The photos are architectural, not decorative — they feel like deliberate editorial design, not a photo album.

**Visual treatment per card:**

- A tall container (roughly 3:4 portrait aspect ratio) with a dark frame (`bg-[#1A1A1A]`)
- The photo fills the frame with `object-fit: cover` and the WebGL shader overlay still applies (chromatic aberration on hover is correct and on-brand)
- **No cream border. No rotation. No polaroid.**
- The photo frame has a thin `border border-white/10` — architectural, not decorative
- Below the photo frame: founder name in display font, role in mono, brief description in body
- A thin brand-gradient line (`brand-gradient h-[3px]`) sits at the top edge of the photo frame — like a file/folder tab, a nod to the "structured systems" concept
- The `data-cursor="image"` and `image-canvas-wrapper` attributes are retained for the WebGL shader
- On hover: the photo frame gets a subtle `border-orange/20` glow, the gradient tab at top intensifies

**Layout structure:**

```
[04 — Fundadores]
[Quem está por trás.]

┌─────────────────────┐  ┌─────────────────────┐
│ ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ │  │ ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ │  ← brand gradient tab
│                     │  │                     │
│       [photo]       │  │       [photo]       │
│                     │  │                     │
└─────────────────────┘  └─────────────────────┘
  Luan Carvalho           Adrian Villela
  CO-FUNDADOR,            CO-FUNDADOR,
  MKT & DESENVOLVIMENTO   OPERAÇÕES & ESTRATÉGIA
  Full-stack, arqui-      Eng. produção, pro-
  tetura e automação.     cessos e estratégia.

[quote block — full width below]
```

**Implementation in `Fundadores.jsx`:**

Remove all polaroid/stack/auto-advance logic. Remove the `activeIndex` state and `interval`. Remove the `stackRef` and `biosRef` pattern. Remove the `handleMouseMove/Leave` tilt on the whole stack (we'll add per-card tilt instead).

```jsx
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const founders = [
  {
    name: "Luan Carvalho",
    role: "CO-FUNDADOR, DESENVOLVIMENTO",
    desc: "Arquitetura de sistemas, full-stack e automação. Constrói as ferramentas que a operação pede.",
    img: "https://images.unsplash.com/photo-1549692520-acc6669e2f0c?q=80&w=600&auto=format&fit=crop"
  },
  {
    name: "Adrian Villela",
    role: "CO-FUNDADOR, OPERAÇÕES & ESTRATÉGIA",
    desc: "Engenharia de produção, mapeamento de processos e estratégia de produto. Encontra a dor antes de construir.",
    img: "https://images.unsplash.com/photo-1537511446984-935f663eb1f4?q=80&w=600&auto=format&fit=crop"
  }
];

export default function Fundadores() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  // Per-card tilt on mouse move
  const handleMouseMove = (e, idx) => {
    const card = cardsRef.current[idx];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const percentX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const percentY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    gsap.to(card, {
      rotateX: percentY * 3,
      rotateY: percentX * 3,
      duration: 0.5,
      ease: 'power2.out',
      transformPerspective: 800
    });
  };

  const handleMouseLeave = (idx) => {
    gsap.to(cardsRef.current[idx], {
      rotateX: 0, rotateY: 0,
      duration: 0.8,
      ease: 'elastic.out(1, 0.3)'
    });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardsRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
        y: 50,
        opacity: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: 'power3.out'
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="fundadores"
      ref={sectionRef}
      data-theme="dark"
      className="py-32 px-6 lg:px-20 bg-dark text-cream relative overflow-hidden"
    >
      <div className="brand-gradient-divider absolute top-0 left-0" />

      <div className="max-w-7xl mx-auto">

        <span className="font-mono text-xs uppercase tracking-widest text-orange border border-orange/40 rounded-full px-3 py-1 inline-block mb-12">
          04 — Fundadores
        </span>

        <h2 className="font-display font-semibold text-4xl lg:text-5xl mb-20" style={{ textWrap: 'balance' }}>
          Quem está por trás.
        </h2>

        {/* Two-column founder grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {founders.map((founder, i) => (
            <div
              key={i}
              ref={el => cardsRef.current[i] = el}
              onMouseMove={(e) => handleMouseMove(e, i)}
              onMouseLeave={() => handleMouseLeave(i)}
              className="group will-change-transform"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Photo frame */}
              <div className="relative rounded-xl overflow-hidden border border-white/10 group-hover:border-orange/20 transition-colors duration-500 bg-[#1A1A1A]">
                {/* Brand gradient tab at top */}
                <div className="h-[3px] w-full brand-gradient opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Photo with WebGL wrapper */}
                <div
                  className="image-canvas-wrapper relative w-full"
                  data-canvas="image"
                  style={{ aspectRatio: '3/4' }}
                >
                  <img
                    src={founder.img}
                    alt={founder.name}
                    data-cursor="image"
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="mt-6 px-1">
                <h3 className="font-display font-bold text-2xl lg:text-3xl mb-1">
                  {founder.name}
                </h3>
                <p className="font-mono text-xs text-orange tracking-widest uppercase mb-3">
                  {founder.role}
                </p>
                <p className="font-body text-base text-cream/70 leading-relaxed">
                  {founder.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quote block */}
        <div className="mt-24 lg:mt-32 max-w-3xl mx-auto text-center">
          <p className="font-display text-2xl lg:text-3xl leading-relaxed text-cream/90 mb-6 italic">
            "Pode haver tanto valor em um piscar de olhos quanto em meses de análise racional."
          </p>
          <p className="font-mono text-xs uppercase tracking-widest text-[#FF8A1C]">
            — Malcolm Gladwell, Blink
          </p>
        </div>

      </div>
    </section>
  );
}
```

**Remove from this component:**

- `useState` (no more activeIndex or auto-advance)
- The `interval` auto-advance logic
- The `biosRef` crossfade
- The `spikeshader` custom event dispatch (ImageHoverEffect still works via hover — the spike on transition was tied to the stack auto-advance which no longer exists)
- All polaroid-related classes (`p-3 pb-12`, `shadow-xl`, rotation transforms)

**The `ImageHoverEffect.jsx` still applies** — it will find the `image-canvas-wrapper` elements in the new layout and apply the chromatic aberration / wave shader on hover exactly as before.

---

## Section 5 — Architecture Hooks for Prompt 4

Add these to the codebase now. They do nothing in Prompt 3 but must exist:

1. **Contact form hook:** In `Footer.jsx`, add an empty `<div id="contact-form-mount" />` immediately below the CTA button. A Prompt 4 contact form component will mount here.
2. **Parallax data attributes:** Add `data-speed="0.3"` to the hero watermark star div in `Hero.jsx`. The App.jsx parallax system already handles this — it just needs the attribute:
  ```jsx
   <div
     data-speed="0.3"
     className="absolute -bottom-[20vw] -left-[10vw] z-0 opacity-[0.03] animate-[spin_180s_linear_infinite]"
   >
  ```
3. **Product pipeline data:** Add `data-product="cadencio"` attribute to the Cadencio card in `Portfolio.jsx`. Future dynamic routing will use this.

---

## Technical Notes

### Performance Budget (unchanged from Prompt 2)

- Desktop: 60fps minimum during scroll
- Mobile: No WebGL. No GPU load. Zero canvas elements.
- The new origami geometry (1536 triangles) is lighter than the noise shader — no texture lookups, no multi-octave noise calculation per fragment.
- IntersectionObserver pause for off-screen rendering: required, same as before.

### What NOT to Change

- The Lenis setup in `App.jsx` — do not touch
- The `ScrollVelocityReactor` — only fix the blur condition (Section 1.10)
- The `BrandCursor` — only fix the duplicate transform line (Section 1.9)
- The `ComoAtuamos` layout structure — only fix the animation bugs
- All brand copy — do not change a single word
- The `OrigamiStar` SVG geometry — only the class propagation needs fixing
- `ImageHoverEffect.jsx` — no changes needed, it will work with the new Fundadores layout automatically

### CSS additions needed

- `@keyframes breathe` in `index.css`
- Remove the `@import` Google Fonts line from `index.css`
- No other CSS changes

---

## Quality Benchmark

When Prompt 3 is complete, the site should:

1. Load with the origami star actually unfolding face-by-face — the brand's most distinctive moment, finally working
2. Have a hero background that reads as "this brand thinks in geometry and systems" rather than "this brand thinks in blobs"
3. Show both founders simultaneously and treat them with equal visual weight — the section builds trust, not curiosity
4. Scroll through the mobile nav with the same cinematic quality as desktop
5. Have zero broken links in the contact section
6. Show Google Fonts loading synchronously with the first paint (no flash of fallback font)
7. Have the navbar underline the current section as you scroll through — the site knows where you are
8. Run at 60fps with the origami geometry visible on the hero (it should be lighter than the noise shader, not heavier)
9. Pass the "cursor test": the ring has no flicker, the click snap is clean, the label is always legible
10. Make the audit document `docs/AWARD_SITE_STANDARDS.md` look like a solved checklist rather than a list of open problems

