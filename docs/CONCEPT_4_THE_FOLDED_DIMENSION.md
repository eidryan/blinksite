# SITE CONCEPT 4: THE FOLDED DIMENSION (THE ORIGAMI ENGINE)

> **The Story:** The website is not a document made of code; it is a singular, infinite sheet of digital paper, folded into reality by a master architect. "The Folded Dimension" takes the outlandish, visionary mechanics of the previous concepts and binds them strictly to blinksite's design system. Every action is a physical manipulation of this geometry, fueled by the brand's vibrant gradient of orange, gold, and red.

---

## 1. THE PROLOGUE: THE MASTER’S CREASE

The journey begins in the absolute `#212121` void. There is no loading spinner. Suddenly, a hyper-sharp thread of light—burning in the brand's `--orange` and `--gold` gradient—slices a horizontal line across the darkness. The line pauses, then physically folds open in a mesmerizing, 40-step 3D origami sequence. It folds itself into the exact geometry of the **Origami Star**. The star breathes with light, then violently shrinks and translates to the top-left corner, locking into the Navbar. As it locks, the dark void unfolds around it, revealing the site. 

## 2. THE ANCHOR: THE BACKLIT CANVAS

The Hero section is not a flat image; it is a suspended sheet of dark matter. The textured noise overlay (at 0.03 opacity) gives the `#212121` background the tactile feel of premium, heavy-weight paper. The massive watermark star rotates slowly in the depth of the Z-axis. The headline—"Decida em um piscar de olhos"—is set in **MuseoModerno**, but the letters aren't typed; they are physically sliced out of the background. As you move your mouse, a WebGL-driven, brand-gradient light source shines from *behind* the cut-out letters, casting dynamic, real-time shadows inside the typography. 

## 3. THE LINK: THE PRECISION SCALPEL

Your cursor is no longer a generic ring; it is the Architect's tool. The central dot is a hyper-sharp, monospace crosshair, while the outer ring lerps smoothly behind it. When you move quickly, the cursor bleeds a dissipating trail of `--red` and `--orange` light. When you hover over an interactive element, the ring doesn't just scale—it geometrically morphs into a spinning origami diamond, signaling that this piece of the dimension can be manipulated.

## 4. THE COMPASS: THE BLUEPRINT UNFOLD

Clicking the menu icon does not drop down a list. Instead, it violently yanks the camera backward, revealing that the current page is just one face of a massive, complex 3D origami blueprint floating in space. The other sections (*Sobre, Como Atuamos, Portfolio*) are the other folded faces of this giant shape. To navigate, you click a section, and the entire massive structure rotates in 3D space, bringing the new face to the front, unfolding it flat against your screen with a satisfying, tactile snap.

## 5. THE ENGINE: THE GRADIENT REFRACTION

The WebGL shader acts as the atmospheric lifeblood of the paper. It uses simplex noise, but strictly constrained to the brand's color tokens (`#FFA52E`, `#FF6A00`, `#F21A1A`). As you read, the shader pulses subtly, casting a warm, living glow across the glassmorphic panels. If you idle for too long, the corners of the viewport begin to physically curl and fold inward, as if the paper is restless and asking to be played with. Moving the mouse snaps the tension back instantly.

## 6. THE CONDUCTOR: THE INFINITE HINGE

Scrolling down does not move a scrollbar; it physically creases the dimension. As you scroll, the current section folds backward into the depth of the screen, pivoting perfectly on the glowing `brand-gradient-divider` lines, while the next section unfolds from the bottom. The motion is entirely scrubbed to your scroll wheel—you aren't scrolling a page; you are the motor physically cranking the folds of the universe.

## 7. THE TRIGGER: THE MAGNETIC SEAL

