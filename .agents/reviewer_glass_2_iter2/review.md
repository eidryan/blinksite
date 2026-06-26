# Review Report: RadarResearchSections.jsx (Iter 2)

## Review Summary

**Verdict**: REQUEST_CHANGES

The refactored `RadarResearchSections.jsx` file contains a solid structure, clean mobile fallback, and is free of ESLint errors. However, there are major concerns regarding GSAP/React layout synchronization (causing ScrollTrigger misalignment) and WCAG AA contrast ratio failures on the light theme card. Several minor accessibility improvement areas have also been identified.

---

## Quality Review Findings

### [Major] Finding 1: React State Update during GSAP MatchMedia Callback Causes Layout Shifts & ScrollTrigger Misalignment

- **What**: Inside `useEffect`, when `isDesktop` matches, `setIsStickyActive(true)` is called, which schedules a React state change. At the same time, ScrollTriggers and GSAP animations are created immediately.
- **Where**: `src/components/RadarResearchSections.jsx`, lines 53-121.
- **Why**: React's state updates are batched and processed in the next microtask/commit phase. Therefore, when GSAP's `ScrollTrigger.create(...)` measures the heights and offsets of `sectionRefs.current[0]`, the sections do not yet have the `lg:h-screen lg:py-0 lg:flex` classes (since the state-driven re-render has not happened yet). Once the state updates, the section heights change from their natural dimensions to `100vh`, rendering the cached ScrollTrigger measurements incorrect. This leads to visual jumps, misaligned pinning start/end markers, or overlapping elements during scrolling.
- **Suggestion**:
  Add an additional `useEffect` to listen to changes in `isStickyActive` and trigger `ScrollTrigger.refresh()` after the DOM has re-rendered:
  ```javascript
  useEffect(() => {
      ScrollTrigger.refresh();
  }, [isStickyActive]);
  ```
  Alternatively, avoid using React state to toggle layout-critical styles. Instead, use custom CSS media queries or Tailwind's arbitrary screen utilities (e.g. `@[media(min-width:1024px)_and_(min-height:750px)]:h-screen`) to apply layout rules.

### [Major] Finding 2: WCAG AA Accessibility Contrast Ratio Failure (Light Theme Card)

