# DataToolbar — Documentation des règles et fonctionnalités

Composant React (`SortdialogJSX.jsx`) implémentant une barre d'outils de données avec gestion des rôles, des vues, des filtres, du tri et de la visibilité des colonnes.

---

## Table des matières

1. [Système de rôles](#1-système-de-rôles)
2. [Système de vues](#2-système-de-vues)
3. [Colonnes — affichage et accès](#3-colonnes--affichage-et-accès)
4. [Filtres simples et avancés](#4-filtres-simples-et-avancés)
5. [Niveaux d'accès aux filtres](#5-niveaux-daccès-aux-filtres)
6. [Tri](#6-tri)
7. [Règles de priorité et héritage](#7-règles-de-priorité-et-héritage)
8. [Sauvegarde de vues](#8-sauvegarde-de-vues)

---

## 1. Système de rôles

La hiérarchie est à trois niveaux, du plus permissif au plus restreint :

```
Dev  →  Owner  →  User
```

| Rôle  | Description |
|-------|-------------|
| **Dev** | Accès complet. Configure tout : colonnes, filtres, vues. Peut imposer des règles à Owner et User. |
| **Owner** | Peut configurer ses propres vues et en imposer aux Users. Soumis aux règles définies par le Dev. |
| **User** | Accès et vues personnels uniquement. Soumis aux règles définies par Dev et Owner. |

### Règles de rôle

- Un rôle **ne peut pas** avoir plus de droits que le rôle au-dessus de lui.
- Quand Dev et Owner définissent tous les deux une règle sur le même élément (colonne ou filtre), c'est toujours la **plus restrictive** des deux qui s'applique.
- Le Dev voit et contrôle toute la chaîne. L'Owner ne voit que ses règles et celles en dessous.

---

## 2. Système de vues

Chaque rôle dispose de son propre espace de vues indépendant.

### Types de vues

| Type | Propriété | Description |
|------|-----------|-------------|
| Vue par défaut | `isDefault: true` | Toujours présente, ne peut pas être supprimée. Reçoit les mises à jour imposées par les rôles supérieurs. |
| Vue personnelle | `isDefault: false, isShared: false` | Créée par l'utilisateur pour lui-même. Copie la vue active au moment de la création. |
| Vue partagée | `isShared: true` | Créée par Dev ou Owner via "Vue pour tous". Contient la configuration à propager vers les rôles inférieurs. |

### Règles des vues

- Chaque rôle peut avoir **une seule** vue partagée (`isShared: true`) à la fois.
- La vue par défaut **ne peut pas être supprimée**.
- Les vues personnelles peuvent être supprimées par leur propriétaire.
- La vue partagée appartient à celui qui l'a créée (Dev ou Owner) — elle n'est **pas visible** directement par les rôles inférieurs ; c'est son contenu qui est propagé vers leur vue par défaut.
- On ne peut pas renommer la vue par défaut (seules les vues personnelles et partagées sont renommables selon l'UI actuelle).

---

## 3. Colonnes — affichage et accès

### Niveaux d'accès aux colonnes

| Niveau | Label | Comportement |
|--------|-------|--------------|
| `full` | Éditable | La colonne est visible et modifiable. |
| `view` | Lecture seule | La colonne est visible mais non modifiable. |
| `ask` | Masqué + demande | La colonne est cachée. L'utilisateur sait qu'elle existe et peut en demander l'accès. |
| `none` | Masqué total | La colonne est invisible. L'utilisateur ne sait même pas qu'elle existe. |

### Règles des colonnes

- Le niveau d'accès effectif pour un User est le **plus restrictif** entre la règle du Dev et la règle de l'Owner.
- Les colonnes avec accès `none` ou `ask` sont **exclues du compteur total** de colonnes affiché dans le panneau de visibilité.
- Une colonne cachée par règle d'accès (`none`/`ask`) **n'apparaît pas** dans le panneau de visibilité des rôles inférieurs — elle est entièrement invisible.
- Une colonne masquée par règle d'accès ne peut pas être filtrée par les rôles qui n'y ont pas accès.
- Le panneau de visibilité des colonnes affiche le bouton de clé (⚷) uniquement si on est sur une **vue par défaut ou partagée** (`isForAllView`) ET que le rôle a le droit d'éditer les accès (`canEditAccess`).
- Le total de colonnes affiché = nombre de colonnes accessibles (excluant `none` et `ask`).
- Les colonnes masquées par `hiddenColumns` (choix de l'utilisateur) sont comptées dans le total mais pas dans le nombre de colonnes visibles.

### Drag & Drop des colonnes

- Les colonnes peuvent être réordonnées par glisser-déposer dans l'en-tête du tableau.
- La navigation clavier est supportée (flèches, Espace pour saisir/déposer, Échap pour annuler).
- L'ordre est sauvegardé dans la vue active (`columnOrder`).

---

## 4. Filtres simples et avancés

### Filtres simples

- Un filtre simple est lié à **une seule colonne** avec un opérateur et une valeur.
- Opérateurs disponibles selon le tyjen epe de colonne :
  - **Texte / Email / URL / Téléphone / Lieu / Fichier / Emoji / ID** : est, n'est pas, contient, ne contient pas, commence par, finit par, est vide, n'est pas vide.
  - **Nombre / Formule / Rollup** : égale, différent de, supérieur à, inférieur à, ≥, ≤, est vide, n'est pas vide.
  - **Date / Créé le** : est, est avant, est après, est vide, n'est pas vide.
  - **Sélection / Statut / Relation** : est, n'est pas, est vide, n'est pas vide.
  - **Case à cocher** : est coché, n'est pas coché.
  - **Utilisateur** : est, n'est pas, est vide, n'est pas vide.
  - **Tags** : contient, ne contient pas, est vide, n'est pas vide.

### Filtres avancés

- Un filtre avancé peut regrouper **plusieurs conditions** sur plusieurs colonnes avec une logique ET/OU.
- Les filtres avancés sont édités via un builder dédié.
- Un filtre avancé **ne peut pas être édité** s'il est verrouillé (`locked: true`) — le bouton d'édition est désactivé.
- Un filtre avancé verrouillé n'a **pas de bouton de suppression** pour les rôles inférieurs.

### Ordre d'affichage

- Les filtres simples et avancés sont affichés **mélangés dans l'ordre de création** (basé sur le timestamp extrait de leur identifiant).
- Il n'y a pas de séparation visuelle entre filtres simples et avancés dans la liste.

---

## 5. Niveaux d'accès aux filtres

Ces niveaux définissent ce que les rôles inférieurs voient d'un filtre imposé.

| Niveau | Label | Comportement pour le rôle inférieur |
|--------|-------|--------------------------------------|
| `visible` | Visible | Le filtre est affiché avec un cadenas. L'utilisateur voit qu'il est actif et sur quelle colonne, mais ne peut pas le modifier ni le supprimer. |
| `ask` | Accès restreint | Le filtre est affiché sous forme de "Filtre restreint sur [Colonne]". L'utilisateur ne voit pas les valeurs filtrées mais peut demander l'accès. |
| `silent` | Caché | Le filtre est invisible. L'utilisateur ne sait pas qu'un filtre est actif. Les données semblent simplement pré-filtrées. |

### Règles des filtres

- Seul un **Dev ou Owner** peut définir le niveau d'accès d'un filtre (bouton ⚷ visible uniquement sur les vues par défaut/partagées avec `canEditAccess`).
- Le niveau d'accès effectif d'un filtre pour un User est le **plus restrictif** entre la règle Dev et la règle Owner.
- Un filtre `silent` **n'affiche pas d'indicateur** sur l'en-tête de colonne dans le tableau (le point de filtre est caché).
- Un filtre `visible` ou `ask` affiche bien l'indicateur sur l'en-tête de colonne.
- Un filtre imposé (`locked: true`) **ne peut pas être supprimé** par les rôles inférieurs.
- Un filtre imposé avec accès `visible` affiche un **icône cadenas** à la place du bouton de suppression.
- Un filtre imposé avec accès `ask` affiche : "Filtre restreint sur [Nom de la colonne]" avec un bouton "Demander l'accès".
  - Si plusieurs colonnes sont concernées (filtre avancé) : "Filtre restreint sur Col1, Col2 et Col3".
- Un filtre imposé avec accès `silent` est **totalement invisible** dans l'interface du rôle inférieur.

### Priorité des filtres imposés

- Les filtres imposés définissent le **périmètre de données de base** de la vue de l'utilisateur.
- Les filtres ajoutés par l'utilisateur ne font que **restreindre davantage** dans ce périmètre — ils ne peuvent jamais l'élargir.
- Tous les filtres (imposés + personnels) sont combinés en logique **AND**.
- Exemple : si un filtre imposé restreint à "Projets de Marc" et que l'utilisateur filtre "Prix > 10€", il verra uniquement les projets de Marc avec un prix supérieur à 10€. S'il essaie de filtrer sur Cécile, il ne verra aucun résultat.

---

## 6. Tri

- Les tris sont **globaux** — ils ne sont pas sauvegardés par vue, ils s'appliquent à l'état courant.
- On peut trier par plusieurs colonnes simultanément.
- Cliquer sur un en-tête de colonne : pas de tri → croissant → décroissant → supprimé.
- Les tris peuvent être réordonnés par glisser-déposer dans le panneau de tri.
- Chaque tri peut être configuré avec un ordre personnalisé si la colonne propose des valeurs ordonnables (statut, priorité, emoji).
- Les tris peuvent être modifiés (direction, ordre custom) ou supprimés individuellement.

---

## 7. Règles de priorité et héritage

### Hiérarchie de calcul des accès

```
Niveau effectif = mostRestrictive(règle Dev, règle Owner)
```

Pour les colonnes :
```
full < view < ask < none
(full = le moins restrictif, none = le plus restrictif)
```

Pour les filtres :
```
visible < ask < silent
(visible = le moins restrictif, silent = le plus restrictif)
```

### Règles d'héritage lors d'un "Vue pour tous"

Quand un Dev ou Owner sauvegarde une "Vue pour tous" :

1. Une vue partagée (`isShared: true`) est créée/écrasée dans la liste de vues du rôle actuel.
2. La **vue par défaut** de chaque rôle cible est mise à jour avec :
   - Les **filtres** de la vue source, marqués `locked: true`, filtrés pour exclure ceux sur des colonnes inaccessibles au rôle cible.
   - Les **filtres avancés** de la vue source, marqués `locked: true`, filtrés pour exclure ceux dont une condition porte sur une colonne inaccessible.
   - Les **colonnes masquées** de la vue source, filtrées pour exclure celles inaccessibles au rôle cible.
3. Le rôle actuel est redirigé vers sa vue partagée après la sauvegarde.

### Règles de filtrage des colonnes lors de la propagation

- Une colonne est considérée **accessible** au rôle cible si son niveau d'accès effectif est `full` ou `view` (pas `ask` ni `none`).
- Les filtres portant sur des colonnes inaccessibles sont **supprimés** lors de la propagation — on ne filtre pas sur ce que l'utilisateur ne peut pas voir.

---

## 8. Sauvegarde de vues

### Actions disponibles depuis le bouton "Enregistrer"

| Action | Disponible quand | Effet |
|--------|-----------------|-------|
| **Enregistrer** | Sur une vue personnelle uniquement (pas défaut, pas partagée) | Marque la vue comme sauvegardée (cosmétique — les changements sont déjà en temps réel). |
| **Enregistrer une nouvelle vue** | Sur la vue par défaut uniquement | Crée une copie de la vue par défaut comme nouvelle vue personnelle et réinitialiser la vue par défaut. |
| **Vue pour tous** | Dev ou Owner, quand aucune vue partagée n'existe | Crée une nouvelle vue partagée et met à jour les vues par défaut des rôles inférieurs. |
| **Mettre à jour pour tous** | Dev ou Owner, quand déjà sur la vue partagée | Met à jour directement la vue partagée et les vues par défaut des rôles inférieurs sans confirmation. |
| **Vue pour tous** (avec confirmation) | Dev ou Owner, sur une vue NON partagée, quand une vue partagée existe déjà | Demande confirmation avant d'écraser la vue partagée existante. |

### Règles de sauvegarde

- Le bouton "Enregistrer" **n'apparaît pas** sur la vue partagée — à la place, seul "Mettre à jour pour tous" est proposé.
- Le bouton "Enregistrer" **n'apparaît pas** sur la vue par défaut — on ne peut pas "sauvegarder" la vue de base.
- "Vue pour tous" et "Mettre à jour pour tous" sont **réservés aux rôles Dev et Owner** (`canSaveForOthers`).
- Un Dev ne peut imposer qu'à Owner et User. Un Owner ne peut imposer qu'à User. Un User ne peut imposer à personne.
- Quand on est sur la vue partagée et qu'on fait "Mettre à jour pour tous", les changements sont propagés **sans confirmation**.
- Quand on est sur une autre vue et qu'une vue partagée existe, la confirmation "Écraser ?" est affichée avant de propager.

---

## Résumé des droits par rôle

| Fonctionnalité | Dev | Owner | User |
|----------------|-----|-------|------|
| Créer des filtres personnels | ✅ | ✅ | ✅ |
| Supprimer ses propres filtres | ✅ | ✅ | ✅ |
| Modifier un filtre imposé | ❌ | ❌ | ❌ |
| Supprimer un filtre imposé | ❌ | ❌ | ❌ |
| Définir le niveau d'accès d'un filtre | ✅ (sur vue défaut/partagée) | ✅ (sur vue défaut/partagée) | ❌ |
| Créer des vues personnelles | ✅ | ✅ | ✅ |
| Supprimer ses vues personnelles | ✅ | ✅ | ✅ |
| Supprimer la vue par défaut | ❌ | ❌ | ❌ |
| Sauvegarder une "Vue pour tous" | ✅ (→ Owner + User) | ✅ (→ User) | ❌ |
| Configurer l'accès aux colonnes | ✅ (sur vue défaut/partagée) | ✅ (sur vue défaut/partagée) | ❌ |
| Voir les colonnes `none` | ✅ | ✅ si Dev le permet | ❌ |
| Voir les filtres `silent` | ✅ | ✅ | ❌ |
| Voir les filtres `ask` | ✅ | ✅ | Chip "Restreint" uniquement |
| Réordonner les colonnes | ✅ | ✅ | ✅ |
| Créer des tris | ✅ | ✅ | ✅ |
