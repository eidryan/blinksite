# Analysis Report: Blink Homepage Redesign

## Executive Summary
This report analyzes the codebase for the Blink homepage redesign, focusing on making the Radar and Research cards smaller and more horizontal, removing large background text accents, ensuring GSAP/theme animations remain fully functional, and updating the Fundadores section label from `04` to `06`.

---

## Part 1: Analysis of `src/components/RadarResearchSections.jsx`

### 1.1 Layout and Styling
- **Card Aspect Ratio**: The cards are currently styled with `lg:aspect-square` (line 113) which forces a square aspect ratio on large screens. To make the cards horizontal, this class must be removed.
- **Card Spacings & Padding**:
  - The card padding is currently `p-8 shadow-2xl md:p-12 lg:p-16` (line 113). Reducing it to `p-8 md:p-10 lg:p-12` will make it tighter.
  - The inner text block currently has `my-16 lg:my-0` (line 134). In a square aspect ratio with `flex-col justify-between`, `my-0` worked because the layout space was distributed automatically. Without `lg:aspect-square`, `lg:my-0` causes content to collapse tightly against the top and bottom rows. Changing this to `my-8 max-w-3xl md:my-10 lg:my-12` adds appropriate spacing.
  - Setting `max-w-3xl` (up from `max-w-2xl` on line 134) allows the card contents to spread wider, producing a more horizontal, landscape card.
- **Text Sizing & Margins**:
  - Title text sizing: `text-4xl md:text-5xl lg:text-6xl` (line 139) is very large for a compact card. Scaling it down to `text-3xl md:text-4xl lg:text-5xl` makes it much more balanced.
  - Body text sizing: `text-lg md:text-xl` (line 143) is scaled down to `text-base md:text-lg` with `max-w-2xl` width limit to allow for a flatter text layout.
  - Eyebrow text spacing: Change `mb-6` to `mb-4`.
- **Background Text Accents**:
  - The absolute positioned background labels `"RADAR"` and `"RESEARCH"` (lines 176-178) can be removed entirely by deleting the div:
    ```jsx
    <div className={`pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 font-mono text-[5.5rem] font-bold tracking-[0.2em] opacity-[0.035] lg:block ${isDark ? 'text-cream' : 'text-dark'}`}>
        {section.accent}
    </div>
    ```

### 1.2 GSAP Animations & Theme Transitions
We verified that the proposed CSS changes do **not** affect any of the animations or transitions:
- **GSAP ScrollTrigger**: Targets the section wrapper via `sectionRefs` and animates `panelRefs` (`gsap.from(panel, { ... y: 56, opacity: 0 })`). These hooks are based on React `refs` and are unaffected by class adjustments.
- **GSAP Hover (3D Card Tilt)**: Attached via `onMouseMove` and `onMouseLeave` event handlers. The tilt logic uses `getBoundingClientRect()` to fetch card dimensions dynamically:
  ```javascript
  const rect = panel.getBoundingClientRect();
  const percentX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
  const percentY = -((event.clientY - rect.top) / rect.height - 0.5) * 2;
  ```
  Since `rect.width` and `rect.height` are read dynamically at runtime, the tilt animation will function flawlessly on any card dimensions or aspect ratios.
- **Theme Transitions (`data-theme`)**: The body background theme logic in `src/App.jsx` queries the document for `section[data-theme]` to determine light/dark background color fades. Leaving `data-theme={section.theme}` on the `<section>` elements (line 103) ensures these scroll-triggered theme transitions continue working perfectly.

---

## Part 2: Analysis of `src/components/Fundadores.jsx`
- **Verification**: In `src/components/Fundadores.jsx` at line 89, the header label is currently `06. Fundadores`.
- **Finding**: The change has already been made in the local repository. If a restoration or manual verification is required, a standard git diff is provided below to ensure the label reads `"06. Fundadores"` rather than `"04. Fundadores"`.

---

## Part 3: Proposed Changes (Git Diff format)

### 3.1 Proposed Diff for `src/components/RadarResearchSections.jsx`