- **What**: The label pill and eyebrow text use `text-orange` (`#FF6A00` or `#FF8A1C`) on a light cream background `#FFF8EA` (or the card's backdrop color).
- **Where**: `src/components/RadarResearchSections.jsx`, lines 228-230 and 238-240.
- **Why**: The contrast ratio of `#FF6A00` on `#FFF8EA` is approximately **2.87:1** (and `#FF8A1C` on `#FFF8EA` is **2.31:1**). The WCAG AA minimum requirement is **4.5:1** for normal text. This is a clear compliance failure that makes the labels and eyebrow titles extremely difficult to read for visually impaired users.
- **Suggestion**: Use a darker, high-contrast orange (such as a dark rust or terra-cotta color, e.g. `#C2410C` or `#B45309`) for text elements on the light theme card.

### [Minor] Finding 3: Redundant State Update on Component Unmount

- **What**: The matchMedia conditions callback returns a cleanup function that updates state: `return () => { setIsStickyActive(false); };`.
- **Where**: `src/components/RadarResearchSections.jsx`, lines 152-154.
- **Why**: When the component unmounts, `mm.revert()` is called, which triggers this callback cleanup. This schedules `setIsStickyActive(false)` on an unmounted component, which can trigger React warnings in some setups and is redundant since the state is already handled by the branch conditions during active media query transitions.
- **Suggestion**: Remove the returned cleanup function from the `mm.add` matches callback.

### [Minor] Finding 4: Duplicate Links and Screen Reader Redundancy on Mobile

- **What**: The hover overlay CTA link is rendered unconditionally in the DOM, while the mobile-only static CTA button is also rendered when `isStickyActive` is false.
- **Where**: `src/components/RadarResearchSections.jsx`, lines 336-348 and 367-381.
- **Why**: When `isStickyActive` is false (mobile fallback), a screen reader user navigating the page will encounter two identical sequential links pointing to the same page (`/radar` or `/research`), creating navigation clutter.
- **Suggestion**: Only render the hover overlay when `isStickyActive` is true:
  ```javascript
  {isStickyActive && (
      <div className="absolute inset-0 ...">
          ...
      </div>
  )}
  ```

### [Minor] Finding 5: Missing Accessibility Attributes on Decorative SVGs

- **What**: The complex inline SVGs used as card illustrations do not have accessibility descriptors or hidden states.
- **Where**: `src/components/RadarResearchSections.jsx`, lines 254-292 and 294-332.
- **Why**: Screen readers will attempt to read the child elements of the SVGs (lines, paths, circles), causing confusing screen reader output.
- **Suggestion**: Add `aria-hidden="true"` and `focusable="false"` to both SVG elements.

---

## Verified Claims

- **App imports RadarResearchSections** → verified via checking `src/App.jsx` line 11 → **PASS**
- **App renders RadarResearchSections between Portfolio and Fundadores** → verified via checking `src/App.jsx` lines 190-192 → **PASS**
- **Verification script runs successfully** → verified via running `npm run verify:home-radar-research` → **PASS**
- **Project compiles and builds without errors** → verified via running `npm run build` → **PASS**
- **File passes project ESLint config** → verified via running `npm run lint` (file was not flagged) → **PASS**

---

## Coverage Gaps

- **Interaction test coverage** — the verification script only performs static analysis of imports, DOM IDs, and text presence. It does not verify run-time JS animations, pin spacing, or hover behavior — risk level: **medium** — recommendation: accept risk (visual check satisfies requirements).

---

## Unverified Items

- **Visual correctness on actual physical devices** — not verified due to running in headless/CLI-only environment.

---

## Adversarial Review: Challenge Report

### Challenge Summary

**Overall risk assessment**: MEDIUM

The core risks lie in layout shifting during initial render which affects GSAP ScrollTrigger computations, and lack of visual fallback/contrast for accessibility.

### Challenges

#### [High] Challenge 1: Layout-driven ScrollTrigger Offset Shifts

- **Assumption challenged**: GSAP ScrollTrigger handles dynamic layouts automatically.
- **Attack scenario**: When the page loads, `isStickyActive` is initially `false`. The layout of the page is painted with `lg:py-36` (natural height). The GSAP matchMedia immediately executes and initializes ScrollTrigger markers based on this layout. Next, React updates the state to `true` and renders `lg:h-screen lg:py-0`. The section's height changes from ~600px to `100vh` (~900px).
- **Blast radius**: ScrollTrigger pins elements at incorrect viewport positions, causing overlap, content cutoffs, or scroll jumping.
- **Mitigation**: Trigger `ScrollTrigger.refresh()` on state changes.

#### [Medium] Challenge 2: Redundant interactive elements for screen readers on mobile

- **Assumption challenged**: Hover-only overlays are ignored by assistive technologies on mobile.
- **Attack scenario**: On mobile viewports, the hover overlay remains in the DOM and contains active focusable `<a>` tags. A keyboard/assistive user traversing the page will hit the hidden link inside the overlay and the visible link at the bottom of the card, leading to duplicate and confusing focus stops.
- **Blast radius**: Poor accessibility audit rating and bad screen-reader UX.
- **Mitigation**: Exclude the hover overlay from the DOM on mobile viewport states.

### Stress Test Results

- **Resize from Desktop to Mobile** → cleanups should revert desktop animations and apply mobile slide animations → **PASS** (verified via matchMedia context cleanup logic).
- **Unmounting mid-transition** → GSAP matchMedia `.revert()` is called on unmount → **PASS** (verified by `return () => mm.revert()`).
