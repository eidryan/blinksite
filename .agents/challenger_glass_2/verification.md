# Correctness and Robustness Verification Report - Sticky Scroll Stacking

**Target File**: `src/components/RadarResearchSections.jsx`  
**Working Directory**: `/Users/luancarvalho/Documents/GitHub/blinksite/.agents/challenger_glass_2/`  
**Execution Date**: 2026-06-26T03:25:09Z  

---

## 1. Overview of Transition Configuration

The Sticky Scroll Stacking animation between the **Radar** (`#radar`) and **Research** (`#research`) sections is implemented using React, GSAP, and GSAP's `ScrollTrigger` extension. It targets desktop users with a premium card stacking transition where the `#radar` section pins in place, scaling down slightly and fading to 50% opacity, while the `#research` section scrolls naturally over it. Mobile users receive a clean non-sticky layout transition.

---

## 2. ScrollTrigger Code Check

### 2.1 Pinning Configuration
- **Target Code Block** (Lines 77–84):
  ```javascript
  ScrollTrigger.create({
      trigger: '#radar',
      pin: true,
      pinSpacing: false,
      start: 'top top',
      end: 'bottom top',
      invalidateOnRefresh: true,
  });
  ```
- **Check: Uses `pinSpacing: false` and `pin: true`?**
  - **Result**: **PASS**. 
  - **Rationale**: `pin: true` ensures `#radar` is stuck in the viewport once its top reaches the viewport top. `pinSpacing: false` ensures no whitespace spacer is added below the pinned section, allowing `#research` (the next sibling element in the DOM) to scroll up directly on top of `#radar`.

### 2.2 Resize Recalculation (`invalidateOnRefresh`)
- **Check: Is `invalidateOnRefresh: true` included?**
  - **Result**: **PASS**.
  - **Rationale**: All ScrollTrigger instances in the file use `invalidateOnRefresh: true`.
    - ScrollTrigger 1 (Entrance Reveal Card 0): `invalidateOnRefresh: true` (Line 70)
    - ScrollTrigger 2 (Pin Card 0): `invalidateOnRefresh: true` (Line 83)
    - ScrollTrigger 3 (Scale/Fade Out Card 0): `invalidateOnRefresh: true` (Line 97)
    - ScrollTrigger 4 (Entrance Reveal Card 1): `invalidateOnRefresh: true` (Line 116)
    - ScrollTrigger 5 (Mobile Fallbacks): `invalidateOnRefresh: true` (Line 143)
    This forces GSAP to clear cached position values and recalculate all ScrollTrigger start/end triggers dynamically whenever the viewport is resized.

### 2.3 Mobile Fallback Triggering
- **Target Code Block** (Lines 45–53, 121–148):
  ```javascript
  const mm = gsap.matchMedia();

  mm.add({
      isDesktop: '(min-width: 1024px) and (min-height: 750px)',
      isMobile: '(max-width: 1023px), (max-height: 749px)',
  }, (context) => {
      const { isDesktop } = context.conditions;

      if (isDesktop) {
          // DESKTOP animation sequence
          ...
      } else {
          // MOBILE fallback: standard non-sticky entrance fade-and-slide animations
          ...
      }
  });
  ```
- **Check: Does the mobile fallback trigger correctly on resize?**
  - **Result**: **PASS**.
  - **Rationale**: The GSAP `matchMedia()` utility is used. The conditions are complementary and cover the entire screen dimensions space:
    - Desktop: Width $\ge$ 1024px AND Height $\ge$ 750px
    - Mobile: Width $\le$ 1023px OR Height $\le$ 749px
    When the viewport crosses these thresholds, `matchMedia` automatically kills/reverts the active ScrollTriggers/Tweens and sets up the animations for the new query condition.

---

## 3. Build and Verification Scripts

- **`npm run verify:home-radar-research`**:
  - **Command**: `node scripts/verify-home-radar-research.mjs`
  - **Status**: **PASS**
  - **Output**: `Home Radar/Research verification passed (20 checks).`
