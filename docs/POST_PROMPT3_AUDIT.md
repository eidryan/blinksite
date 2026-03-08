# Blinksite — Post Prompt 3 Full Audit
**Date:** March 2026 | **Auditor:** Copilot Design Judge | **Pass:** After Prompt 3 implementation

---

## Overview

Prompt 3 partially improved the site. Several architectural rewrites landed cleanly (new origami geometry hero, Fundadores two-column layout, font loading fixed, mobile nav entrance). However, critical animation logic still breaks, the scroll-spy has a disorienting regression, and the ComoAtuamos section's horizontal scroll card effects are non-functional due to a wrong GSAP API call. This document is a complete judge-level report covering every bug, design flaw, and code issue found in the current state.

---

## 🔴 Critical Bugs — Broken Functionality

### BUG-01 · Hero Text Reveal Never Animates
**File:** `src/components/Hero.jsx` | `src/App.jsx`

The GSAP word-reveal animation is tied to a `loaderComplete` custom event dispatched from `App.jsx`'s GSAP timeline `onComplete`. The sequence is:

```js
onComplete: () => {
  setLoading(false);        // <-- React state update (async, queues re-render)
  ScrollTrigger.refresh();
  window.dispatchEvent(new CustomEvent('loaderComplete')); // fires SYNCHRONOUSLY
}
```

The event fires synchronously in the same JS tick as `setLoading(false)`. React has NOT yet re-rendered at this point — the content wrapper still has `opacity-0`. Hero.jsx's listener fires and starts the GSAP timeline immediately, but the words are invisible (parent is opacity-0). By the time React re-renders and the transition completes (300ms), the animation has already played through behind the opacity mask.

**Symptom:** Text appears instantly (no clip-path slide-up, no rotationX) after the loader disappears. The animation ran; the user just never saw it.

**Fix:** Delay the `loaderComplete` dispatch until after React has re-rendered:
```js
onComplete: () => {
  setLoading(false);
  ScrollTrigger.refresh();
  // Wait for React re-render + 50ms safety margin before starting hero reveal
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent('loaderComplete'));
    });
  });
}
```

---

### BUG-02 · Navbar Active Section Flickers: Sobre → ComoAtuamos → Sobre
**File:** `src/components/Navbar.jsx`

**Root cause:** When GSAP pins the `ComoAtuamos` section (`pin: true`), it sets the section to `position: fixed`. The IntersectionObserver API considers `position: fixed` elements as always fully intersecting the viewport (they are not in the normal document flow). This means `como-atuamos` stays active throughout its pinned duration — correct. 

The bug is at the **unpin boundary**: when GSAP unpins the section, it briefly reverts to static flow while the scroll position "snaps" to the end of the pin spacer. During this 1-2 frame window, the Intersection Observer sees `sobre` enter the viewport from the top (its computed rect briefly enters the observer root), triggering `setActiveSection('sobre')` before `como-atuamos` re-fires as the page settles.

**Additionally:** `entry.intersectionRatio > 0.3` is evaluated per-entry, but the IntersectionObserver callback fires with ALL changed entries at once. If both `sobre` and `como-atuamos` fire in the same callback (one entering, one leaving), the `forEach` processes them sequentially — whichever comes last in `entries[]` wins. Browser ordering is not guaranteed.

**Fix:** Replace IntersectionObserver with a GSAP ScrollTrigger-based approach (which already accounts for pins and spacers):

```js
// In Navbar.jsx useEffect — replace the IntersectionObserver block with:
const sectionIds = ['sobre', 'como-atuamos', 'portfolio', 'fundadores'];
const triggers = sectionIds.map(id => {
  const el = document.getElementById(id);
  if (!el) return null;
  return ScrollTrigger.create({
    trigger: el,
    start: 'top 45%',
    end: 'bottom 45%',
    onEnter: () => setActiveSection(id),
    onEnterBack: () => setActiveSection(id),
    onLeave: () => {},
    onLeaveBack: () => {},
  });
}).filter(Boolean);

return () => triggers.forEach(t => t.kill());
```

