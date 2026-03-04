# Animation Guidelines — Web UI

> **Purpose**: This document is a set of instructions for an AI assistant generating animated UI code. Follow these rules strictly when implementing animations in any web project. Adapt your approach based on the **application context** (ERP/business application vs. marketing/showcase website).

> **Stack assumption**: Projects use **React + TypeScript + Tailwind CSS v4** with a mix of **shadcn/ui** (Radix-based) and **Base UI** components. Animation tooling is either **tw-animate-css** (CSS-only, default for shadcn) or **Motion (Framer Motion)** depending on the component complexity. Always check which component library is used in the current file before applying animation patterns.

> **Color palette**: The platform uses a **maximally black & white** aesthetic. Backgrounds, borders, text, and containers must stay in the grayscale range (white, slate-50 through slate-900, black). **Touches of color are reserved exclusively for**: avatars, status dots, badges/tags/labels, charts/data visualization accents, and interactive focus rings. The overall feel should be monochrome-first — color should draw the eye to meaning (a status, a category, a person), not to decoration. Never use colored backgrounds on cards, columns, or sections. Buttons use black/dark fills with white text (not brand-colored).

---

## 1. Context Detection and Behavior

Before writing any animation code, determine the application context:

### 1.1 Business Application / ERP Context

**When to apply**: Dashboards, data tables, forms, admin panels, SaaS products, internal tools, ERP modules.

**Rules**:

- Animations MUST be fast, functional, and invisible. The user should never notice them consciously.
- NEVER animate keyboard-initiated interactions (arrow key navigation, tab focus movement).
- NEVER animate elements that are interacted with more than ~20 times per day.
- Hover effects SHOULD be kept to simple color/background transitions or removed entirely for high-frequency elements.
- Limit all transition durations to **100-200ms**. Never exceed 250ms.
- Use **ease-out** for enter/exit transitions and **ease** for hover color/opacity changes.
- Avoid bounce, overshoot, or spring animations entirely.
- Avoid staggered animations on list items.
- Toasts: animate in with translateY + opacity, animate out in the same direction. Duration <= 200ms.
- Dialogs/modals: fade in with scale (from 0.97 to 1) + opacity. Duration ~150ms.
- Loading states: simple spinners or skeleton screens with subtle pulse. Linear easing for spinners only.
- **Prefer tw-animate-css / CSS transitions** over Motion for ERP components.

### 1.2 Marketing / Showcase Website Context

**When to apply**: Landing pages, portfolio sites, product pages, corporate websites, promotional content.

**Rules**:

- More creative freedom is allowed.
- Intro/hero animations can use longer durations (500ms-1200ms) with stagger and delay orchestration.
- Spring animations are encouraged for interactive elements.
- Scroll-triggered animations are appropriate. Use IntersectionObserver or Motion's useInView.
- Duration can extend to **300-600ms** for large element transitions.
- Marketing page intro animations SHOULD run only once.
- Even on marketing pages, do NOT overload with animations. If everything animates, nothing stands out.
- **Embedded product views** (chat demos, dashboard previews, workflow simulations) MUST be animated in an **infinite loop** like a GIF. The viewer should understand the feature without any interaction. Use a phased timeline (appear → interact → pause → fade out → restart) orchestrated with `useEffect` + timeouts or `useAnimate`. Each cycle should last 6-12 seconds. Use `AnimatePresence` for enter/exit of individual elements within the loop.

- **Everything must be automatic — zero user interaction required.**
  The embedded view must behave *exactly* as if a real user were operating it in real time. The viewer watches passively; all clicks, typing, scrolling, and navigation are simulated. If the real product requires a click to proceed, the demo must simulate that click at the right moment. Nothing should ever wait for the viewer.

- **Simulate realistic user behavior, not just data appearance.**
  Don't just make elements pop in — reproduce the full interaction lifecycle:
  - **Typing**: Characters appear one by one (or word by word) in input fields before the "send" happens.
  - **Clicks**: Buttons/quick replies should visually show a press state (`scale(0.97)` for ~100ms) before the action triggers, as if a cursor clicked them.
  - **Scrolling**: The view must auto-scroll smoothly (`scrollIntoView({ behavior: "smooth" })`) whenever new content extends beyond the visible area. Attach scroll to a bottom sentinel ref and trigger on every state change.
  - **Focus / selection**: If an input would gain focus in real usage, animate the focus ring/border transition before typing starts.
  - **Hover hints** (optional): For extra realism, briefly highlight the next interactive element before "clicking" it.

