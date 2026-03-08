# Blink Institutional Site — Prompt 2: Premium Layer

## Context

You are receiving a **fully built, content-complete institutional website** for Blink (a Brazilian tech holding company). The site was built with Prompt 1 and already has: all sections with real Portuguese copy, Lenis smooth scroll synced with GSAP ScrollTrigger, clip-path text reveal animations, section color transitions, responsive layout, the origami star logo SVG, noise overlay, and CSS micro-interactions.

Your job is to **transform this solid foundation into an Awwwards-caliber digital experience** by layering on: a custom cursor system, WebGL shader effects via Three.js, scroll velocity-reactive behaviors, origami-inspired 3D CSS animations, a horizontal scroll-pinned section, and image hover distortion effects. This is where the site goes from "very well-built" to "how did they do that in a browser."

**Reference sites for this level:** OFF+BRAND's Lando Norris (Awwwards Site of the Year 2025), Lusion v3 (Site of the Year 2023), Locomotive's portfolio, Igloo Inc (Site of the Year 2024). Study how these sites use WebGL as atmosphere, not spectacle.

**Critical rule:** Nothing from Prompt 1 should break. The foundation has `data-canvas`, `data-cursor`, `data-theme`, and `--scroll-velocity` hooks already built in. You are extending, not refactoring.

---

## What You're Adding (Priority Order)

### 1. CUSTOM CURSOR — "The Brand Cursor"

Replace default cursor on desktop (`cursor: none` on `body`).

**Two elements tracking mouse via `requestAnimationFrame` with linear interpolation:**

**Outer ring:** 40px circle, 1px `#FF6A00` border at 50% opacity, follows mouse with `lerp(0.08)`. `mix-blend-mode: difference` for contrast on any background.

**Inner dot:** 8px circle, brand gradient fill, follows with `lerp(0.15)` (tighter tracking).

**State machine (reads `data-cursor` attributes from Prompt 1):**
| `data-cursor` value | Ring | Dot | Label |
|---|---|---|---|
| (none/default) | 40px, border only | 8px, visible | — |
| `"link"` | 60px, fills `#FF6A00/15` | hidden | "Ver" in IBM Plex Mono 0.625rem |
| `"action"` | 60px, fills brand gradient/20 | hidden | "Abrir" |
| `"image"` | morphs to rounded rectangle | hidden | "Arrastar" |

**Click:** Both elements snap to `scale(0.85)` then spring back with `cubic-bezier(0.34, 1.56, 0.64, 1)`.

**Implementation:** Use `requestAnimationFrame` loop with `lerp()`, NOT CSS transitions. Track `clientX`/`clientY`, update `transform: translate3d()` each frame.

**Mobile:** Completely hidden. Restore `cursor: auto`.

### 2. HERO WEBGL BACKGROUND — "The Living Canvas"

Mount a Three.js `<canvas>` into the `[data-canvas="hero"]` div that Prompt 1 already placed.

**Effect:** Animated gradient mesh with mouse-reactive distortion. Full-screen `PlaneGeometry` with custom `ShaderMaterial`.

**Fragment shader (provide this GLSL exactly):**
```glsl
// Include a standard 2D simplex noise implementation at the top

uniform float uTime;
uniform vec2 uMouse;       // normalized 0-1
uniform vec2 uResolution;
uniform float uScrollProgress; // 0-1 through hero

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    
    // Brand colors
    vec3 gold   = vec3(1.0, 0.647, 0.18);   // #FFA52E
    vec3 orange = vec3(1.0, 0.416, 0.0);    // #FF6A00
    vec3 red    = vec3(0.949, 0.102, 0.102); // #F21A1A
    
    // Noise-driven color mixing
    float n1 = snoise(uv * 3.0 + uTime * 0.08);
    float n2 = snoise(uv * 5.0 - uTime * 0.12 + 100.0);
    
    vec3 color = mix(gold, orange, smoothstep(-0.3, 0.3, n1));
    color = mix(color, red, smoothstep(-0.2, 0.4, n2));
    
    // Mouse proximity: subtle brighten near cursor
    float mouseDist = distance(uv, uMouse);
    float mouseInfluence = smoothstep(0.4, 0.0, mouseDist);
    color += mouseInfluence * 0.12;
    
    // Heavy vignette to blend into #212121
    float vignette = smoothstep(0.0, 0.7, length(uv - 0.5));
    vec3 dark = vec3(0.129); // #212121
    color = mix(color, dark, vignette * 0.85);
    
    // Low opacity — this is atmosphere, not screensaver
    gl_FragColor = vec4(color, 0.20 + mouseInfluence * 0.08);
}
```

