---
name: homliv-design
description: Load HomLiv RN design system rules — colors, typography, shadows, spacing, Feed Surface relaxations, code constraints, trust badge wording, and legal rules. Invoke at the start of every session before writing any code.
---

# HomLiv Design System — Active

You are now operating under HomLiv design rules. These are non-negotiable constraints.

## Before writing any component

1. All colors → `src/constants/colors.ts`. Zero raw hex values.
2. All typography → `src/constants/typography.ts` scale.
3. All shadows → `src/constants/shadows.ts` presets.
4. Spacing: 8pt grid only — 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48.

## Library constraints (no exceptions)

- Animations: **Reanimated only** — `withSpring`, `withTiming`, `withRepeat`. Never `Animated`.
- Lists: **FlashList only** (`@shopify/flash-list`). Never `FlatList`.
- Gradients: `expo-linear-gradient` everywhere.
- Blur: `expo-blur` for tab bar, modals, sticky headers.
- Forms: `react-hook-form`.
- Global state: `zustand`.
- Images: `expo-image` with `contentFit: 'cover'` and `cachePolicy: 'memory-disk'`.

## TypeScript

Strict. No `any`. All `StyleSheet` definitions typed. All props interfaces typed. No `console.log`.

## Feed Surface relaxation (applies ONLY on `(tabs)/index` and `ListingCard` in feed context)

- `gap: 12` between cards (not 24)
- Coral on multiple card elements is OK
- Stories ring → `gradients.ring`
- Everything else: full strictness

## Trust badge wording — exact strings

| level | text | style |
|---|---|---|
| `none` | "Unverified poster" | slateBrand bg |
| `contact` | **"Contact-verified"** | amberBg + amber text |
| `homeowner` | "✓ Verified homeowner" | greenBg + green text |
| `landlord` | "✓ Verified landlord" | greenBg + green text |

`contact` level is **never** labelled "Verified". Always "Contact-verified".

## Legal constraints

- **PPS number field must never exist** in any form.
- `owner_occupier` type → gender/lifestyle preferences allowed (Equal Status Acts s.6(2)(d)).
- `landlord` type → gender/nationality/religion preference fields must never render.

## Color quick-reference

```
jet        #2d3142   navbar, headings, dark surfaces
slateBrand #4f5d75   secondary text, meta, sidebar
coral      #ef8354   CTAs, price, active states (scarce — not decorative)
surface    #fafafa   page background
surfaceLow #f5f5f7   section backgrounds, input fields
ink        #1d1d1f   body text
ghost      #dcc1b7   borders (15% opacity only)
green      #16a34a   verified, resolved
amber      #f59e0b   pending, contact-verified
red        #dc2626   errors, overdue
```

Gradients: coral `['#d47550','#b85530']` · ring `['#ef8354','#9c441a']` · dark `['#1a1c2e','#0f1018']` · slate `['#4f5d75','#3d4d63']`

## Full reference

Full token definitions with exact values: `docs/design.md`