The Call to Action ("Vamos Conversar") is an intricate origami lock mechanism. When your cursor approaches within 100px, the button is magnetically pulled from its resting place. The internal gradient physically rotates to track your mouse angle. Clicking it acts like breaking a seal—the button bursts into a microscopic swarm of geometric sparks before resolving into the destination, snapping shut with the weight of a heavy vault.

## 8. THE ARTIFACTS: THE POP-UP BOOKS

The Portfolio projects sit inside precision glassmorphism cards (`bg-white/5`, `backdrop-blur`). But they are not static images. When you hover over a card, the front face dissolves, and the interior physically opens like a high-end pop-up book. A tiny, fully animated 3D diorama of the project rises out of the card. The ambient light from the diorama casts a warm `--gold` glow against the dark `#212121` background, turning the grid into a gallery of glowing artifacts.

## 9. THE VOICE: THE PERSPECTIVE SLIT

The typography strictly enforces the brand's hierarchy. The **MuseoModerno** headlines are revealed using a 3D clip-path stagger—unfolding from an invisible horizontal crease in the screen, tilting aggressively at `rotateX: 10deg` before snapping flat. In stark contrast, the **IBM Plex Mono** labels (`text-xs uppercase tracking-widest`) act as the engineer's notes. They never animate on the Z-axis; they slide in perfectly flat, providing precise, clinical anchor points against the dramatic display type.

## 10. THE POLISH: THE DISCARDED SHARDS

Every interaction leaves a physical trace. When you close a menu or bypass a section, the elements don't just fade—they shatter into tiny, geometric origami diamonds that bounce off the edges of your monitor before dissolving into the background noise. Clicking on any empty space on the site causes a subtle, expanding hexagonal ripple in the paper texture, proving that the entire canvas is tightly strung and reactive.

## 11. THE FINALE: THE GRAND ENVELOPE

Reaching the Footer is the culmination of the fold. The top edge of the footer features a massive scooped border-radius (`rounded-t-[100px]`), physically mimicking the flap of a giant envelope pocket. A massive "VAMOS CONVERSAR" headline spans the width, daring you to cross the threshold. When you submit the final form, the entire screen violently folds itself inward, condensing into a single, glowing orange origami bird that flies off into the dark void. All that remains is the IBM Plex Mono text, blinking in the darkness: *Transmission Delivered.*

# DESIGN SYSTEM IMPLEMENTATION PLAN: THE FOLDED DIMENSION

**Project:** Blink "Origami Engine" Concept  
**Target Output:** A robust foundational codebase (HTML/CSS/JS) demonstrating the Design System.

---

## 1. EXECUTIVE SUMMARY

This plan outlines the architecture for a "Paper Reality" interface. Unlike traditional websites composed of static blocks, this system treats the viewport as a sheet of digital paper. We will implement a hybrid CSS 3D + WebGL engine to handle geometric transformations (folding), lighting (backlighting), and physics-based interactions.

The goal is to produce a **Master Design System File** containing:

1. **Visual Language Tokens:** Strict adherence to Blink's brand colors and typography.
2. **The "Hinge" Animation Engine:** A JavaScript framework for folding DOM elements.
3. **Atmospheric Shaders:** Canvas/WebGL background effects for the "living paper" look.
4. **Interactive Cursor System:** The "Architect's Tool."

---

## 2. VISUAL IDENTITY & TOKENS (THE INK)

Before building the engine, we define the constraints. The AI must generate CSS variables first.

### A. Color Palette (The Heat)

These colors represent the "light" and "ink" of the folded paper.

- **The Void (Paper):** `--bg-void: #212121` (The dark matter canvas).
- **The Paper Texture:** `--bg-paper: #FDFAF4` (Used for specific unfold elements).
- **The Gradient Stacks:**
  - `--gradient-brand: linear-gradient(135deg, #FFA52E, #FF6A00, #F21A1A)`
  - `--gradient-hover: linear-gradient(45deg, #FF8A1C, #C81010)`
- **System Feedback:** `--success: #4CAF50`, `--error: #F21A1A`

