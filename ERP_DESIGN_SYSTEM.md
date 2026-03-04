# ERP — Regles d'animation

> Regles d'animation pour tous les composants de l'ERP. Ce document fait autorite — en cas de conflit avec d'autres guidelines, c'est celui-ci qui prime pour tout contexte ERP.

---

## 1. Principes generaux

Les animations sont **rapides, fonctionnelles et invisibles**. L'utilisateur ne doit jamais les remarquer consciemment. Elles confirment une action, signalent un changement d'etat, ou guident l'attention — rien de plus.

### Durees

| Type             | Min   | Max   | Typique |
| ---------------- | ----- | ----- | ------- |
| Hover (couleur)  | 100ms | 150ms | 150ms   |
| Enter / Exit     | 100ms | 200ms | 200ms   |
| Layout animation | 200ms | 250ms | 250ms   |

**Jamais depasser 250ms.**

### Easing

| Contexte                 | Easing                           |
| ------------------------ | -------------------------------- |
| Enter / Exit             | `cubic-bezier(0.19, 1, 0.22, 1)` |
| Hover (couleur, opacite) | `ease`                           |
| Spinners / progress fill | `linear`                         |

**Interdits** : `ease-in`, `bounce > 0` sur les springs, overshoot / rebond.

### Spring

Config par defaut :

```jsx
transition={{ type: "spring", duration: 0.4, bounce: 0 }}
```

Exception : **badges/tags** et **toggle thumbs** peuvent utiliser `bounce: 0.15-0.25` (micro-elements ou le rebond renforce le retour physique).

### Proprietes animables

**Oui** : `transform`, `opacity`, `clip-path`, `filter` (blur avec parcimonie).

**Non** : `width`/`height` (sauf accordion via `--radix-accordion-content-height`), `top`/`left`, `margin`/`padding`.

### Ne jamais animer

- Navigation clavier (tab, fleches)
- Elements interagis > 20 fois/jour (hover de cellules de table, etc.)
- Tooltips subsequents (instant apres le premier)

---

## 2. Animation par composant

Chaque composant a **une seule signature d'animation**. Ne jamais appliquer un `opacity + translateY` generique a tout.

### Button

| Propriete | Valeur                                 |
| --------- | -------------------------------------- |
| Animation | `active:scale(0.97)` via CSS `:active` |
| Duree     | 150ms                                  |
| Easing    | ease-out                               |
| Outil     | CSS pur (Tailwind)                     |

```html
<button class="transition-transform duration-150 active:scale-[0.97]"></button>
```

Pas d'animation au hover (sauf `background-color` subtil). Pas de bounce. Pas de spring.

### Toast / Snackbar

| Propriete | Valeur                                   |
| --------- | ---------------------------------------- |
| Animation | `translateY(8px → 0)` + `opacity(0 → 1)` |
| Exit      | Meme direction (vers le bas)             |
| Duree     | 200ms                                    |
| Easing    | ease-out custom                          |
| Outil     | Motion (AnimatePresence)                 |

```jsx
initial={{ opacity: 0, y: 8 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: 8 }}
```

Les toasts glissent **depuis leur direction d'origine**. Auto-dismiss apres 2-3s.

### Modal / Dialog

| Propriete | Valeur                        |
| --------- | ----------------------------- |
| Animation | `scale(0.97 → 1)` + `opacity` |
| Transform | `transform-origin: center`    |
| Duree     | 200ms                         |
| Backdrop  | `opacity(0 → 1)`              |
| Easing    | ease-out custom               |

Les modales emergent **du centre, jamais d'un cote**. Le scale reste a 0.97 minimum (jamais `scale(0)`).

### Loader / Spinner

| Propriete | Valeur                                 |
| --------- | -------------------------------------- |
| Animation | `rotate(0 → 360deg)` en boucle infinie |
| Easing    | `linear`                               |

Pas de bounce, pas de spring. Le spinner se place **dans** le bouton qui a declenche l'action.

### Data Table (lignes)

| Propriete | Valeur                             |
| --------- | ---------------------------------- |
| Animation | `translateX(-8px → 0)` + `opacity` |
| Stagger   | 60ms entre chaque ligne            |
| Duree     | 200ms par ligne                    |
| Easing    | ease-out custom                    |