**Vertex shader:** Standard pass-through with gentle sine-wave vertex displacement (2–3px amplitude from `uTime`). The mesh should breathe, not wave.

**Behavior:**
- Tracks mouse position, passes as `uMouse` uniform
- As user scrolls past hero, canvas `opacity` tweens 1→0 via ScrollTrigger, then pauses rendering to free GPU
- Canvas has `pointer-events: none` and sits behind all DOM content (z-index: 0)

**The effect should feel like ambient aurora of brand colors barely visible through fog.** Text must remain perfectly readable. If you squint, you might not even notice the canvas is there. That's the correct intensity.

**Mobile:** Do not initialize. The `data-canvas="hero"` div stays empty. No canvas, no shader, no GPU load.

### 3. IMAGE HOVER SHADERS

For each `[data-canvas="image"]` wrapper from Prompt 1, overlay a `<canvas>` that applies shader effects on hover.

**Technique:** Load the `<img>` as a Three.js texture. Render it on a `PlaneGeometry` with `ShaderMaterial`. On hover, animate uniforms via GSAP:

**Hover-in (0.3s):**
- `uChromatic`: 0 → 3 (RGB channel offset in pixels — subtle chromatic aberration)
- `uWave`: 0 → 0.008 (sine-based UV displacement — gentle liquid ripple from cursor position)
- `uBrightness`: 1.0 → 1.06

**Hover-out (0.5s):**
- All uniforms return to 0/1.0

**Fragment shader core logic:**
```glsl
// Sample with chromatic aberration
float r = texture2D(uTexture, uv + vec2(uChromatic * 0.001, 0.0)).r;
float g = texture2D(uTexture, uv).g;
float b = texture2D(uTexture, uv - vec2(uChromatic * 0.001, 0.0)).b;
vec3 color = vec3(r, g, b) * uBrightness;

// Add wave distortion
vec2 waveUv = uv + uWave * sin(uv.y * 20.0 + uTime * 2.0);
// ... apply waveUv to texture sampling
```

**Mobile fallback:** CSS `filter: brightness(1.05)` transition on hover instead. No canvas.

### 4. SCROLL VELOCITY REACTIONS