- **Timing should feel human, not robotic.**
  Insert natural pauses between actions:
  - After a message appears, wait 400-800ms before the next action (reading time).
  - After a "thinking" phase completes, wait 300-500ms before revealing the result.
  - Between sequential steps (e.g., loader checkmarks), use realistic durations (700-1400ms per step) — not uniform.
  - At the end of a full cycle, hold the final state for 2-4s so the viewer can absorb it, then fade out (400-600ms) and restart.

- **Decorative UI chrome must stay static.**
  Elements that exist only for context (header bar, input placeholder, status indicators) should render once and never animate, unless the simulated interaction involves them (e.g., the input field when simulating typing). This keeps the viewer's attention on the animated story.

- **Animate specific UI elements, not entire blocks.** Inside embedded views, target individual components rather than fading/sliding whole sections. The loop should tell a micro-story by orchestrating granular element-level animations.
- **Each component type has its own animation signature.** NEVER apply the same generic `opacity + translateY` to every element. Match the animation to the nature of the component:

  | Component        | Enter animation                                      | Why                                                    |
  | ---------------- | ---------------------------------------------------- | ------------------------------------------------------ |
  | Button / CTA     | `scale(0.95 → 1)` + opacity                         | Buttons "press" — scale conveys interactivity          |
  | Loader / Spinner | Fade in + rotate (linear infinite)                   | Loaders signal ongoing process — no bounce, no spring  |
  | Toast / Snackbar | `translateY(8px → 0)` from bottom + opacity          | Toasts slide in from their origin direction             |
  | Modal / Dialog   | `scale(0.97 → 1)` + opacity, centered               | Modals emerge from the center, never from a side       |
  | Table row        | `translateX(-8px → 0)` + opacity, staggered          | Rows slide in horizontally — they are horizontal items |
  | Stat / Counter   | Count-up (interpolated number) — no translate         | Numbers should increment, not move spatially           |
  | Chat bubble      | `scale(0.9 → 1)` from transform-origin bottom-left/right | Bubbles "grow" from the sender's side              |
  | Badge / Tag      | `scale(0.5 → 1)` spring bounce                      | Small elements pop — a spring sells the micro-size     |
  | Card             | `translateY(12px → 0)` + opacity                     | Cards lift into view — vertical motion matches stacking|
  | Toggle / Switch  | Spring on the thumb knob `translateX`, no container animation | Only the moving part animates, not the wrapper  |
  | Avatar / Icon    | `scale(0.8 → 1)` + opacity                          | Small circular elements pop into existence              |
  | Input focus      | Border-color + ring transition only (no transform)   | Inputs don't move — only their visual state changes    |
  | Dropdown / Menu  | `scale(0.97 → 1)` + opacity from `transform-origin` | Origin-aware — grows from the trigger                  |
  | Progress bar     | `width: 0 → n%` (linear or ease-out)                | Bars fill — no opacity, no translate                   |
  | Skeleton         | Shimmer pulse (opacity ease-in-out infinite)         | Skeletons pulse, never translate or scale              |

  When implementing embedded view loops, pick the right animation per element from this table instead of applying a uniform motion to everything.
- **Motion is the preferred tool** for marketing contexts.

---

## 2. Component Library Detection: shadcn/ui vs Base UI

Before writing animation code, identify which library the component comes from. They expose **different data attributes and CSS variables**.

### 2.1 shadcn/ui (Radix-based) Components

State changes are exposed via **data-state** attributes.

**Key data attributes**:

- `data-state="open"` / `data-state="closed"` — dialogs, sheets, dropdowns, accordions, popovers, tooltips
- `data-state="checked"` / `data-state="unchecked"` — checkboxes, switches, radio buttons
- `data-state="active"` / `data-state="inactive"` — tabs, toggle groups
- `data-side="top|bottom|left|right"` — positioned content (useful for directional animations)
- `data-orientation="horizontal|vertical"` — accordions, tabs

**CSS variables exposed by Radix** (usable in shadcn components):