This requires importing `ScrollTrigger` in Navbar.jsx and running the effect AFTER `App.jsx` registers the plugin (guaranteed since App mounts first).

---

### BUG-03 · ComoAtuamos Card Scale/Opacity Effects Don't Fire
**File:** `src/components/ComoAtuamos.jsx` lines 72–85

`containerAnimation` must receive a **ScrollTrigger instance**, not a GSAP timeline. The current code passes `tl` (the timeline object):

```js
// ❌ WRONG — tl is a GSAP Timeline, not a ScrollTrigger
scrollTrigger: {
  containerAnimation: tl,   // <-- bug
  trigger: card,
  start: 'left center',
  ...
}
```

The correct reference is `tl.scrollTrigger` (the ScrollTrigger that drives the timeline):

```js
// ✅ CORRECT
scrollTrigger: {
  containerAnimation: tl.scrollTrigger,
  trigger: card,
  start: 'left 70%',
  end: 'left 30%',
  scrub: true,
}
```

Additionally, `start: 'left center'` / `end: 'right center'` are valid only when the card occupies a known horizontal range that can be calculated by the containerAnimation. Using `left 70%` and `left 30%` ensures the mid-card is fully active in the center. Cards 2 and 3 (non-zero index) never reach 1.0 opacity/scale because the trigger never fires.

---

### BUG-04 · OrigamiStar Unfold Stagger Is Invalid GSAP Syntax
**File:** `src/components/OrigamiStar.jsx` line 43

```js
// ❌ WRONG — position parameter cannot be a function in tl.to()
tl.to(face, {
    rotationX: 0,
    duration: 0.8,
    ease: "back.out(1.5)",
}, i => i * 0.05 + 0.2); // <-- BUG: 'i' is undefined here; this is not valid GSAP
```

`gsap.timeline().to(target, vars, position)` — the `position` parameter is a string or number, not a function. The `i` callback is only valid inside `gsap.to()` for property values, not for timeline positions. Because `i` is called as a function with the index, it produces `NaN` and all faces animate at position 0 simultaneously (no stagger).

**Fix:** Replace the `.forEach` loop with a single staggered call:

```js
tl.to(faces, {
    rotationX: 0,
    duration: 0.8,
    ease: "back.out(1.5)",
    stagger: 0.05,
}, 0.2);
```

---

### BUG-05 · BrandCursor Press Scale Animation Immediately Overridden
**File:** `src/components/BrandCursor.jsx` lines 99–107

`onMouseDown` sets `ring.style.transform` to include `scale(0.85)`. However, the `render()` rAF loop runs continuously every frame and immediately overwrites `ring.style.transform` with the standard `translate3d(...)` without any scale, erasing the press effect within 16ms (one frame).

**Fix:** Track press state and apply it inside the render loop:

```js
let isPressed = false;

const render = () => {
    ringPos.x = lerp(ringPos.x, mouse.x, 0.08);
    ringPos.y = lerp(ringPos.y, mouse.y, 0.08);
    dotPos.x = lerp(dotPos.x, mouse.x, 0.15);
    dotPos.y = lerp(dotPos.y, mouse.y, 0.15);
    const pressScale = isPressed ? ' scale(0.85)' : '';
    ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)${pressScale}`;
    dot.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0) translate(-50%, -50%) scale(${dot.dataset.scale || 1})`;
    rafId = requestAnimationFrame(render);
};

const onMouseDown = () => { isPressed = true; dot.dataset.scale = 0.85; };
const onMouseUp   = () => { isPressed = false; dot.dataset.scale = 1; };
```

---

### BUG-06 · GSAP Ticker Cleanup Reference Is Wrong (Memory Leak)
**File:** `src/App.jsx` line 138

```js
// ❌ WRONG — lenis.raf is a prototype method, not the bound function added to ticker
gsap.ticker.remove(lenis.raf);
```

