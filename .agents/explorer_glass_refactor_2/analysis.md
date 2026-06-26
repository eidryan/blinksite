# Stacking Scroll Transition Analysis

This report presents the technical analysis and recommendation for implementing the **overlapping sticky card scroll behavior** (sticky stacking transition) in `src/components/RadarResearchSections.jsx`.

---

## 1. Core Scroll Stacking Strategy

To create a premium overlapping card transition where the second card (`05. Research`) slides up and covers the first card (`04. Radar`), we recommend a hybrid approach utilizing **CSS Flexbox/Tailwind layouts** and **GSAP ScrollTrigger pinning**.

### Why GSAP Pinning with `pinSpacing: false` is Superior to Pure CSS Sticky
While CSS `position: sticky` can achieve a basic stacking effect, a pure CSS approach introduces significant limitations:
* **No dynamic scaling or fading**: We cannot smoothly scale down or fade out the under-stacked card (`04. Radar`) as the next card scrolls on top of it.
* **Layout clipping on smaller viewports**: Dynamic heights are hard to manage purely in CSS when sticky containers overlap.
* **Scroll-driven animation fallback**: CSS-based scroll-driven animations have poor browser support (unsupported in Firefox).

By utilizing **GSAP ScrollTrigger pinning** with `pinSpacing: false`, we achieve:
1. **Perfect Overlay Control**: Section 1 is fixed (pinned) at the top of the viewport. Because `pinSpacing: false` is configured, Section 2 is allowed to scroll naturally over it.
2. **Visual Depth (3D Stack)**: We can animate Section 1's card panel (scale down to `0.92`, reduce opacity to `0.5`, or add a slight blur) in direct sync with the user's scroll progress as Section 2 enters the viewport.
3. **Smooth Integration with Lenis**: The scroll events align cleanly, avoiding layout jitters.
4. **Preserved Body Background Color Triggers**: Since the sections remain as separate DOM siblings in `src/components/RadarResearchSections.jsx`, the global ScrollTrigger logic in `src/App.jsx` (which triggers body background changes when `section[data-theme]` enters `top 50%`) is preserved and works out-of-the-box.

---

## 2. Proposed Code Changes

Below are the exact code modifications required to implement this interaction.

### A. JSX Structure & CSS Classes
To allow cards to be pinned at the top and centered in the viewport, the sections must be configured as full-screen flex containers on desktop.

Update the `<section>` wrapper in `src/components/RadarResearchSections.jsx`:

#### **Before:**
```jsx
<section
    key={section.id}
    id={section.id}
    ref={(element) => { sectionRefs.current[index] = element; }}
    data-theme={section.theme}
    className={`relative overflow-hidden px-6 py-28 lg:px-20 lg:py-36 ${isDark ? 'bg-dark text-cream' : 'bg-cream text-dark'}`}
>
```

#### **After (Recommended):**
```jsx
<section
    key={section.id}
    id={section.id}
    ref={(element) => { sectionRefs.current[index] = element; }}
    data-theme={section.theme}
    className={`relative overflow-hidden px-6 py-28 lg:px-20 lg:py-0 lg:h-screen lg:flex lg:items-center lg:justify-center ${
        index === 0 ? 'z-10' : 'z-20'
    } ${isDark ? 'bg-dark text-cream' : 'bg-cream text-dark'}`}
>
```
* **`lg:h-screen lg:py-0`**: Restructures the section on desktop to match the height of the viewport, removing static padding.
* **`lg:flex lg:items-center lg:justify-center`**: Centers the max-width card panel vertically and horizontally.
* **`index === 0 ? 'z-10' : 'z-20'`**: Sets explicit stacking contexts so that Section 2 (`05. Research`) always renders and slides *above* Section 1 (`04. Radar`).

---

### B. GSAP ScrollTrigger & matchMedia Code
Update the `useEffect` block in `src/components/RadarResearchSections.jsx` to configure the sticky stacking animation on desktop, while retaining a clean, performant fallback for mobile/tablet.

#### **Before:**
```javascript
useEffect(() => {
    const ctx = gsap.context(() => {
        panelRefs.current.forEach((panel, index) => {
            if (!panel) return;
            
            const isRight = contentSections[index].align === 'right';

            gsap.from(panel, {
                scrollTrigger: {
                    trigger: sectionRefs.current[index],
                    start: 'top 75%',
                    toggleActions: 'play none none reverse',
                },
                y: 80,
                x: isRight ? 50 : -50,
                opacity: 0,
                duration: 1.2,
                ease: 'power3.out',
            });
        });
    });

    return () => ctx.revert();
}, []);
```