```diff
diff --git a/src/components/RadarResearchSections.jsx b/src/components/RadarResearchSections.jsx
--- a/src/components/RadarResearchSections.jsx
+++ b/src/components/RadarResearchSections.jsx
@@ -101,3 +101,3 @@
                         id={section.id}
                         ref={(element) => { sectionRefs.current[index] = element; }}
                         data-theme={section.theme}
-                        className={`relative overflow-hidden px-6 py-28 lg:px-20 lg:py-32 ${isDark ? 'bg-dark text-cream' : 'bg-cream text-dark'}`}
+                        className={`relative overflow-hidden px-6 py-20 lg:px-20 lg:py-24 ${isDark ? 'bg-dark text-cream' : 'bg-cream text-dark'}`}
                     >
                         <div className="brand-gradient-divider absolute top-0 left-0" />
 
                         <div className="relative z-10 mx-auto flex max-w-7xl justify-center" style={{ perspective: '900px' }}>
                             <div
                                 ref={(element) => { panelRefs.current[index] = element; }}
                                 onMouseMove={(event) => handleMouseMove(event, index)}
                                 onMouseLeave={() => handleMouseLeave(index)}
-                                className={`group relative flex w-full max-w-[980px] flex-col justify-between overflow-hidden rounded-[2rem] border p-8 shadow-2xl will-change-transform md:p-12 lg:aspect-square lg:p-16 ${isDark
+                                className={`group relative flex w-full max-w-[980px] flex-col justify-between overflow-hidden rounded-[2rem] border p-8 shadow-2xl will-change-transform md:p-10 lg:p-12 ${isDark
                                     ? 'border-white/10 bg-[#181818] text-cream shadow-black/30'
                                     : 'border-dark/10 bg-[#FFF8EA] text-dark shadow-orange/10'
                                     }`}
                                 style={{ transformStyle: 'preserve-3d' }}
                             >
                                 <div className="absolute inset-0 pointer-events-none">
                                     <div className={`absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-80 ${isDark ? 'bg-orange/20 opacity-45' : 'bg-orange/15 opacity-60'}`} />
                                     <div className={`absolute bottom-0 left-0 h-[2px] w-full brand-gradient ${isDark ? 'opacity-70' : 'opacity-90'}`} />
                                 </div>
 
                                 <div className="relative z-10 flex items-start justify-between gap-6">
                                     <span className={`font-mono text-xs uppercase tracking-widest border rounded-full px-3 py-1 ${isDark ? 'text-orange border-orange/40' : 'text-orange border-orange'}`}>
                                         {section.label}
                                     </span>
 
                                     <div className={`flex h-12 w-12 items-center justify-center rounded-full border ${isDark ? 'border-white/10 bg-white/5 text-orange' : 'border-dark/10 bg-dark/5 text-orange'}`}>
                                         <Icon size={22} strokeWidth={1.7} />
                                     </div>
                                 </div>
 
-                                <div className="relative z-10 my-16 max-w-2xl lg:my-0">
-                                    <p className={`mb-6 font-mono text-xs uppercase tracking-[0.18em] ${isDark ? 'text-[#FF8A1C]' : 'text-orange'}`}>
+                                <div className="relative z-10 my-8 max-w-3xl md:my-10 lg:my-12">
+                                    <p className={`mb-4 font-mono text-xs uppercase tracking-[0.18em] ${isDark ? 'text-[#FF8A1C]' : 'text-orange'}`}>
                                         {section.eyebrow}
                                     </p>
 
-                                    <h2 className={`font-display text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl ${isDark ? 'text-cream' : 'text-dark'}`} style={{ textWrap: 'balance' }}>
+                                    <h2 className={`font-display text-3xl font-semibold leading-tight md:text-4xl lg:text-5xl ${isDark ? 'text-cream' : 'text-dark'}`} style={{ textWrap: 'balance' }}>
                                         {section.title}
                                     </h2>
 
-                                    <p className={`mt-8 max-w-xl font-body text-lg leading-relaxed md:text-xl ${isDark ? 'text-cream/70' : 'text-dark/70'}`}>
+                                    <p className={`mt-6 max-w-2xl font-body text-base leading-relaxed md:text-lg ${isDark ? 'text-cream/70' : 'text-dark/70'}`}>
                                         {section.body}
                                     </p>
                                 </div>
 
-                                <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
+                                <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                     <div className="flex flex-wrap gap-3">
                                         {section.notes.map((note) => (
                                             <span
                                                 key={note}
                                                 className={`rounded-full border px-3 py-1 font-mono text-[0.68rem] uppercase tracking-widest ${isDark
                                                     ? 'border-white/10 bg-white/5 text-cream/65'
                                                     : 'border-dark/10 bg-dark/5 text-dark/65'
                                                     }`}
                                             >
                                                 {note}
                                             </span>
                                         ))}
                                     </div>
 
                                     <a
                                         href={section.href}
                                         data-cursor="action"
                                         className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-body font-semibold transition-transform hover:scale-105 ${isDark
                                             ? 'brand-gradient text-dark'
                                             : 'bg-dark text-cream hover:bg-dark/90'
                                             }`}
                                     >
                                         {section.cta}
                                         <ArrowUpRight size={18} strokeWidth={2} />
                                     </a>
                                 </div>
-
-                                <div className={`pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 font-mono text-[5.5rem] font-bold tracking-[0.2em] opacity-[0.035] lg:block ${isDark ? 'text-cream' : 'text-dark'}`}>
-                                    {section.accent}
-                                </div>
                             </div>
                         </div>
                     </section>
```

### 3.2 Proposed Diff for `src/components/Fundadores.jsx` (Included for completeness)

```diff
diff --git a/src/components/Fundadores.jsx b/src/components/Fundadores.jsx
--- a/src/components/Fundadores.jsx
+++ b/src/components/Fundadores.jsx
@@ -88,3 +88,3 @@
                 <span className="font-mono text-xs uppercase tracking-widest text-orange border border-orange/40 rounded-full px-3 py-1 inline-block mb-12">
-                    04. Fundadores
+                    06. Fundadores
                 </span>
```
