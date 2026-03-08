# THE DIAMOND MANIFESTO: WORLD-CLASS WEB ARCHITECTURE (V2.0)
> **Reference Level:** Awwwards Site of the Year / FWA of the Month  
> **Target:** blinksite Evolution to 💎 Diamond Tier

---

## 1. THE LOADER: THE CINEMATIC PROLOGUE
*The loader is not a "wait state"—it is the brand's handshake. It establishes the visual laws of the universe before the first pixel of content appears.*

- **SPATIAL CONTINUITY (The "Seed"):** The primary visual element in the loader (e.g., the Origami Star) must be the **exact same DOM element** that eventually lives in the Hero or Navbar. It does not fade out; it *morphs* or *translates* to its final destination.
- **ENTRANCE STAGGER:** Content behind the loader should be at `opacity: 0` and only begin its reveal timeline `onComplete` of the loader exit. 
- **PHASED REVEAL:** 
    1. **Forming:** The logo/icon builds itself (unfolding, drawing, or growing).
    2. **Steady:** A subtle breathing animation while assets load.
    3. **The Vector:** The element shrinks and travels to its "home" (e.g., the top-left logo position).
- **TECHNICAL REQUIREMENT:** Must use a unified GSAP Timeline (`tl`) that controls both the loader UI and the initial Hero entrance to ensure zero "dead frames" between load and interaction.

---

## 2. THE HERO: THE ATMOSPHERIC ANCHOR
*The Hero must create a 3D "Stage" that feels alive, reactive, and impossible to replicate with a template.*

- **THE TRI-AXIS DEPTH SYSTEM:** 
    1. **Z-0 (Atmosphere):** A WebGL shader or generative noise field at 15-20% opacity. It must respond to mouse proximity with a "ripple" or "distortion" field (not a simple spotlight).
    2. **Z-10 (Interaction):** A watermark or brand mark (The Star) that rotates at a non-linear speed (driven by scroll velocity).
    3. **Z-20 (Content):** Typography that sits "above" the atmosphere.
- **TYPOGRAPHIC REVEAL:** No simple slides. Use **Clip-Path Staggering**. Words or characters should emerge from an invisible "slit" with a slight 3D tilt (`rotateX: 10deg`) to create perceived thickness.
- **THE LIVING SCENE:** The Hero is never static. If the user does nothing, the background must "breathe" (subtle Sine-wave movement in the shader).

---

## 3. THE CURSOR: THE NEURAL LINK
*In Diamond sites, the cursor is the user's "hand" in the digital world. It is the primary feedback loop.*

- **THE DUAL-BODY SYSTEM:** A "Dot" (Immediate/Precise) and a "Ring" (Delayed/Lerped).
- **LERP DYNAMICS:** 
    - **Dot:** 0.15 - 0.20 (Snappy).
    - **Ring:** 0.06 - 0.10 (Fluid/Elastic).
- **MORPHOLOGY (Context Awareness):**
    - **Link Hover:** Ring expands, dot disappears, or text appears inside (`VIEW`, `OPEN`, `PLAY`).
    - **Image Hover:** Ring turns into a solid circle with `mix-blend-mode: difference`.
    - **Click State:** Instant scale-down to `0.8` with a GSAP `elastic.out` spring back to `1.0`.
- **TECHNICAL INTEGRITY:** Must use `MutationObserver` to ensure the cursor recognizes new elements added to the DOM dynamically.

---

## 4. NAVIGATION: THE FLOATING COMMAND CENTER
*Navigation must feel like it's "floating" on the scroll, not "stuck" to the top.*

- **VELOCITY REACTIVITY:** The navbar's background blur or border intensity should increase based on `scrollVelocity`. Fast scrolling = more "friction" (more blur).
- **SCROLL-SPY PRECISION:** The "Active" indicator must travel between links with a GSAP `Power4.out` transition. No snapping.
- **THE PILL ARCHITECTURE:** Glassmorphism settings: `backdrop-blur: 12px`, `bg-white/5`, `border-white/10`.
- **MOBILE OVERLAY:** The mobile menu must be a full-bleed experience. Links should reveal using a staggered "vertical sweep" (clip-path bottom-to-top).

---

## 5. SHADERS & WEBGL: THE ENGINE OF AWE
*Shaders are used to create "Atmosphere," not "Gimmicks."*