`gsap.ticker.add((time) => { lenis.raf(time * 1000); })` adds an **anonymous arrow function** to the ticker. `gsap.ticker.remove(lenis.raf)` tries to remove the `raf` method itself — this never matches the anonymous function. The ticker callback is never removed, running indefinitely even after `lenis.destroy()`.

**Fix:**

```js
const lenisRaf = (time) => lenis.raf(time * 1000);
gsap.ticker.add(lenisRaf);
gsap.ticker.lagSmoothing(0);

// In cleanup:
gsap.ticker.remove(lenisRaf);
```

---

### BUG-07 · `ComoAtuamos` `end` Calculation Scrolls Too Far
**File:** `src/components/ComoAtuamos.jsx` line 62

```js
end: () => `+=${containerWidth}`,
```

`containerWidth` is the full `scrollWidth` of the flex container — e.g., 1550px for 3×450px cards + gaps. But the visible area already shows the first card. The actual scroll needed to bring the last card to the right edge is `containerWidth - windowWidth`. Using the full `containerWidth` means the pin lasts 1550 scroll units but only 400px of actual content motion remains after the last card is fully visible — the section stays pinned with nothing left to animate. This makes the section feel "dead" at the end.

**Fix:**

```js
const xToScroll = -(containerWidth - windowWidth + 80); // 80px breathing room
...
end: () => `+=${containerWidth - windowWidth + 80}`,
```

---

## 🟡 Design & UX Issues — Designer Judge Score

### DESIGN-01 · Hero WebGL: Facets Are Invisible / Indistinguishable from Background
**Severity:** High

The fragment shader outputs `gl_FragColor = vec4(finalColor, 0.22 + vFold * 0.06)`. Alpha is `0.22` — very transparent. Combined with the vignette mixing toward `dark = vec3(0.129)` (nearly identical to the `#212121` hero background), the origami facets are essentially invisible at rest. The fold wave on mouse interaction adds `vFold` up to `0.06` more opacity, but this is imperceptible.

**The visual intent (branded origami tessellation) is not achieved.** The hero looks identical to a plain dark background. An Awwwards judge would penalize this immediately.

**Fix options:**
1. **Increase base alpha** to 0.45–0.6 so facets are clearly visible
2. **Reduce vignette strength** — `vignette * 0.88` kills almost all color near edges. Use `* 0.55` instead
3. **Increase fold wave amplitude** — current `* 0.06` max z-displacement is `0.06` units (barely moves). Use `* 0.12`
4. **Add subtle face edge highlighting** via a second pass or barycentric wire trick

---

### DESIGN-02 · Fundadores Photos: Too Tall, Wrong Proportion
**Severity:** Medium

`style={{ aspectRatio: '3/4' }}` on each founder image wrapper creates portrait images. On desktop with `max-w-7xl` layout, each column is approximately 580px wide. At 3:4 ratio that's ~773px tall — nearly the full viewport height just for one photo. This is visually unbalanced and makes the section feel oversized.

**Recommended ratio:** `4/3` (landscape) or `1/1` (square) fits better with the side-by-side layout and matches editorial-style founder photography on award-winning sites (e.g., Locomotive Agency, Resn). 

**Current problem:** The photo takes up so much vertical space that the bio text is pushed far below, breaking the visual pairing between portrait and bio.

---

### DESIGN-03 · Fundadores: No Photo Stack / Change Effect (User Requested)
**Severity:** Medium — User Explicit Request

The user asked for "a stack of photos that change, maybe even the capability of adding a gif or small video." The current implementation has exactly one static `<img>` per founder with no ability to show multiple photos or media types.

**Needed:** Each founder card should support an array of media items (images, GIFs, MP4 loops). A click or hover cycles through them with a stacking/flip transition effect. The WebGL chromatic aberration should fire on each transition.

---

### DESIGN-04 · ComoAtuamos Section Title Gets `scaleY` Applied During Scroll
**Severity:** Medium

`ScrollVelocityReactor.jsx` targets `[data-theme] h2` and applies `scaleY()`. The ComoAtuamos section has an `h2` ("Construímos junto. Escalamos depois."). During fast scroll, this title stretches vertically. But because the section is simultaneously pinned and the title is in a `shrink-0` flex child, the scaleY transform conflicts with the section's pinning behavior and creates a jarring visual glitch.

