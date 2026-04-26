# HomLiv RN — Design System & Architectural Rules

These rules apply to every line of code in every session. Violations will be flagged.

---

## Design Tokens

### Colors — `src/constants/colors.ts`

```ts
export const colors = {
  jet:        '#2d3142',
  slateBrand: '#4f5d75',
  coral:      '#ef8354',
  coralDark:  '#9c441a',
  surface:    '#fafafa',
  surfaceLow: '#f5f5f7',
  ink:        '#1d1d1f',
  ghost:      '#dcc1b7',
  // Semantic status — do not replace
  green:      '#16a34a',
  greenBg:    '#f0fdf4',
  red:        '#dc2626',
  redBg:      '#fef2f2',
  amber:      '#f59e0b',
  amberBg:    '#fffbeb',
}

export const gradients = {
  coral: ['#d47550', '#b85530'] as const,  // Primary CTA — terracotta
  ring:  ['#ef8354', '#9c441a'] as const,  // Stories ring
  dark:  ['#1a1c2e', '#0f1018'] as const,  // Dark card
  slate: ['#4f5d75', '#3d4d63'] as const,  // Slate card
}
```

**Never write raw hex in a component.** Always import from `src/constants/colors.ts`.

---

## Typography — `src/constants/typography.ts`

Apple system font only (SF Pro automatically on iOS — no font loading needed).

```ts
export const fonts = {
  displayLg:  { fontSize: 40, fontWeight: '700', letterSpacing: -1.6, lineHeight: 44 },
  displayMd:  { fontSize: 28, fontWeight: '700', letterSpacing: -0.84, lineHeight: 32 },
  titleLg:    { fontSize: 20, fontWeight: '700', letterSpacing: -0.4, lineHeight: 24 },
  titleMd:    { fontSize: 17, fontWeight: '600', letterSpacing: -0.34, lineHeight: 22 },
  titleSm:    { fontSize: 15, fontWeight: '600', letterSpacing: -0.3, lineHeight: 20 },
  bodyLg:     { fontSize: 17, fontWeight: '400', lineHeight: 26 },
  bodyMd:     { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodySm:     { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  labelMd:    { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, lineHeight: 16 },
  labelSm:    { fontSize: 11, fontWeight: '600', letterSpacing: 0.4, lineHeight: 14 },
  price:      { fontSize: 20, fontWeight: '700', letterSpacing: -0.4 },
  priceLg:    { fontSize: 28, fontWeight: '800', letterSpacing: -0.6 },
}
```

---

## Shadows — `src/constants/shadows.ts`

```ts
export const shadows = {
  card:      { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  cardHover: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 8 },
  dashboard: { shadowColor: '#17172b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.09, shadowRadius: 20, elevation: 5 },
  coral:     { shadowColor: '#b45028', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.30, shadowRadius: 16, elevation: 6 },
  navbar:    { shadowColor: '#12141f', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.50, shadowRadius: 24, elevation: 12 },
}
```

---

## Spacing — `src/constants/spacing.ts`

8pt grid only. No values outside this set:

```ts
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 40, max: 48 }
```

---

## Feed Surface Rules (relaxed)

Applies **only** on `(tabs)/index` and wherever `ListingCard` renders in a feed context:

- `gap: 12` between cards is acceptable (not the usual 24)
- Coral can appear on multiple elements per card (Like, Message, price, badge)
- Stories ring uses `gradients.ring`

All other surfaces: full design strictness.

---

## Code Rules

| Rule | Detail |
|------|--------|
| TypeScript | Strict. No `any`. All `StyleSheet` and props interfaces typed. |
| Animations | Reanimated only. **Never** `Animated` API. |
| Gradients | `expo-linear-gradient` for all gradient backgrounds and buttons. |
| Blur | `expo-blur` for tab bar, modals, headers. |
| Lists | `@shopify/flash-list` for all list/feed rendering. **Never** `FlatList`. |
| Forms | `react-hook-form` for all forms. |
| State | `zustand` for global state (session, notifications, blocked users). |
| Spacing | 8pt grid: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48. |
| Colors | All from `src/constants/colors.ts`. Never raw hex. |
| Logging | No `console.log` in committed code. |

---

## Trust Badge Rules

| Verification level | Badge text | Color |
|---|---|---|
| `none` | "Unverified poster" | slateBrand bg, white text |
| `contact` | **"Contact-verified"** (NOT "Verified") | amberBg, amber text |
| `homeowner` | "✓ Verified homeowner" | greenBg, green text |
| `landlord` | "✓ Verified landlord" | greenBg, green text |

---

## Legal Rules

- **PPS number must never appear** in any form anywhere in the app.
- `owner_occupier` listing type: gender and lifestyle preferences are **allowed** (Equal Status Acts s.6(2)(d) — owner-occupier sharing their home).
- `landlord` listing type: gender/nationality/religion preferences must **never** appear.
- Legal note shown in post wizard for each type at selection time.
