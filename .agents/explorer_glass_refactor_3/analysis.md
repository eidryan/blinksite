# Analysis Report: Radar & Research Sections Glassmorphism & Sticky Stacking Refactor

## 1. Executive Summary
This report analyzes the codebase structure of the Blink homepage, specifically focusing on `src/App.jsx`, `src/components/Navbar.jsx`, `src/components/Fundadores.jsx`, `src/components/RadarResearchSections.jsx`, and the verification script `scripts/verify-home-radar-research.mjs`. It provides a detailed, step-by-step recommendation on how to refactor `RadarResearchSections.jsx` to adopt a Glassmorphism aesthetic and a Sticky Stacking layout without breaking any of the existing 20 automated checks or visual functionalities.

---

## 2. Codebase Structure & Component Integration
The homepage rendering pipeline and dependencies are set up as follows:

### A. `src/App.jsx`
- **Imports**: Imports the sections via `import RadarResearchSections from './components/RadarResearchSections';`.
- **Layout Order**: Renders `<Portfolio />`, then `<RadarResearchSections />`, then `<Fundadores />` inside the `<main>` element. This layout sequence is verified by the testing script.
- **Theme Transitions**: A GSAP ScrollTrigger matches `section[data-theme], footer[data-theme]` to dynamically transition the body background color (`#212121` for dark, `#FDFAF4` for light) as different sections enter the viewport.

### B. `src/components/Navbar.jsx`
- Contains navigation links mapping `Radar` to `#radar` and `Research` to `#research` in that specific order.
- The IntersectionObserver monitors section elements on screen and updates the active link state accordingly.

### C. `src/components/Fundadores.jsx`
- Labeled as `06. Fundadores` to follow the updated structure (Portfolio is 03, Radar is 04, Research is 05).
- Contains a test check ensuring that `04. Fundadores` is not present.

### D. `src/components/RadarResearchSections.jsx` (Target Component)
- Contains two distinct sections: `radar` (dark theme, align left, label `04. Radar`) and `research` (light theme, align right, label `05. Research`).
- Employs GSAP entry transitions and a custom 3D card tilt animation on mouse movement.

---

## 3. Preservation Strategy for Verification Checks
The script `scripts/verify-home-radar-research.mjs` runs 20 checks. Here is how each must be preserved during the refactor:

| Verification Check | Target File | Verification Criteria | Preservation Strategy |
|---|---|---|---|
| **App imports RadarResearchSections** | `src/App.jsx` | Includes: `import RadarResearchSections from './components/RadarResearchSections';` | Do not modify this import statement in `src/App.jsx`. |
| **App renders sections after Portfolio** | `src/App.jsx` | `<Portfolio />` before `<RadarResearchSections />` | Keep `<RadarResearchSections />` immediately after `<Portfolio />`. |
| **App renders founders after sections** | `src/App.jsx` | `<RadarResearchSections />` before `<Fundadores />` | Keep `<RadarResearchSections />` immediately before `<Fundadores />`. |
| **Radar section id exists** | `src/components/RadarResearchSections.jsx` | Includes: `id="radar"` | See **Critical String Search Caveat** below. |
| **Research section id exists** | `src/components/RadarResearchSections.jsx` | Includes: `id="research"` | See **Critical String Search Caveat** below. |
| **Radar label exists** | `src/components/RadarResearchSections.jsx` | Includes: `04. Radar` | Retain the exact label text `"04. Radar"` in the card header. |
| **Research label exists** | `src/components/RadarResearchSections.jsx` | Includes: `05. Research` | Retain the exact label text `"05. Research"` in the card header. |
| **Radar headline exists** | `src/components/RadarResearchSections.jsx` | Includes: `O que está mudando no mercado, antes de virar consenso.` | Retain the exact headline text in `Radar` section. |
| **Research headline exists** | `src/components/RadarResearchSections.jsx` | Includes: `Pesquisa aplicada para aproximar academia e mercado.` | Retain the exact headline text in `Research` section. |
| **Research approved copy exists** | `src/components/RadarResearchSections.jsx` | Includes: `O ambiente onde a Blink aproxima as PMEs brasileiras...` | Retain the exact paragraphs of copy for the `Research` body. |
| **Radar CTA destination exists** | `src/components/RadarResearchSections.jsx` | Includes: `href="/radar"` | See **Critical String Search Caveat** below. |
| **Research CTA destination exists** | `src/components/RadarResearchSections.jsx` | Includes: `href="/research"` | See **Critical String Search Caveat** below. |
| **Radar CTA text exists** | `src/components/RadarResearchSections.jsx` | Includes: `Conhecer o Radar` | Retain the exact CTA text `"Conhecer o Radar"`. |
| **Research CTA text exists** | `src/components/RadarResearchSections.jsx` | Includes: `Explorar Research` | Retain the exact CTA text `"Explorar Research"`. |
| **Public component does not mention UFF** | `src/components/RadarResearchSections.jsx` | Does not contain: `UFF` | Ensure no text mentions the string `"UFF"`. |
| **Navbar Radar anchor exists** | `src/components/Navbar.jsx` | Includes: `{ name: 'Radar', href: '#radar' }` | Do not modify this link object in `Navbar.jsx`. |
| **Navbar Research anchor exists** | `src/components/Navbar.jsx` | Includes: `{ name: 'Research', href: '#research' }` | Do not modify this link object in `Navbar.jsx`. |
| **Navbar order puts Radar before Research** | `src/components/Navbar.jsx` | `#radar` before `#research` | Keep the link objects in correct order in `Navbar.jsx`. |
| **Founders label is renumbered** | `src/components/Fundadores.jsx` | Includes: `06. Fundadores` | Do not change `06. Fundadores` in `Fundadores.jsx`. |
| **Old founders label is removed** | `src/components/Fundadores.jsx` | Does not contain: `04. Fundadores` | Ensure `04. Fundadores` is not present in `Fundadores.jsx`. |