- **FRAGMENTS & NOISE:** Use Simplex or Perlin noise to avoid "digital" patterns. Colors must be tied to the CSS Variables (`--orange`, `--gold`) to ensure branding is consistent.
- **INTERSECTION HYGIENE:** Every canvas must have an `IntersectionObserver`. If the canvas is 1px off-screen, `cancelAnimationFrame` must fire immediately.
- **CHROMATIC ABERRATION:** Used only on high-intensity interactions (like photo hover). Keep it subtle: R/B offset < 0.005.
- **RESOLUTION SCALING:** Always cap `devicePixelRatio` at 2.0 to prevent 4K monitors from melting the user's GPU.

---

## 6. SCROLL ARCHITECTURE: THE CONDUCTOR
*Diamond scroll is "Scrubbed," meaning the user is the motor of the animation.*

- **SMOOTH SCROLL (LENIS):** Must be configured with `lerp: 0.1` and `syncTouch: true`. 
- **THE PINNED TRANSITION:** Horizontal sections (Portfolio/Process) must "lock" the user. The entry into a horizontal scroll must feel like a "latch" clicking into place.
- **DEPTH PARALLAX:** Use `data-speed` attributes. Foreground elements move at `1.2x`, Background at `0.8x`. This "parallax sandwich" creates instant premium value.
- **SCROLL-DRIVEN SKEW:** As the user scrolls fast, the entire page content should subtly "lean" (skewY: 1-2deg) in the direction of the scroll.

---

## 7. CALL TO ACTION (CTA): THE MAGNETIC MOMENT
*A button is not a box; it is a magnetic field.*

- **PROXIMITY DETECTION:** When the cursor is within 100px of a primary CTA, the button should subtly "tilt" or "pull" toward the mouse position (The Magnetic Effect).
- **GRADIENT TRACKING:** The angle of the button's internal gradient should rotate to face the cursor position.
- **THE SPRING BACK:** On mouse leave, the button shouldn't just reset; it should "wobble" back into place using an `elastic.out` easing.

---

## 8. CARDS & GRID: THE SPATIAL HIERARCHY
*Cards must have internal "Depth" and "Life."*

- **3D TILT:** `onMouseMove`, the card rotates on its X and Y axes (Max 5deg). The shadow must move in the *opposite* direction to simulate a real light source.
- **INTERNAL PARALLAX:** The image inside the card should move slower than the card frame, creating a "window" effect.
- **GHOST STATES:** Placeholder cards for "Coming Soon" content must use a slow, breathing pulse animation (10s duration) to maintain the site's "heartbeat."

---

## 9. TYPOGRAPHY: THE VOICE
*Typography is the most visible indicator of quality.*

- **TRACKING (The "Secret"):**
    - **Display (7rem+):** -0.05em (Extreme Tight).
    - **Heads (3rem+):** -0.03em.
    - **Body (1rem):** 0 (Standard).
- **TEXT-WRAP:** Always use `text-wrap: balance` for headlines to prevent "widows" (single words on a new line).
- **COLOR HIERARCHY:**
    - **Primary:** 100% Opacity (White/Cream).
    - **Secondary:** 60% Opacity.
    - **Tertiary/Mono:** 40% Opacity + Monospace font.

---

## 10. MICRO-INTERACTIONS: THE "POLISH" LAYER
*These are the 1% details that separate Gold from Diamond.*

- **PAGINATION:** Dots shouldn't just change color; they should grow, morph into a line, or "fill up" like a progress bar as the section passes.
- **ICON ANIMATION:** SVGs should never be static. A "Radar" icon should have a pulsating ring; a "Star" should have a slow, shimmering rotate.
- **AUDIO (Optional):** At the Diamond level, ultra-low frequency "UI Clicks" (10ms "thips") on hover are common, but must be muted by default.

---

## 11. THE FOOTER: THE GRAND FINALE
*The site must end with as much energy as it started.*

- **THE SCOOP:** Use a large `border-radius` (e.g., `rounded-t-[100px]`) on the footer to create a "container" feel as the user reaches the end.
- **THE BIG CTA:** A massive, screen-filling headline ("VAMOS CONVERSAR") that uses the same clip-path reveal as the Hero.
- **THE SIGNATURE:** A small, pixel-perfect "Credit" line in monospace that acts as the "Director's Credit."

---

## 12. TECHNICAL INTEGRITY (THE BIBLE)
- **Lighthouse:** 95+ in all categories.
- **Asset Weight:** Total initial load < 2MB.
- **GSAP Hygiene:** Every `useEffect` must return a cleanup function that calls `ctx.revert()`. Zero zombie ScrollTriggers.
- **Accessibility:** 100% keyboard navigable. High contrast modes respected.

---

*This manifesto is the final blueprint. Every line of code added to **blinksite** from this moment forward must be measured against these 12 pillars.*
