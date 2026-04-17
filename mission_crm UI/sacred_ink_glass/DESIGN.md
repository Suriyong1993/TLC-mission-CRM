# Design System Document: The Sacred Journal

## 1. Overview & Creative North Star
**Creative North Star: "The Living Manuscript"**
This design system moves away from the sterile, "SaaS-blue" dashboard and toward a digital "Smart Notebook"—a space that feels as intentional as a handwritten journal but as powerful as a modern CRM. It is designed specifically for Thai church mission teams, balancing the weight of spiritual service with the efficiency of modern technology.

The system breaks the "template" look by using **Atmospheric Depth**. We avoid rigid grids in favor of asymmetrical breathing room and layered translucency. The interface should feel like a series of illuminated pages floating in a deep, meditative space. We prioritize "High-Production" UI: every interaction should feel fluid, every surface should feel physical, and every transition should be a soft stagger rather than a jarring jump.

---

## 2. Colors: Tonal Depth & Sacred Accents
Our palette is rooted in the "Ink" of a scholar’s desk and the "Gold" of a harvest.

### The Foundation
*   **Surface (Background):** `#050d1a` (Ink-Deep). This is our base layer. It provides the "void" from which all content emerges.
*   **Surface-Container-Low:** `#0a1628` at 0.75 opacity. This is our primary glass layer.
*   **Surface-Container-High:** `#0f2444` (Ink-Lift). Used for hover states and active focus.

### The "No-Line" Rule
**Borders are forbidden for structural sectioning.** We do not use 1px solid lines to separate content. Boundaries must be defined by:
1.  **Tonal Shifts:** Placing a `surface-container-highest` card atop a `surface-container-lowest` background.
2.  **Negative Space:** Using our 4px base scale to create distinct islands of information.
3.  **Glass Blurs:** Using the 20px `backdrop-filter: blur()` to naturally "refract" the background.

### The "Glass & Gradient" Signature
To achieve a high-end editorial feel, all primary cards must feature a **Top-Accent Gradient Line**. This is a 2px tall stroke at the very top of a card using the `primary` to `primary-container` gradient. This mimics the edge of a premium notebook page.

---

## 3. Typography: Authority & Heritage
The typography scale leverages the contrast between the bold, modern Thai geometry of **Kanit** and the refined, readable grace of **Sarabun**.

*   **Display & Headlines (Kanit 800/900):** These are the "Commanders." Use these for large numbers, mission goals, and section headers. They should feel authoritative and "Confident."
*   **Titles & Body (Sarabun 400/500/600):** The "Storytellers." Sarabun provides a warm, editorial feel that is easy on the eyes for long-form data entry or mission reports.
*   **The Typography Hierarchy:**
    *   **Display-LG (Kanit 900):** 3.5rem — For high-impact stats (e.g., "Total Baptisms").
    *   **Headline-MD (Kanit 800):** 1.75rem — For page titles.
    *   **Body-MD (Sarabun 400):** 0.875rem — For standard CRM data entry.

---

## 4. Elevation & Depth: The Layering Principle
We reject traditional drop shadows. Depth in this system is achieved through **Tonal Stacking** and **Ambient Light**.

*   **The Layering Principle:**
    *   Level 0: `surface-container-lowest` (The Base Page).
    *   Level 1: `surface-container-low` with 20px blur (The Floating Card).
    *   Level 2: `surface-container-high` (The Interaction Layer/Hover).
*   **Ambient Shadows:** If a floating element (like a Modal) requires a shadow, use a color-tinted shadow: `rgba(11, 20, 33, 0.4)` with a 40px blur. Never use pure black or grey.
*   **The Ghost Border:** If a boundary is required for accessibility, use `outline-variant` at 15% opacity. It should be felt, not seen.

---

## 5. Components: Intentional Primitives

### Buttons & CTAs
*   **Primary Action:** A gradient fill from `sky` (`#3b82f6`) to `water` (`#06b6d4`). Radius is `9999px` (Pill). Use a subtle inner glow (top-down) to give it a 3D "gem" feel.
*   **Secondary:** Ghost style. No background, `outline-variant` ghost border, text in `primary-fixed-dim`.

### The "Mission Card"
*   **Style:** `surface-container-low` background, 0.75 opacity, 20px blur.
*   **Accent:** 2px top-edge gradient. 14px corner radius.
*   **Rule:** No dividers. Use 24px (base 4 * 6) vertical spacing to separate card sections.

### Input Fields
*   **Surface:** `surface-container-lowest` (darker than the card it sits on).
*   **State:** On focus, the "Ghost Border" transitions from 15% opacity to 100% `primary` color.
*   **Typography:** Labels must be `label-md` in `on-surface-variant`.

### Lists & Stagger Animations
*   **The Rule:** All list items must enter the UI using a **Stagger Animation**. A 20ms delay per item, sliding up 10px while fading in.
*   **Separation:** Use a background color shift on hover (`ink-lift`) instead of a divider line.

---

## 6. Do’s and Don’ts

### Do:
*   **Use Mesh Gradients:** Use very large, low-opacity (5%) mesh gradients of `spirit` (`#8b5cf6`) and `gold` (`#f59e0b`) in the far background to create a "spiritual" atmosphere.
*   **Embrace Asymmetry:** Align high-level stats to the left and action buttons to the far right with significant whitespace between them.
*   **Respect the Script:** Ensure Thai glyphs have enough line-height (1.6x minimum) to prevent "Sarabun" accents from touching the line above.

### Don’t:
*   **Don't use 100% Opaque Cards:** It breaks the "Glass" feel. Always maintain a level of translucency to let the background mesh gradients "breathe" through the UI.
*   **Don't use Sharp Corners:** Except for the very edges of the screen, everything should follow the 14px or 9999px rule to maintain the "Warm/Modern" feel.
*   **Don't use Standard Dividers:** If you feel the need for a line, try using a 48px gap instead. If that fails, use a subtle tonal shift.