Les lignes glissent **horizontalement** car ce sont des elements horizontaux.

### Badge / Tag

| Propriete  | Valeur                               |
| ---------- | ------------------------------------ |
| Animation  | `scale(0.5 → 1)` + `opacity`         |
| Transition | spring `duration: 0.4, bounce: 0.25` |
| Exit       | `scale(0.5)` + `opacity: 0`          |

Les petits elements "pop" en existence. Utiliser `layout` pour que les voisins se repositionnent fluidement.

### Toggle / Switch

| Propriete  | Valeur                                             |
| ---------- | -------------------------------------------------- |
| Animation  | `translateX` sur le thumb uniquement               |
| Transition | spring `duration: 0.4, bounce: 0.15`               |
| Container  | `transition-colors duration-200` (fond qui change) |

**Seul le curseur bouge**, pas le conteneur.

### Input

| Propriete | Valeur                                |
| --------- | ------------------------------------- |
| Animation | `border-color` + `ring` en transition |
| Duree     | 200ms                                 |
| Easing    | ease                                  |

```html
<input
  class="transition-all duration-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
/>
```

**Aucun transform sur les inputs.** Seul l'etat visuel change.

### Dropdown / Menu

| Propriete | Valeur                                 |
| --------- | -------------------------------------- |
| Animation | `scale(0.97 → 1)` + `opacity`          |
| Transform | **Origin-aware** depuis le declencheur |
| Duree     | 150ms                                  |
| Easing    | ease-out custom                        |

Le dropdown **croit depuis son declencheur** (`transform-origin: top left`). Jamais depuis le centre.

### Progress Bar

| Propriete | Valeur              |
| --------- | ------------------- |
| Animation | `width: 0 → n%`     |
| Easing    | ease-out            |
| Duree     | 300ms par increment |

Les barres **se remplissent**. Seule la largeur anime — pas de translate, pas d'opacity.

### Skeleton

| Propriete | Valeur                               |
| --------- | ------------------------------------ |
| Animation | `pulse` (opacity ease-in-out infini) |

Les skeletons **pulsent, jamais de translate ni de scale**.

### Avatar

| Propriete | Valeur                       |
| --------- | ---------------------------- |
| Animation | `scale(0.8 → 1)` + `opacity` |
| Duree     | 250ms                        |
| Easing    | ease-out custom              |

Scale plus doux que les badges (0.8 vs 0.5) car les avatars sont plus grands.

### Stat / Counter

| Propriete | Valeur                             |
| --------- | ---------------------------------- |
| Animation | Interpolation numerique (count-up) |

Les nombres **s'incrementent, pas de mouvement spatial**. Utiliser `tabular-nums` pour eviter le layout shift.

### Card

| Propriete | Valeur                             |
| --------- | ---------------------------------- |
| Animation | `translateY(12px → 0)` + `opacity` |
| Exit      | `translateY(-8px)` + `opacity: 0`  |
| Duree     | 250ms                              |
| Easing    | ease-out custom                    |

Les cards **se levent en position**. Le mouvement vertical correspond a l'empilement naturel.

### Accordion

| Propriete | Valeur                                              |
| --------- | --------------------------------------------------- |
| Animation | `height: 0 → var(--radix-accordion-content-height)` |
| Duree     | 200ms                                               |
| Easing    | ease-out                                            |

### Bar Chart (vertical)

| Propriete | Valeur                                                    |
| --------- | --------------------------------------------------------- |
| Animation | `scaleY(0 → 1)` depuis la base                           |
| Transform | `transform-origin: bottom`                                |
| Stagger   | 40ms entre chaque barre                                   |
| Duree     | 250ms par barre                                           |
| Easing    | ease-out custom                                           |

Les barres **poussent depuis leur base**, jamais depuis le centre. Le stagger cree une lecture de gauche a droite.

### Line Chart