- `--radix-accordion-content-height` / `--radix-accordion-content-width`
- `--radix-collapsible-content-height` / `--radix-collapsible-content-width`
- `--radix-dropdown-menu-content-transform-origin`
- `--radix-popover-content-transform-origin`
- `--radix-tooltip-content-transform-origin`
- `--radix-navigation-menu-viewport-width` / `--radix-navigation-menu-viewport-height`
- `--radix-select-content-transform-origin`

**Animation pattern with Tailwind (tw-animate-css)**:

```tsx
<DialogContent className="duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
  {children}
</DialogContent>
```

**Origin-aware animation**:

```css
.popover-content {
  transform-origin: var(--radix-popover-content-transform-origin);
}
```

**Accordion with Radix CSS variable**:

```css
@theme {
  @keyframes accordion-down {
    from {
      height: 0;
    }
    to {
      height: var(--radix-accordion-content-height);
    }
  }
  @keyframes accordion-up {
    from {
      height: var(--radix-accordion-content-height);
    }
    to {
      height: 0;
    }
  }
  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up: accordion-up 0.2s ease-out;
}
```

### 2.2 Base UI Components

Base UI uses a **different set of data attributes**. Do NOT mix Radix/shadcn attributes with Base UI.

**Key data attributes**:

- `data-open` — component is visible
- `data-closed` — component is about to hide (exit animation phase)
- `data-starting-style` — first frame of enter animation (initial state)
- `data-ending-style` — last frame of exit animation (final state before unmount)
- `data-instant` — skip animation for subsequent tooltips/popovers

**CSS variables exposed by Base UI**:

- `--transform-origin` — origin-aware positioning on popups, menus, selects
- `--available-height` — available viewport height for popups
- `--anchor-width` — width of the trigger/anchor element

**Animation pattern with CSS transitions (preferred for Base UI)**:

```css
.popup {
  transform-origin: var(--transform-origin);
  transition:
    transform 150ms cubic-bezier(0.19, 1, 0.22, 1),
    opacity 150ms cubic-bezier(0.19, 1, 0.22, 1);
}
.popup[data-starting-style],
.popup[data-ending-style] {
  opacity: 0;
  transform: scale(0.95);
}
```

**Animation pattern with CSS keyframes**:

```css
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes scaleOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}
.popup[data-open] {
  animation: scaleIn 200ms cubic-bezier(0.19, 1, 0.22, 1);
}
.popup[data-closed] {
  animation: scaleOut 150ms cubic-bezier(0.19, 1, 0.22, 1);
}
```

**Subsequent tooltip skipping**:

```css
.tooltip[data-instant] {
  transition-duration: 0ms;
}
```

**Using Tailwind classes with Base UI**:

```tsx
<Menu.Popup className="origin-[var(--transform-origin)] transition-[transform,opacity] duration-150 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0">
```

### 2.3 Using Motion with Base UI

Base UI relies on `element.getAnimations()` to detect exit animation completion. **Always animate opacity** in your Motion transition (even from 0.9999 to 1). Without it, the component unmounts instantly.

```jsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.15, ease: [0.19, 1, 0.22, 1] }}
/>
```

### 2.4 Quick Reference: Attribute Mapping

| Concept              | shadcn/ui (Radix)                    | Base UI                             |
| -------------------- | ------------------------------------ | ----------------------------------- |
| Component visible    | `data-state="open"`                  | `data-open`                         |
| Component hiding     | `data-state="closed"`                | `data-closed`                       |
| Enter initial state  | use `animate-in` classes             | `data-starting-style`               |
| Exit final state     | use `animate-out` classes            | `data-ending-style`                 |
| Transform origin     | `--radix-*-content-transform-origin` | `--transform-origin`                |
| Skip subsequent anim | handle manually                      | `data-instant`                      |
| Checked state        | `data-state="checked"`               | `data-checked`                      |
| Disabled             | `data-disabled`                      | `data-disabled`                     |
| Side/position        | `data-side="top/bottom/left/right"`  | `data-side="top/bottom/left/right"` |

---

## 3. When to Use tw-animate-css vs Motion

Per-component decision, not per-project.

**Use tw-animate-css when**: Simple enter/exit, hover effects, accordion, tooltip/popover, ERP components, bundle-sensitive, no interruption needed.

**Use Motion when**: Layout animations, springs, interruptible animations, drag-and-drop, complex orchestration, path morphing, AnimatePresence, shared layout (layoutId).