**Fix:** Add a `data-no-stretch` attribute to pinned section titles and exclude them in SVR:

```js
const titles = document.querySelectorAll('[data-theme] h2:not([data-no-stretch])');
```

---

### DESIGN-05 · `brand-gradient-divider` Start State Blocks Visual Completion
**Severity:** Low–Medium

The divider CSS: `transform: perspective(400px) rotateY(90deg) scaleX(0)` — starts completely invisible. The GSAP animation targets `scaleX: 1, rotationY: 0`. However, when GSAP sets `rotationY: 0`, it drops the `perspective(400px)` from the transform string because GSAP manages transforms individually and replaces the inline `perspective()` with its own internal 3D context.

**Result:** The unfolding effect (perspective fold opening) happens without the perspective depth, looking like a flat scaleX slide rather than an origami unfold.

**Fix:** Remove the `perspective` from the CSS transform and apply it via the parent element instead:

```css
/* CSS */
.brand-gradient-divider {
  @apply h-[2px] w-full brand-gradient;
  transform-origin: left center;
  transform: scaleX(0) rotateY(90deg);
}
/* parent container */
.brand-gradient-divider-wrapper {
  perspective: 400px;
}
```

---

### DESIGN-06 · Portfolio "Ghost Cards" Feel Like Unfinished Placeholder Content
**Severity:** Medium — Visual Perception

Two `border-dashed` boxes with `animate-pulse` and "Em desenvolvimento" text read as "this page is incomplete." On an award-winning site, these would be treated with either:
1. **Intentional opacity** — Show locked/classified product names with a `●●●●●` mask
2. **Coming-soon concept art** — A blurred/grainy product screenshot hint
3. **Asymmetric layout** — One hero card + offset teaser cards (not a symmetric 2-col grid)

The current implementation signals "website unfinished" to a first-time visitor.

---

### DESIGN-07 · No Scroll Progress Indicator
**Severity:** Low

Award-winning sites in this style category (Awwwards SOTY) consistently feature a scroll progress indicator. Options: thin line at top right, radial progress circle near logo, or a vertical tick on the side. The site has none.

---

### DESIGN-08 · Hero Subtitle Font Weight Feels Weak at Mobile
**Severity:** Low

`font-body font-medium text-cream/70` renders the subtitle "Ferramentas que eliminam o que não deveria existir" at 70% opacity with medium weight on mobile (`text-lg`). On small screens and OLED displays with aggressive tone-mapping, this can be nearly invisible against the dark background.

---

### DESIGN-09 · Footer `brand-gradient-divider` Incorrectly Placed
**Severity:** Low

The footer uses `borderRadius: '3rem 3rem 0 0'` on the `<footer>` element to create a curved top edge. The `brand-gradient-divider` is `position: absolute top-0 left-0 w-full` with `h-[2px]`. A 2px div at the top of a `border-radius: 3rem` element will sit at the flat inner edge, not follow the curve. Visually, the line appears straight despite the rounded top.

---

## 🔧 Code Quality Issues

### CODE-01 · Redundant `gsap.registerPlugin(ScrollTrigger)` in 3 Files

`HeroCanvas.jsx` line 6, `Footer.jsx` line 5, `Portfolio.jsx` (import but not called — actually `ScrollTrigger` is imported but `registerPlugin` is NOT called in Portfolio.jsx, only in Footer.jsx and HeroCanvas.jsx).

While GSAP handles duplicate registration gracefully, it adds confusion and creates maintenance debt. All plugin registrations should live only in `App.jsx`.

**Files to fix:** Remove `gsap.registerPlugin(ScrollTrigger)` from `HeroCanvas.jsx` and `Footer.jsx`.

---

### CODE-02 · `window.innerWidth` Read at Render Time in ComoAtuamos (Hydration Risk)

`ComoAtuamos.jsx` line 137:
```jsx
opacity: window.innerWidth >= 1024 ? (idx === 0 ? 1 : 0.4) : 1,
```