| Propriete | Valeur                                                    |
| --------- | --------------------------------------------------------- |
| Animation | `stroke-dashoffset` (trace progressif du path SVG)        |
| Duree     | 500ms total                                               |
| Easing    | ease-out custom                                           |
| Points    | `scale(0 → 1)` + `opacity`, stagger 50ms apres le trace  |

La ligne **se dessine** progressivement. Les points apparaissent une fois la ligne tracee.

### Donut Chart

| Propriete | Valeur                                                    |
| --------- | --------------------------------------------------------- |
| Animation | `stroke-dashoffset` par segment                           |
| Depart    | 12h (haut du cercle)                                      |
| Stagger   | 80ms entre chaque segment                                 |
| Duree     | 300ms par segment                                         |
| Easing    | ease-out custom                                           |

Les segments **se remplissent** depuis le haut. Pas de rotation du cercle entier.

### Area Chart

| Propriete | Valeur                                                    |
| --------- | --------------------------------------------------------- |
| Ligne     | `stroke-dashoffset` trace progressif, 500ms               |
| Remplissage | `opacity(0 → 0.15)`, 200ms apres la ligne              |
| Points    | `scale(0 → 1)` stagger 50ms apres la ligne               |
| Easing    | ease-out custom                                           |

Comme le Line Chart, avec un remplissage en fondu sous la courbe.

---

## 3. Tableau de reference rapide

| Composant    | Propriete animee            | Easing          | Duree  | Bounce |
| ------------ | --------------------------- | --------------- | ------ | ------ |
| Button       | `scale` (active)            | ease-out        | 150ms  | 0      |
| Toast        | `translateY` + `opacity`    | ease-out custom | 200ms  | 0      |
| Modal        | `scale` + `opacity`         | ease-out custom | 200ms  | 0      |
| Loader       | `rotate`                    | linear          | ∞      | 0      |
| Table row    | `translateX` + `opacity`    | ease-out custom | 200ms  | 0      |
| Badge        | `scale` + `opacity`         | spring          | 400ms  | 0.25   |
| Toggle thumb | `translateX`                | spring          | 400ms  | 0.15   |
| Input        | `border-color` + `ring`     | ease            | 200ms  | —      |
| Dropdown     | `scale` + `opacity`         | ease-out custom | 150ms  | 0      |
| Progress     | `width`                     | ease-out        | 300ms  | 0      |
| Skeleton     | `opacity` (pulse)           | ease-in-out     | 1.5s ∞ | —      |
| Avatar       | `scale` + `opacity`         | ease-out custom | 250ms  | 0      |
| Counter      | Interpolation numerique     | —               | 200ms  | —      |
| Card         | `translateY` + `opacity`    | ease-out custom | 250ms  | 0      |
| Accordion    | `height`                    | ease-out        | 200ms  | 0      |
| Bar Chart    | `scaleY` depuis la base     | ease-out custom | 250ms  | 0      |
| Line Chart   | `stroke-dashoffset` (trace) | ease-out custom | 500ms  | 0      |
| Donut Chart  | `stroke-dashoffset` (fill)  | ease-out custom | 300ms  | 0      |
| Area Chart   | trace + `opacity` (fill)    | ease-out custom | 500ms  | 0      |

---

## 4. Anti-patterns

| Faire                                    | Ne pas faire                                      |
| ---------------------------------------- | ------------------------------------------------- |
| `active:scale-[0.97]` sur les boutons    | `scale(0.9)` ou bounce au hover                   |
| `duration-150` a `duration-200`          | `duration-500` ou plus                            |
| `opacity + translateY` sur les cartes    | `opacity + translateY` sur tout                   |
| Spring `bounce: 0` en general            | Spring `bounce: 0.3` en ERP                       |
| `transform-origin` depuis le declencheur | Scale depuis le centre pour un dropdown           |
| Spinner `linear infinite`                | Spinner avec ease ou bounce                       |
| Input : border/ring seulement            | Input qui bouge (translate/scale)                 |
| `tabular-nums` sur les chiffres          | Chiffres en police proportionnelle (layout shift) |
| Animer `transform` + `opacity`           | Animer `width`, `height`, `top`, `left`, `margin` |

---

## 5. Accessibilite (obligatoire)

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
const reduced = useReducedMotion();
```