- **`npm run build`**:
  - **Command**: `vite build`
  - **Status**: **PASS**
  - **Output**: `✓ 1771 modules transformed. ... built in 1.30s` (Successfully outputted `dist/assets/index-BdWlNe-V.js` and `dist/assets/index-C5hvgAQD.css`).
- **`npm run lint`**:
  - **Command**: `eslint .`
  - **Status**: **FAIL** (1 syntax/undef error in a separate agent script `calc_verify.js`, 1 in root `debug.js`, and 1 missing display name error in `VapourTextEffect.jsx`. No lint warnings/errors exist for `src/components/RadarResearchSections.jsx`).

---

## 4. Adversarial Review (Failure Modes & Challenges)

### Challenge Summary
- **Overall risk assessment**: **MEDIUM**

### Challenges

#### [Medium] Challenge 1: Viewport Height Mismatch Between Tailwind CSS & GSAP matchMedia
- **Assumption challenged**: Responsive styling breakpoints in CSS align seamlessly with responsive script conditions in JS.
- **Attack scenario**: A user opens the site on a device with a landscape tablet viewport or a desktop window size of **1200px width** and **700px height** (e.g., standard laptops with active toolbars, developer tools, or dock visible).
  - **JS Behavior**: Evaluates `isMobile: true` (since height $700\text{px} < 750\text{px}$). It loads the mobile fallback animations (standard non-sticky scrolling).
  - **CSS Behavior**: Matches `lg:` media query (since width $1200\text{px} \ge 1024\text{px}$). It applies class `lg:h-screen lg:py-0 lg:flex lg:items-center lg:justify-center` and `relative overflow-hidden` to the section container.
- **Blast radius**:
  - The section container is restricted to exactly `100vh` (700px) with `overflow-hidden`.
  - The card component inside contains content (padding, header, title, description body, 16:9 SVG image, footer tags) which requires a minimum height of approximately `715px`.
  - Since the container has `h-screen` and `overflow-hidden` but does NOT pin, the cards will scroll normally, but their content will be clipped/cut off at the bottom because the card height exceeds the container height, and the user cannot scroll *inside* the card.
- **Mitigation**:
  - Align CSS height constraints with the JS matchMedia query. Replace the standard `lg:h-screen lg:py-0 lg:flex lg:items-center lg:justify-center` classes on the section element with custom Tailwind CSS arbitrary media query classes:
    `[@media(min-width:1024px)_and_(min-height:750px)]:h-screen [@media(min-width:1024px)_and_(min-height:750px)]:py-0 [@media(min-width:1024px)_and_(min-height:750px)]:flex [@media(min-width:1024px)_and_(min-height:750px)]:items-center [@media(min-width:1024px)_and_(min-height:750px)]:justify-center`

#### [Low] Challenge 2: Jitter / Vibrating Cards on Safari When Using Lenis Smooth Scroll
- **Assumption challenged**: Pinned elements inside smooth scrolling wrappers remain visually stable.
- **Attack scenario**: When scrolling through pinned elements in WebKit/Safari, browser layout threads can disagree with GSAP's scroll position updates, creating visual jitter or flickering of the pinned card.
- **Blast radius**: Low-level visual degradation on Safari.
- **Mitigation**: The implementation already uses hardware-acceleration properties like `will-change-transform` and `transformStyle: 'preserve-3d'` on the card panels (Lines 207, 211). To fully secure WebKit rendering stability, adding `backface-visibility: hidden` (e.g. `backface-hidden` or style property) to the panel container is recommended.

---

## 5. Unchallenged Areas
- **Mobile Touch Gesture Scroll Acceleration**: Handheld mobile scroll velocity was not dynamically simulated. However, since no pinning or custom scroll hijacking is active on mobile, the native mobile browser engine will govern touch inertia, ensuring safety from scroll-lock conditions.

---

## 6. Conclusion
The Sticky Scroll Stacking animation configuration is robust, properly utilizing `pinSpace: false`, `pin: true`, and `invalidateOnRefresh: true` inside a GSAP matchMedia context. Both the production build and verification scripts run and compile successfully. The only minor layout robustness bug identified is a CSS-to-JS media query height mismatch (Challenge 1) which can clip card contents on viewports where width is desktop-sized but height is restricted under 750px.