This inline style is evaluated during React render. In SSR/prerender environments, `window` is undefined. Even in CSR-only (current setup), this value is frozen at initial render and won't update on viewport resize (though the `useEffect` does have `window.innerWidth < 1024` guard, the inline style is separate).

---

### CODE-03 · `ImageHoverEffect` Selects Wrappers at Mount Time

`ImageHoverEffect.jsx` queries `document.querySelectorAll('.image-canvas-wrapper')` at useEffect time. Because `ImageHoverEffect` is mounted before the content div is visible (the `{loading ? ... : ...}` wrapper), the images ARE in the DOM but `wrapper.getBoundingClientRect()` returns zero dimensions while opacity is 0.

When `updateSize()` runs on mount, `width` and `height` are 0 → `renderer.setSize(0, 0)` → WebGL context gets 0×0 canvas. On first mouse interaction, the canvas appears but with wrong dimensions until a `resize` event fires.

**Fix:** Defer `ImageHoverEffect` initialization to after the `loaderComplete` event (same as Hero.jsx).

---

### CODE-04 · `ComoAtuamos` Card Initial `transform` Set as Inline String

Line 138–139:
```jsx
style={{
  opacity: window.innerWidth >= 1024 ? (idx === 0 ? 1 : 0.4) : 1,
  transform: window.innerWidth >= 1024 ? (idx === 0 ? 'scale(1)' : 'scale(0.92)') : 'scale(1)'
}}
```

When GSAP later tries to animate `scale` on these elements, it reads the inline `transform: scale(...)` string and must parse it. GSAP's `transform` parser handles `scale()` strings, but the GSAP-managed state conflicts with manually set inline transforms when both GSAP's `ScrollTrigger` (via `containerAnimation`) and the initial inline style operate on the same transform property. This causes a jump when the first GSAP tween fires.

**Fix:** Set initial states using `gsap.set()` inside `useEffect`, not via inline `style`:
```js
gsap.set(cards, { scale: 0.92, opacity: 0.4 });
gsap.set(cards[0], { scale: 1, opacity: 1 });
```

---

### CODE-05 · Footer WhatsApp and LinkedIn Are `href="#"`

`Footer.jsx` lines 102, 104:
```jsx
<a href="#" ...>WhatsApp</a>
<a href="#" ...>LinkedIn</a>
```

These are non-functional dead links. WhatsApp should be `https://wa.me/55XXXXXXXXXXX` and LinkedIn should be the actual company URL. Until real URLs are available, they should be `aria-disabled="true"` with `cursor-not-allowed` styling so users know they're placeholders.

---

### CODE-06 · `Sobre.jsx` `animate-[breathe_6s_infinite]` — Keyframe Works Now

Previously `@keyframes breathe` was missing. It is now correctly defined in `index.css`. ✅ Resolved.

---

## 📐 Per-Section Assessment (Designer Judge Scores)

| Section | Score | Status |
|---|---|---|
| Loader | 6/10 | OrigamiStar unfold broken (BUG-04), but star design itself is strong |
| Hero | 4/10 | WebGL invisible (DESIGN-01), text animation never shows (BUG-01) |
| Sobre | 7/10 | Clean, readable, animations fire correctly |
| Como Atuamos | 4/10 | Horizontal scroll present but card effects broken (BUG-03, BUG-07), nav flicker (BUG-02) |
| Portfolio | 6/10 | Strong Cadencio card; ghost placeholders hurt professional perception (DESIGN-06) |
| Fundadores | 5/10 | Layout is cleaner than polaroid, but photos too tall (DESIGN-02), no stack/media (DESIGN-03) |
| Footer | 6/10 | Entrance animation works, but dead links (CODE-05) and divider position off (DESIGN-09) |

**Overall Site Score (Post Prompt 3): 5.1 / 10**
*Previous score (pre-Prompt 3): estimated 4.3 / 10*
*Awwwards SOTY baseline: 8.5+ / 10*

---