**When in doubt**: ERP -> CSS. Marketing -> Motion. Hit a CSS limitation -> upgrade that component to Motion.

---

## 4. The Easing Blueprint

### 4.1 ease-out — Default for most UI animations

Enter/exit transitions. Custom curves (weakest to strongest):

```
cubic-bezier(0.25, 0.46, 0.45, 0.94)  /* Subtle */
cubic-bezier(0.19, 1, 0.22, 1)         /* Standard — default */
cubic-bezier(0.16, 1, 0.3, 1)          /* Strong */
```

Button press: `scale(0.97)` on `:active`, 150ms. Tailwind: `transition-transform active:scale-[0.97]`.

### 4.2 ease-in-out — Elements already on screen

Move, morph, resize visible elements:

```
cubic-bezier(0.45, 0, 0.55, 1)         /* Subtle */
cubic-bezier(0.645, 0.045, 0.355, 1)   /* Standard */
cubic-bezier(0.86, 0, 0.07, 1)         /* Strong */
```

### 4.3 ease — Hover effects and gentle transitions

Color, background, opacity, border-color on hover. Use `transition: 0.2s ease`.

### 4.4 linear — Almost never

ONLY for: marquee, progress indicators, 3D rotation, spinners.

### 4.5 ease-in — Avoid

NEVER use for UI animations. Feels sluggish.

### 4.6 Resources: [easings.co](https://easings.co/)

---

## 5. Duration Rules

| Context              | Max    | Typical    |
| -------------------- | ------ | ---------- |
| ERP hover            | 150ms  | 100-150ms  |
| ERP enter/exit       | 200ms  | 100-200ms  |
| Marketing hover      | 200ms  | 150-200ms  |
| Marketing enter/exit | 400ms  | 200-400ms  |
| Marketing hero       | 1200ms | 500-1200ms |
| Large elements       | 600ms  | 400-600ms  |

UI animations SHOULD stay under 300ms. Larger elements animate slower.

---

## 6. Spring Animations (Motion)

```jsx
transition={{ type: "spring", duration: 0.4, bounce: 0 }}    // Most UI
transition={{ type: "spring", duration: 0.5, bounce: 0.15 }} // Drag settle
transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}  // Marketing only
```

Bounce MUST be 0 in ERP. Max 0.3 in marketing.

---

## 7. What to Animate (and What NOT to)

**GPU-accelerated (preferred)**: transform, opacity, clip-path, filter (blur sparingly).

**Avoid**: width/height (exception: accordion via `--radix-accordion-content-height`), top/left, margin/padding.

**NEVER animate**: keyboard navigation, high-frequency interactions, subsequent tooltips.

---

## 8. Accessibility — prefers-reduced-motion (MANDATORY)

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

```jsx
import { useReducedMotion } from "motion/react";
const shouldReduceMotion = useReducedMotion();
```

Decorative: disable completely. Functional: simplify to instant.

---

## 9. Touch / Mobile

Disable hover on touch (Tailwind v4 does this by default). Minimum tap target: 44x44px.

```css
@utility touch-hitbox {
  position: relative;
  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    min-height: 44px;
    min-width: 44px;
    z-index: 9999;
  }
}
```

---

## 10. Performance

- `will-change`: ONLY on elements dropping frames. Never globally.
- `contain: layout style paint`: isolate animated containers.
- `transform: translateZ(0)`: fallback GPU for expensive SVG filters.

---

## 11. Motion Patterns

**Layout**: `<motion.div layout>`
**Shared layout**: `<motion.div layoutId="indicator" />`
**AnimatePresence**: wrap with `<AnimatePresence>`, use `initial`, `animate`, `exit` props.
**useAnimate**: for multi-element orchestration with `await` sequencing.
**SVG morphing**: `useMotionValue` + `useTransform` between matching paths.
**SVG line drawing**: `pathLength={100}`, `strokeDasharray="100"`, animate `strokeDashoffset` from 100 to 0.

---

## 12. SVG Specifics

Transform origin: `transform-box: fill-box; transform-origin: center;` (Motion does this automatically).
Always use `viewBox` for responsive SVGs.

---

## 13. CSS Patterns (library-agnostic)