#### **After (Recommended):**
```javascript
useEffect(() => {
    const ctx = gsap.context(() => {
        const mm = gsap.matchMedia();

        // 1. Mobile & Small Screen Fallback (< 1024px width or < 750px height)
        // Disables pinning and stacking to prevent clipping on short/narrow screens
        mm.add({
            isMobile: "(max-width: 1023px)",
            isShort: "(max-height: 749px)"
        }, (context) => {
            panelRefs.current.forEach((panel, index) => {
                if (!panel) return;
                const isRight = contentSections[index].align === 'right';

                // Standard fade-and-slide-in entrance
                gsap.fromTo(panel, 
                    { y: 80, x: isRight ? 50 : -50, opacity: 0 },
                    {
                        y: 0,
                        x: 0,
                        opacity: 1,
                        duration: 1.2,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: sectionRefs.current[index],
                            start: 'top 80%',
                            toggleActions: 'play none none reverse',
                        }
                    }
                );
            });
        });

        // 2. Desktop Premium Sticky Stacking (>= 1024px width AND >= 750px height)
        mm.add("(min-width: 1024px) and (min-height: 750px)", () => {
            const section1 = sectionRefs.current[0];
            const section2 = sectionRefs.current[1];
            const panel1 = panelRefs.current[0];
            const panel2 = panelRefs.current[1];

            if (!section1 || !section2 || !panel1 || !panel2) return;

            // Step 1: Pin the first section (Radar) when its top hits the top of the viewport
            // pinSpacing: false allows the next section (Research) to scroll up directly over it
            ScrollTrigger.create({
                trigger: section1,
                start: "top top",
                end: "bottom top", 
                pin: true,
                pinSpacing: false,
                id: "radar-pin",
                invalidateOnRefresh: true,
            });

            // Step 2: Scale down and fade Card 1 as Card 2 scrolls up over it (Depth effect)
            gsap.fromTo(panel1,
                { scale: 1, opacity: 1 },
                {
                    scale: 0.92,
                    opacity: 0.5,
                    ease: "none",
                    scrollTrigger: {
                        trigger: section2,
                        start: "top bottom", // Starts when Section 2 begins entering screen
                        end: "top top",      // Completes when Section 2 covers Section 1
                        scrub: true,
                        invalidateOnRefresh: true,
                    }
                }
            );

            // Step 3: Animate Card 2 entering the viewport
            gsap.fromTo(panel2,
                { y: 100, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: section2,
                        start: "top bottom",
                        end: "top 20%",
                        scrub: true,
                        invalidateOnRefresh: true,
                    }
                }
            );
        });
    });

    return () => ctx.revert();
}, []);
```

---

## 3. Layout, Height, and Background Mitigation Strategies

When implementing overlapping scroll layouts, several subtle bugs can occur. Below are specific recommendations to mitigate them:

| Pitfall | Risk Description | Solution / Mitigation |
| :--- | :--- | :--- |
| **Card Clipping on Small Screens** | The card is high (approx. 600px+ height). If the browser height is small (e.g. 700px), a full screen (`h-screen`) container will clip the top/bottom of the card when pinned. | **Height-aware Media Query**: In GSAP, include `(min-height: 750px)` in the sticky media query rules. Also apply responsive paddings (`p-8 lg:p-12`) and margins (`my-6 lg:my-10`) to compress the card container if needed. |
| **Background Bleed-through** | If the entering Section 2 has rounded corners or transparent backdrops, the pinned Section 1 beneath will bleed through the edges, breaking the visual layout. | **Global Theme Synced Corners**: The body background color transition is already handled in `App.jsx` when sections enter `top 50%`. By maintaining separate sections, the body background shifts to the appropriate theme color dynamically. The cards themselves must have solid backgrounds (`bg-[#181818]` / `bg-[#FFF8EA]`) to mask content. |
| **Safari Jitter & Rendering Glitches** | Safari's renderer optimized for compositing can struggle with GSAP pins inside smooth scrollers (like Lenis), causing the pinned element to flicker. | **Hardware Acceleration**: Set `will-change: transform`, `transform-style: preserve-3d`, and `backface-visibility: hidden` properties on the card panel elements. |
| **Out-of-Sync Resizes** | Dynamic page scaling or orientation changes on laptops can shift trigger points, breaking the pin coordinates. | **Pin Invalidation**: Add `invalidateOnRefresh: true` on all ScrollTriggers to force recalculation on window resize. |

---

## 4. Verification Plan

To verify the visual accuracy and prevent regressions:
1. **Run the existing verification script**:
   ```sh
   npm run verify:home-radar-research
   ```
   This ensures that all identifiers (`id="radar"`, `id="research"`), navigation anchors, CTAs, and markup copy remain intact.
2. **Visual Inspection Boundaries**:
   * View the transitions on standard laptop resolutions (e.g. 1440x900).
   * Test responsiveness by shrinking the browser height below 700px. Verify that the cards transition back to the standard scrolling flow.
   * Verify that the body background color transitions smoothly between dark and light themes at exactly the 50% intersection point during the card stack.