### B. Typography (The Cuts)

- **Display (The Slice):** `font-family: 'MuseoModerno', sans-serif;`
  - *Usage:* Headlines, Hero text. Style: Bold/Black, Letter-spacing: -0.05em (tight, geometric).
- **Mono (The Engineer's Notes):** `font-family: 'IBM Plex Mono', monospace;`
  - *Usage:* Labels, Captions, Navigation indices. Style: Uppercase, Tracking wide.

---

## 3. CORE ARCHITECTURE (THE ENGINE)

This section details the technical logic required to simulate "Folding."

### A. The Paper Environment (CSS 3D Setup)

To fold a div, we must exist in a 3D space.

- **Global Scene:** Set `perspective: 1000px;` on the `<body>` or main wrapper.
- **Transform Style:** All container elements must use `transform-style: preserve-3d;`.
- **The Fold Logic (JS Class: `OrigamiElement`):**
  - Every section acts as a "leaf."
  - **State 0 (Flat):** `rotateX(0deg)`.
  - **State 1 (Folded Away):** `rotateX(-90deg)` with `transform-origin: top center`.
  - **State 2 (Folded In):** `rotateX(90deg)` with `transform-origin: bottom center`.
  - The AI must generate a helper class that handles the transition timing (cubic-bezier easing) to simulate weight.

### B. The Atmospheric Canvas (WebGL/Canvas Layer)

Behind the DOM content, a full-screen `<canvas>` runs the "Light & Noise" engine.

- **Simplex Noise:** Generate a moving noise texture at `0.03 opacity` over the `#212121` background to create the "heavy-weight paper" feel.
- **Mouse Light:** A radial gradient that follows the cursor, strictly masked by the brand gradient colors. This creates the "flashlight behind the paper" effect described in *The Anchor*.

### C. The Custom Cursor (The Scalpel)

The default cursor is hidden. A custom DOM element (`#cursor-follower`) is rendered.

- **Structure:**
  - Inner Core: A crosshair `+` (monospace aesthetic).
  - Outer Ring: A circle.
- **Logic:**
  - **Lerp Movement:** The ring follows the mouse with a `0.15` lag.
  - **Interaction State:**
    - *Hover Link:* Morph ring into a rotating diamond (`border-radius: 0; transform: rotate(45deg)`).
    - *Fast Movement:* Detect delta speed; trigger a "trail" particle effect in `--red`/`--orange`.

---

## 4. COMPONENT SPECIFICATIONS (THE ARTIFACTS)

### A. The Loading Prologue (The Master's Crease)

- **Sequence:**
  1. Start with a black screen (`#212121`).
  2. Animate a line: `width: 0%` to `width: 100%` (centered, gradient color).
  3. **Origami Formation:** Use a sprite sheet or CSS keyframe sequence to show the line folding into the Star Logo geometry.
  4. **Transition:** Star shrinks and moves to the Navbar position (Top-Left).
  5. **Reveal:** The site "unfolds" from the star's location (scale 0.8 -> 1, opacity 0 -> 1).

### B. The Navbar (The Lock)

- **Position:** Fixed top, high z-index.
- **Logo:** The formed Origami Star (SVG).
- **Links:** IBM Plex Mono, uppercase. Hover effect: A gradient underline that "folds" up from the bottom.
- **Menu Trigger:** Clicking causes the "Camera Yank" (Zoom out the camera perspective while scaling down content).

### C. The Hero Section (The Backlit Canvas)

- **Headline:** "Decida em um piscar de olhos."
  - **Effect:** CSS `background-clip: text` with a transparent fill, but a subtle `text-shadow` that moves with the mouse to simulate depth.
  - **Alternative WebGL:** If capable, render text in WebGL to cast real-time shadows based on mouse light position.
- **Watermark:** A giant, low-opacity Origami Star SVG rotates slowly in the background.

### D. The Scroll Hinge (The Infinite Hinge)

- **Mechanism:** The page is not one long scroll, but a stack of sections.
- **Implementation:**
  - Use a scroll-jacking library (like GSAP ScrollTrigger).
  - When scrolling down, the current section rotates around its top edge (`rotateX: -90deg`), revealing the next section underneath.
  - **Divider:** A glowing line separates sections (`border-bottom: 1px solid` gradient).

### E. The Portfolio Cards (The Pop-Up Books)

- **Container:** Glassmorphism (`backdrop-filter: blur(10px); background: rgba(255,255,255,0.05)`).
- **Hover Interaction:**
  - The card face transitions to `transform: rotateX(45deg)` and fades out.
  - A hidden inner container scales up from 0 to 1, simulating a pop-up book opening.
  - **Lighting:** The pop-up element casts a `box-shadow` upward, illuminating the card border in gold/orange.

### F. Call to Action (The Magnetic Seal)

- **Physics:** When cursor is within `100px`, calculate angle and distance. Apply a slight translation to the button toward the cursor.
- **Visual:** The button background is a rotating conic gradient.
- **Click Event:**
  1. Spawn particle shards (div elements with random rotation).
  2. Shrink button to 0.
  3. Navigate/Submit.

### G. The Footer (The Grand Envelope)

- **Shape:** `border-top-left-radius: 100px; border-top-right-radius: 100px;` (Mimics an envelope flap).
- **Submit Animation:** Upon submission, the entire page content folds inward (inverse of the scroll hinge) and collapses into an origami bird that flies away.

---

## 5. FILE STRUCTURE & DELIVERABLES

When generating this, the AI should structure the output as follows:

1. `**index.html`**: The semantic structure.
  - `<canvas id="bg-engine"></canvas>` (Background).
  - `<div id="cursor-scalpel"></div>` (Cursor).
  - `<div id="loading-sequence"></div>`.
  - `<main>` containing sections with specific classes (`section-foldable`).
2. `**styles.css`**:
  - `:root` variables.
  - Origami Utility Classes (`.fold-up`, `.fold-down`, `.pop-up-3d`).
  - Component styles (Navbar, Footer, Cards).
  - Responsiveness (On mobile, fold effects might need to simplify to slides to prevent lag).
3. `**app.js**`:
  - **Class `OrigamiSite`**: Initializes the scroll hijacking and 3D perspective.
  - **Class `CursorEngine`**: Handles the custom cursor and trails.
  - **Class `BackgroundEngine`**: Simple noise and light rendering on Canvas.
  - **Init Logic**: Kickstarting the loading sequence.

---

## 6. PROMPT INSTRUCTIONS FOR AI GENERATION

*To generate the actual code, use the following context:*

> "Generate a single-page website design system based on the 'Folded Dimension' concept.
>
> **Requirements:**
>
> 1. **Tech Stack:** Vanilla HTML, CSS (with variables), and vanilla JS (no heavy frameworks, use requestAnimationFrame).
> 2. **Visuals:** Use the color tokens #212121, #FFA52E, #FF6A00, #F21A1A. Fonts: MuseoModerno (Headings) and IBM Plex Mono (UI).
> 3. **Key Features to Implement:**
>   - A custom cursor that is a crosshair inside a ring, which turns into a diamond on hover.
>   - A CSS 3D setup where scrolling triggers sections to 'fold' out of view (rotateX) rather than slide.
>   - A Canvas background that renders a subtle noise texture on the dark background.
>   - A hero section where the text 'Decida em um piscar de olhos' is large and has a mouse-following light shadow effect.
>   - Portfolio cards that 'pop-up' (3D transform) on hover.
> 4. **Structure:** Provide the code in three blocks: HTML, CSS, and JS. Ensure the JS handles the intersection observer for scroll animations."

This plan ensures the "Folded Dimension" concept is translated from narrative fantasy into feasible, high-end frontend code.