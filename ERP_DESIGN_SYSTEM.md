# ERP — Animation Guidelines

> Source unique pour les animations ERP. En cas de conflit avec d'autres docs, celui-ci prime.

---

## 1. Decision flow

```
Element entre/sort ?         → ease-out (cubic-bezier(0.19, 1, 0.22, 1))
Element deja visible bouge ? → ease-in-out
Hover / changement couleur ? → ease
Spinner / progress ?         → linear
```

**Interdit** : `ease-in` (sluggish), bounce > 0 sauf exceptions section 4, overshoot/rebond.

---

## 2. Durees

| Type             | Range     | Typique |
| ---------------- | --------- | ------- |
| Hover (couleur)  | 100–150ms | 150ms   |
| Enter / Exit     | 100–200ms | 200ms   |
| Layout animation | 200–250ms | 250ms   |

**Jamais depasser 250ms.** Exit peut etre ~20% plus rapide que enter. Elements associes (modal + overlay) : meme easing et duree.

---

## 3. Courbes ease-out (faible → forte)

```css
--ease-out-quad:  cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-out-cubic: cubic-bezier(0.215, 0.61, 0.355, 1);
--ease-out-quart: cubic-bezier(0.165, 0.84, 0.44, 1);
--ease-out-quint: cubic-bezier(0.23, 1, 0.32, 1);
--ease-out-expo:  cubic-bezier(0.19, 1, 0.22, 1);   /* ← defaut ERP */
```

Courbes ease-in-out (pour mouvement on-screen) :

```css
--ease-in-out-quad:  cubic-bezier(0.455, 0.03, 0.515, 0.955);
--ease-in-out-cubic: cubic-bezier(0.645, 0.045, 0.355, 1);
--ease-in-out-quart: cubic-bezier(0.77, 0, 0.175, 1);
--ease-in-out-quint: cubic-bezier(0.86, 0, 0.07, 1);
```

Ref : [easings.co](https://easings.co/)

---

## 4. Springs

```jsx
transition={{ type: "spring", duration: 0.4, bounce: 0 }}  // defaut
```

Exceptions :
- **Badge / Tag** : `bounce: 0.15–0.25`
- **Toggle thumb** : `bounce: 0.15`

Springs > CSS transitions quand l'animation peut etre interrompue (drag, gestes). Les springs conservent la velocite a l'interruption, les CSS transitions redemarrent a zero.

---

## 5. Proprietes animables

**Oui** : `transform`, `opacity`, `clip-path`, `filter` (blur < 20px).

**Non** : `width`/`height` (sauf accordion via `--radix-accordion-content-height`), `top`/`left`, `margin`/`padding`.

**Ne jamais animer** :
- Navigation clavier (tab, fleches, raccourcis)
- Elements utilises > 20×/jour (hover de cellules de table)
- Tooltips subsequents (instant apres le premier)

---

## 6. Composants

| Composant    | Animation                   | Easing          | Duree  | Bounce | Notes |
| ------------ | --------------------------- | --------------- | ------ | ------ | ----- |
| Button       | `scale(0.97)` active        | ease-out        | 150ms  | 0      | CSS `:active`, pas de hover |
| Toast        | `translateY(8→0)` + opacity | ease-out custom | 200ms  | 0      | Exit meme direction |
| Modal        | `scale(0.97→1)` + opacity   | ease-out custom | 200ms  | 0      | Origin center, jamais scale(0) |
| Loader       | `rotate(360°)`              | linear          | ∞      | 0      | Dans le bouton declencheur |
| Table row    | `translateX(-8→0)` + opacity| ease-out custom | 200ms  | 0      | Stagger 60ms |
| Badge/Tag    | `scale(0.5→1)` + opacity    | spring          | 400ms  | 0.25   | `layout` pour voisins |
| Toggle       | `translateX` thumb          | spring          | 400ms  | 0.15   | Container: colors 200ms |
| Input        | `border-color` + `ring`     | ease            | 200ms  | —      | Aucun transform |
| Dropdown     | `scale(0.97→1)` + opacity   | ease-out custom | 150ms  | 0      | Origin depuis declencheur |
| Progress     | `width: 0→n%`               | ease-out        | 300ms  | 0      | Pas de translate/opacity |
| Skeleton     | `opacity` pulse             | ease-in-out     | 1.5s ∞ | —      | Pas de translate/scale |
| Avatar       | `scale(0.8→1)` + opacity    | ease-out custom | 250ms  | 0      | Scale doux (> badge) |
| Counter      | Interpolation numerique     | —               | 200ms  | —      | `tabular-nums` obligatoire |
| Card         | `translateY(12→0)` + opacity| ease-out custom | 250ms  | 0      | Exit: `translateY(-8)` |
| Accordion    | `height(0→var)`             | ease-out        | 200ms  | 0      | `--radix-accordion-content-height` |
| Bar Chart    | `scaleY(0→1)` origin-bottom | ease-out custom | 250ms  | 0      | Stagger 40ms, gauche→droite |
| Line Chart   | `stroke-dashoffset` trace   | ease-out custom | 500ms  | 0      | Points: scale+opacity apres trace |
| Donut Chart  | `stroke-dashoffset` fill    | ease-out custom | 300ms  | 0      | Stagger 80ms, depart 12h |
| Area Chart   | trace + `opacity` fill      | ease-out custom | 500ms  | 0      | Fill 200ms apres la ligne |

Regle : chaque composant a **une seule signature**. Ne jamais appliquer `opacity + translateY` generique a tout.

---

## 7. Anti-patterns

| Faire | Ne pas faire |
| ----- | ------------ |
| `active:scale-[0.97]` boutons | `scale(0.9)` ou bounce au hover |
| `duration-150` a `duration-200` | `duration-500` ou plus |
| `opacity + translateY` sur cartes | `opacity + translateY` sur tout |
| Spring `bounce: 0` en general | Spring `bounce: 0.3` en ERP |
| `transform-origin` depuis declencheur | Scale centre pour dropdown |
| Spinner `linear infinite` | Spinner avec ease ou bounce |
| Input : border/ring seulement | Input qui bouge (translate/scale) |
| `tabular-nums` sur chiffres | Police proportionnelle (layout shift) |
| Animer `transform` + `opacity` | Animer `width`, `height`, `top`, `left` |
| Partir de `scale(0.95)` minimum | Partir de `scale(0)` |
| Animer l'enfant au hover | Animer le parent (flicker) |
| Meme timing elements associes | Durees differentes modal/overlay |

---

## 8. Performance

- `will-change: transform` uniquement sur elements qui drop des frames, jamais global
- Animer hors du cycle de rendu React (refs > state pour updates chaque frame)
- CSS pour animations simples, Motion pour animations interruptibles/dynamiques
- `blur` < 20px (Safari perf)
- `contain: layout style paint` pour isoler les conteneurs animes

---

## 9. Accessibilite (obligatoire)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

```jsx
import { useReducedMotion } from "motion/react";
const reduced = useReducedMotion();
```

Touch : hover uniquement sur `@media (hover: hover) and (pointer: fine)`. Cible min : 44×44px.