## 🎯 Priority Fix List for Prompt 4

### P0 — Must fix before any review
1. **BUG-01** — `requestAnimationFrame(rAF)` wrapper on `loaderComplete` dispatch so hero animation is visible
2. **BUG-02** — Replace IntersectionObserver scroll-spy with GSAP ScrollTrigger-based approach
3. **BUG-03** — Change `containerAnimation: tl` → `containerAnimation: tl.scrollTrigger`
4. **BUG-07** — Fix `end` calculation: `+=${containerWidth - windowWidth + 80}`

### P1 — Core experience
5. **DESIGN-01** — Increase hero WebGL alpha (0.22 → 0.50), reduce vignette (0.88 → 0.55), increase fold wave (0.06 → 0.14)
6. **DESIGN-02** — Change Fundadores `aspectRatio` from `3/4` to `4/3` or `1/1`
7. **DESIGN-03** — Implement photo stack with media array per founder (img/gif/video support)
8. **BUG-04** — Fix OrigamiStar stagger with `gsap.to(faces, { ..., stagger: 0.05 }, 0.2)`
9. **BUG-05** — Move cursor press scale into render loop via `isPressed` flag
10. **BUG-06** — Store lenis rAF reference for proper GSAP ticker cleanup

### P2 — Polish
11. **DESIGN-04** — Add `data-no-stretch` to ComoAtuamos h2 to exclude from SVR velocity effect
12. **DESIGN-05** — Fix brand-gradient-divider perspective wrapper approach
13. **DESIGN-06** — Replace Portfolio ghost cards with styled "locked" concept placeholders
14. **CODE-01** — Remove redundant `registerPlugin` from HeroCanvas.jsx and Footer.jsx
15. **CODE-03** — Defer ImageHoverEffect init to after loaderComplete event
16. **CODE-04** — Move ComoAtuamos card initial states to `gsap.set()` inside useEffect
17. **CODE-05** — Fix footer dead links (aria-disabled until real URLs)

### P3 — Nice to have
18. **DESIGN-07** — Add scroll progress indicator (thin line top-right or radial)
19. **DESIGN-08** — Increase hero subtitle opacity on mobile to `/80` or `/90`
20. **DESIGN-09** — Reposition footer divider to follow rounded-top edge correctly

---

## 🏆 What Is Working Well (Keep These)

- ✅ **Font loading** — Moved from CSS `@import` to `<link>` preconnect in `index.html` — correct and fast
- ✅ **GSAP plugin registration** — Single call in `App.jsx` (except for HeroCanvas.jsx and Footer.jsx regressions)
- ✅ **`main-loader-star` class** — Added to OrigamiStar in App.jsx — the guard in OrigamiStar.jsx now works
- ✅ **Mobile nav overlay** — GSAP stagger clip-path entrance/exit implemented correctly
- ✅ **Nav scroll-spy structure** — IntersectionObserver approach is in place (just needs GSAP ScrollTrigger replacement per BUG-02)
- ✅ **`@keyframes breathe`** — Defined in index.css, Sobre origami accent animates correctly
- ✅ **Footer entrance animation** — clip-path word reveal on textRef implemented
- ✅ **HeroCanvas scroll-out fade** — ScrollTrigger opacity 1→0 implemented and working
- ✅ **HeroCanvas resolution init order** — Fixed; `setSize()` now called after material creation
- ✅ **Origami geometry** — `buildOrigamiGeometry(24, 16)` and shaders are architecturally correct; just need visibility tuning
- ✅ **Fundadores two-column layout** — Cleaner than polaroid stack; 3D tilt on hover works
- ✅ **Lenis smooth scroll** — Well configured, velocity exposed on `document.body.dataset`
- ✅ **BrandCursor** — Architecture is solid; only the press-scale rAF conflict needs fixing
- ✅ **ImageHoverEffect** — WebGL chromatic aberration on hover works after images load

---

*Report generated from full static code analysis of all 12 source files in `src/`. No live rendering environment available — visual scores are based on code path analysis and CSS/shader review.*