- Blur smoothing: `filter: blur(2px)` mid-transition.
- Hover flicker: animate child, not hovered parent.
- Clip-path: GPU-accelerated alternative to height/width.
- NEVER animate from `scale(0)`. Start from `scale(0.95)` minimum.
- Origin-aware: always set `transform-origin` from library CSS variable.

---

## 14. Decision Table

| Scenario           | Easing             | Duration        | Tool                       | Attributes                          |
| ------------------ | ------------------ | --------------- | -------------------------- | ----------------------------------- |
| Button hover (bg)  | ease               | 150ms           | CSS                        | —                                   |
| Button press       | ease-out           | 150ms           | CSS                        | —                                   |
| shadcn Dropdown    | ease-out custom    | 200ms           | tw-animate-css             | `data-[state=open/closed]`          |
| Base UI Menu       | ease-out custom    | 150ms           | CSS transition             | `data-starting-style` / `data-open` |
| shadcn Dialog      | ease-out custom    | 200ms           | tw-animate-css             | `data-[state=open/closed]`          |
| Base UI Dialog     | ease-out custom    | 200ms           | CSS transition             | `data-starting-style` / `data-open` |
| Toast enter/exit   | ease-out custom    | 200ms           | CSS transition             | —                                   |
| Tab indicator      | spring bounce:0    | ~300ms          | Motion                     | layoutId                            |
| shadcn Tooltip     | ease-out           | 125ms           | tw-animate-css             | `data-[state=open]`                 |
| Base UI Tooltip    | ease-out           | 125ms           | CSS transition             | `data-starting-style`               |
| Subsequent tooltip | none               | 0ms             | CSS                        | Base UI: `data-instant`             |
| shadcn Accordion   | ease-out           | 200ms           | CSS keyframes              | `--radix-accordion-content-height`  |
| Marquee            | linear             | varies          | CSS                        | —                                   |
| Hero intro         | ease-out + stagger | 600-1000ms      | Motion                     | —                                   |
| Scroll reveal      | ease-out           | 400-600ms       | CSS + IntersectionObserver | —                                   |
| Drag and drop      | spring             | N/A             | Motion                     | —                                   |
| Keyboard nav       | none               | 0ms             | —                          | —                                   |
| Skeleton pulse     | ease-in-out        | 1.5-2s infinite | CSS keyframes              | —                                   |

---

## 15. Reference Links

- [easings.co](https://easings.co/) — Custom easing curves
- [motion.dev/docs/quick-start](https://motion.dev/docs/quick-start) — Motion docs
- [framer.com/motion/layout-animations](https://www.framer.com/motion/layout-animations/) — Layout animations
- [framer.com/motion/transition/#spring](https://www.framer.com/motion/transition/#spring) — Spring config
- [framer.com/motion/use-animate](https://www.framer.com/motion/use-animate/) — useAnimate
- [motion.dev/docs/react-use-reduced-motion](https://motion.dev/docs/react-use-reduced-motion) — Reduced motion
- [framer.com/motion/guide-reduce-bundle-size](https://www.framer.com/motion/guide-reduce-bundle-size/) — Bundle optimization
- [base-ui.com](https://base-ui.com/) — Base UI
- [base-ui.com/react/handbook/animation](https://base-ui.com/react/handbook/animation) — Base UI animation guide
- [base-ui.com/react/handbook/styling](https://base-ui.com/react/handbook/styling) — Base UI styling
- [ui.shadcn.com](https://ui.shadcn.com/) — shadcn/ui
- [ui.shadcn.com/docs/tailwind-v4](https://ui.shadcn.com/docs/tailwind-v4) — tw-animate-css migration
- [radix-ui.com/primitives](https://www.radix-ui.com/primitives) — Radix Primitives
- [nan.fyi/svg-paths](https://www.nan.fyi/svg-paths) — SVG paths deep dive
- [nan.fyi/magic-motion](https://www.nan.fyi/magic-motion) — Inside Magic Motion
- [a11yproject.com/posts/understanding-vestibular-disorders](https://www.a11yproject.com/posts/understanding-vestibular-disorders/) — Accessibility
- [npmjs.com/package/flubber](https://www.npmjs.com/package/flubber) — Path morphing
- [github.com/pmndrs/use-gesture](https://github.com/pmndrs/use-gesture) — Gesture library
- [animations.dev](https://animations.dev/home) — Source course by Emil Kowalski