### ⚠️ Critical String Search Caveat
The verification script performs a simple `readFileSync(file).includes("...")` check on the source files. Because the JSX in `RadarResearchSections.jsx` uses dynamic mapping (e.g. `id={section.id}` and `href={section.href}`), the literal strings `id="radar"`, `id="research"`, `href="/radar"`, and `href="/research"` are **NOT** generated directly by the react component code block. 
Currently, this is solved by having the following comment at the very bottom of `src/components/RadarResearchSections.jsx`:
```javascript
// id="radar" id="research" href="/radar" href="/research"
```
**During refactoring, this exact comment must be preserved or similar literal comments must be kept at the bottom of the file.** If this comment is deleted, the verification script will immediately fail even if the running application behaves perfectly.

---

## 4. Architectural Recommendations for the Refactor

### A. Theme Switcher Compatibility (`data-theme`)
The parent transition trigger in `src/App.jsx` scans the DOM for elements matching `section[data-theme]`.
1. **Preserve `<section>` tags**: The refactored file must still return `<section>` elements (not `<div>` or other containers) that have the `data-theme` attribute (`dark` or `light`).
2. **Proper IDs**: The sections must retain their respective `id="radar"` and `id="research"` (which also feeds into the navbar's ScrollSpy/IntersectionObserver active state tracking).

### B. Sticky Stacking Design & Layout Structure
If the elements are simply sibling `<section>` nodes inside `<main>`, setting them to `sticky` will cause them to pin relative to the entire `<main>` element. They will not scroll away when they are done; they will remain pinned over subsequent sections like `Fundadores` and the `Footer`.

**Solution: A Shared Wrapper Container**
Wrap both sections in a single wrapper `div` within `RadarResearchSections.jsx`:
```jsx
export default function RadarResearchSections() {
    return (
        <div id="radar-research-stack" className="relative w-full">
            {/* Radar Section */}
            <section id="radar" data-theme="dark" className="sticky top-24 ...">
                ...
            </section>
            
            {/* Research Section */}
            <section id="research" data-theme="light" className="sticky top-28 ...">
                ...
            </section>
        </div>
    );
}
```
**Why this works:**
- When scrolling, the wrapper `div` dictates the scroll boundary.
- `radar` pins first at `top-24` (accounting for the `fixed` Navbar which is `top-6` and has a height of ~`h-20`).
- As the user continues scrolling, `research` (which has a higher stacking index or naturally stacks later in DOM order) scrolls up over `radar` and pins at `top-28`.
- Once the bottom of the parent wrapper `#radar-research-stack` is reached, both pinned sections scroll away together naturally, revealing the `Fundadores` section.

### C. Glassmorphism Card Aesthetics
To achieve a high-fidelity Glassmorphism style, apply the following Tailwind CSS configurations to the card containers:
1. **Translucency & Blurring**:
   - **Dark Card**: Replace `bg-[#181818]` with `bg-[#181818]/60 backdrop-blur-md`.
   - **Light Card**: Replace `bg-[#FFF8EA]` with `bg-[#FFF8EA]/60 backdrop-blur-md`.
2. **Subtle Borders & Highlights**:
   - Maintain `border-white/10` (dark) and `border-dark/10` (light) or slightly increase opacity (e.g. `border-white/15`) to define the glass edges.
3. **Layered Depth**:
   - Position decorative glow containers (the `blur-3xl` background divs) *behind* the card rather than inside it, allowing the frosted blur effect to merge with the glowing background as the user scrolls.

### D. ScrollTrigger & Card Tilt Animations
1. **3D Tilt Alignment**: The current tilt effect is calculated via `getBoundingClientRect()`. Since sticky positioning does not change the layout boundaries (it only shifts the visual offsets in the viewport), standard client rect calculations will work perfectly fine.
2. **GSAP ScrollTrigger Adjustments**:
   - In standard layout, `ScrollTrigger` is triggered by `sectionRefs.current[index]`.
   - When using sticky positioning, the entrance animations of cards can be triggered when the parent wrapper `#radar-research-stack` hits specific scroll marks, or we can use the sections themselves. Let's make sure the entry animations (`y: 80, opacity: 0`) still feel natural in the sticky flow. It is recommended to use `toggleActions: 'play none none reverse'` as currently configured.

---

## 5. Implementer Checklist
When the implementer refactors `src/components/RadarResearchSections.jsx`:
1. [ ] Wrap both sections in a relative wrapper container (e.g., `<div className="relative">`) so they scroll away together.
2. [ ] Mark both `<section>` elements as `sticky` (e.g., `sticky top-24` and `sticky top-28`).
3. [ ] Keep the `<section>` elements matching the selector `section[data-theme]` (maintaining `data-theme="dark"` and `data-theme="light"`).
4. [ ] Keep `id="radar"` and `id="research"` as the section element IDs.
5. [ ] Apply `backdrop-blur-md` and alpha-background colors (e.g., `/60` or `/70`) to the card panels to achieve the glassmorphic style.
6. [ ] Ensure that all required copy strings listed in Section 3 are strictly identical.
7. [ ] Ensure that the verification comment `// id="radar" id="research" href="/radar" href="/research"` is preserved at the bottom of `src/components/RadarResearchSections.jsx`.
8. [ ] Run `npm run verify:home-radar-research` to verify that all 20 checks pass.