Read `--scroll-velocity` CSS custom property (set by Prompt 1's Lenis hook) and drive these effects:

**A. Image skew:** All `.image-canvas-wrapper` elements get `skewY()` proportional to scroll velocity. Fast scroll = 2–4° skew in scroll direction. Springs back to 0° when stopped.
```js
gsap.ticker.add(() => {
  const v = parseFloat(document.body.dataset.scrollVelocity || 0);
  gsap.to('.image-canvas-wrapper', {
    skewY: v * 0.3,        // max ~4° at high speed
    duration: 0.3,
    ease: 'power2.out'
  });
});
```

**B. Section title stretch:** On fast scroll, headline letters get `scaleY(1 + velocity * 0.005)`, max 1.05. Returns to 1 on stop.

**C. Parallax depth:** Elements with `data-speed` attributes move at different rates. Add these to Prompt 1's markup:
- Hero watermark: `data-speed="0.3"`
- Section backgrounds: `data-speed="0.5"`
- Foreground content: `data-speed="1"` (default)

Use ScrollTrigger `scrub: true` to drive parallax.

**D. Navbar blur scaling:** `backdrop-filter: blur()` increases from 16px to 28px proportional to velocity, returns to 16px when stopped.

### 5. HORIZONTAL SCROLL PIN — "Como Atuamos" Section

Convert the 3-card layout from Prompt 1 into a **scroll-pinned horizontal gallery:**

1. Section pins when it enters viewport (`ScrollTrigger pin: true`)
2. Vertical scrolling drives horizontal card translation (right to left)
3. Active card (viewport center): `scale: 1`, `opacity: 1`
4. Inactive cards: `scale: 0.92`, `opacity: 0.4`
5. Gradient connecting line between cards animates `scaleX: 0→1` as scroll progresses between them
6. Last card centered → pin releases, normal scroll resumes

```js
const section = document.getElementById('como-atuamos');
const cards = section.querySelectorAll('.process-card');

gsap.to(cards, {
  xPercent: -100 * (cards.length - 1),
  ease: 'none',
  scrollTrigger: {
    trigger: section,
    pin: true,
    scrub: 1,
    end: () => `+=${section.offsetWidth}`,
  }
});
```

**Mobile:** No pinning. Cards stack vertically as in Prompt 1. The horizontal scroll only activates on `window.innerWidth >= 1024`.

### 6. ORIGAMI 3D ANIMATIONS

Two specific origami moments that reward attention:

**A. Page load — Star unfold:**
Replace Prompt 1's simple scale-in logo animation with a CSS 3D origami unfold sequence:

1. The star starts as a flat line (a single paper edge, `scaleX: 1, scaleY: 0.02`)
2. Over 0.8s, it unfolds into the full star shape via a `perspective(600px) rotateX()` sequence:
   - 0–0.3s: flat line → half-folded (rotateX: 90° → 45°)
   - 0.3–0.6s: half-folded → nearly open (rotateX: 45° → 10°)
   - 0.6–0.8s: settle into final position (rotateX: 10° → 0° with overshoot spring)
3. Each polygon face of the star SVG animates independently with slight delay stagger (0.05s), so the faces "fold open" sequentially rather than all at once
4. After unfold completes, transitions to the navbar-bound motion from Prompt 1

This creates the illusion that the logo is physically being folded from paper in real-time.

**Implementation:** Apply CSS `transform-style: preserve-3d` on the star container. Each polygon face is wrapped in a `<g>` with its own `transform-origin` set to its fold edge. GSAP animates each face's `rotateX` independently.

**B. Section dividers — Paper fold:**
The gradient dividers between sections (thin 2px lines from Prompt 1) get upgraded:

- As the divider scrolls into view, it appears to "fold" into existence from center outward
- The line starts at `scaleX: 0` and `perspective(400px) rotateY(90deg)`
- Over 0.4s it unfolds: `rotateY: 90° → 0°` while `scaleX: 0 → 1`
- This creates a subtle origami "crease appearing" effect

These are the ONLY two origami animation moments. No floating birds, no edge decorations, no scattered paper shapes. The origami concept lives in the logo and these two micro-moments. Everywhere else it's felt conceptually (the fold metaphor — flat operations into structured systems) but not seen.

### 7. ADVANCED MICRO-INTERACTION UPGRADES

**A. Button hover — Gradient sweep:**
The gradient fill `<span>` from Prompt 1 gets upgraded. On hover:
1. The gradient `<span>` sweeps from left at 0° initially
2. As the cursor moves across the button, the gradient angle tracks cursor X position (0° left edge → 135° right edge)
3. Creates a "light following the cursor across the button" effect
4. Uses `mousemove` listener scoped to the button, updating the gradient angle via CSS custom property

**B. Card hover — Depth tilt:**
Cards in Como Atuamos and Portfólio get perspective-aware tilt:
1. Track cursor position relative to card center
2. Apply `rotateX` and `rotateY` proportional to cursor offset (max ±3°)
3. `perspective: 800px` on card container
4. Smooth with `lerp(0.1)` per frame
5. On hover-out, spring back to flat with overshoot

**C. Nav logo — Origami hover:**
When hovering the navbar logo:
1. The star SVG faces shift slightly (each face rotates 3–5° around its fold edge)
2. Creates the impression the origami is being gently pressed/manipulated
3. Returns to resting position on hover-out with spring ease
4. This uses the same per-face `<g>` wrapping from the page load animation

### 8. FOUNDERS PHOTO STACK SHADER

The photo stack in Prompt 1 gets the image hover shader (section 3 above) applied to the top photo. Additionally:

- When a photo is about to fly off during the auto-advance cycle, the chromatic aberration spikes briefly to 6px (creating a "energy release" moment)
- The incoming photo starts with a subtle 2px blur that clears to sharp over 0.3s
- This makes the transitions feel physical rather than purely digital

---

## Technical Notes

### Three.js Setup Pattern
```js
// Only on desktop
if (window.innerWidth >= 768) {
  const canvas = document.createElement('canvas');
  const mountPoint = document.querySelector('[data-canvas="hero"]');
  mountPoint.appendChild(canvas);
  
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  // ... scene, camera, material setup
}
```

### Performance Budget
- Desktop: 60fps minimum during scroll
- Mobile: No WebGL at all. Zero GPU overhead from Three.js.
- Shader canvases pause rendering when not visible (IntersectionObserver)
- Hero canvas fully destroyed after scrolling past hero section
- Total Three.js canvases on page: max 3 simultaneously active (hero + 2 visible images)

### Cursor Implementation
```js
class BrandCursor {
  constructor() {
    this.ring = document.createElement('div');
    this.dot = document.createElement('div');
    this.mouse = { x: 0, y: 0 };
    this.ringPos = { x: 0, y: 0 };
    this.dotPos = { x: 0, y: 0 };
    // ... setup, append to body
    this.raf();
  }
  
  lerp(a, b, t) { return a + (b - a) * t; }
  
  raf() {
    this.ringPos.x = this.lerp(this.ringPos.x, this.mouse.x, 0.08);
    this.ringPos.y = this.lerp(this.ringPos.y, this.mouse.y, 0.08);
    this.dotPos.x = this.lerp(this.dotPos.x, this.mouse.x, 0.15);
    this.dotPos.y = this.lerp(this.dotPos.y, this.mouse.y, 0.15);
    
    this.ring.style.transform = `translate3d(${this.ringPos.x}px, ${this.ringPos.y}px, 0)`;
    this.dot.style.transform = `translate3d(${this.dotPos.x}px, ${this.dotPos.y}px, 0)`;
    
    requestAnimationFrame(() => this.raf());
  }
  
  // State changes from data-cursor attributes
  onElementHover(el) {
    const type = el.dataset.cursor;
    // ... switch on type, animate ring/dot
  }
}
```

### Scroll Velocity Reactor Pattern
```js
// Reads the velocity already exposed by Prompt 1's Lenis hook
const reactor = {
  update() {
    const v = parseFloat(getComputedStyle(document.documentElement)
      .getPropertyValue('--scroll-velocity')) || 0;
    
    // Image skew
    document.querySelectorAll('.image-canvas-wrapper').forEach(el => {
      el.style.transform = `skewY(${v * 0.3}deg)`;
    });
    
    // Title stretch
    document.querySelectorAll('[data-theme] h2').forEach(el => {
      el.style.transform = `scaleY(${1 + Math.min(v * 0.005, 0.05)})`;
    });
    
    requestAnimationFrame(() => reactor.update());
  }
};
reactor.update();
```

---

## What NOT to Add

- No floating edge decorations (unlike Cadencio design system — that was overdone)
- No scroll-driven birds or particles
- No sound effects
- No page transition animations (single-page site)
- No loading bar or percentage counter
- No WebGL on mobile, ever
- No shader effects that compete with content legibility
- The custom cursor never shows on touch devices

---

## Quality Benchmark

When this prompt is complete, the site should:
1. Make a visitor spend 30+ seconds on the hero just moving their mouse around the gradient canvas
2. Reward slow scrolling with smooth section color washes and subtle image skew
3. Make the logo feel like a physical object when hovering the navbar
4. Have exactly 2 "oh that's clever" origami moments (load unfold + divider fold) and zero "that's too much" moments
5. Run at 60fps on a 2020 MacBook Air
6. Look completely professional (just slightly less magical) on a mid-range Android phone with no WebGL
7. Make other Brazilian tech company sites look like WordPress templates by comparison
