# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**HomLiv — React Native iOS App**
Stack: Expo managed workflow · Expo Router v3 · TypeScript strict · React Native Reanimated

Scope: iOS-first prototype. Frontend only. Mock data. No backend.

---

## Before you change anything

1. Read `src/constants/colors.ts` — use ONLY these tokens
2. Read the Feed Surface rules in this file — different rules apply on feed vs other surfaces
3. No raw hex values in components
4. No Animated API — use Reanimated only
5. No FlatList — use FlashList only
6. No `console.log` in committed code
7. The PPS number field must NEVER be added to any form
8. Trust badges: `contact` level = "Contact-verified" (amber). Never "Verified" for this level.
9. Legal note: `owner_occupier` listing type unlocks gender/lifestyle preferences (Equal Status Acts s.6(2)(d)). `landlord` listing type must NEVER show those fields.

---

## Commands

```bash
cd homliv
npx expo start          # Start dev server (Expo Go / simulator)
npx expo start --ios    # iOS simulator directly
npx tsc --noEmit        # TypeScript check
eas build --platform ios --profile preview   # TestFlight build
eas submit --platform ios                    # Submit to TestFlight
```

---

## Route map

```
(tabs)/index     Feed
(tabs)/search    Search + filters
(tabs)/messages  Inbox
(tabs)/me        Profile / tenant home
listing/[id]     Listing detail
messages/[id]    Chat thread
post/*           Post wizard (4 steps)
landlord/*       Landlord dashboard (role-gated — requires roles.includes('landlord'))
  landlord/index        Overview (stats, RTB banner, recent activity)
  landlord/properties   Property listings with tenant info
  landlord/tenants      Tenant roster with lease info
  landlord/maintenance  Maintenance tracker (synced with chat via useChatStore)
  landlord/payments     Rent tracker + payment history
  landlord/messages     Inbox filtered to landlord conversations
auth/*           Auth + verification
onboarding       3-screen welcome flow (shown when user === null)
```

---

## Architecture

```
homliv/
  src/
    constants/      colors.ts · typography.ts · shadows.ts · spacing.ts
    types/          index.ts — all shared TypeScript types
    data/           listings.ts · users.ts · conversations.ts · maintenance.ts · tenancy.ts
    lib/            analytics.ts · storage.ts · utils.ts
    hooks/          useSession · useBlocked · useNotifSettings · usePostDraft · useChatStore
    components/
      feed/         StoriesRow · FilterChips · ListingCard · ListingCardSkeleton
      layout/       FeedHeader
      shared/       VerificationBadge
      chat/         ComposerBar · ChatHeader · MaintenanceCard · ViewingCard · …
  app/
    (tabs)/         index (Feed) · search · messages · me
    listing/[id]    Listing detail
    messages/[id]   Chat thread
    post/           4-step wizard (index · photos · details · review)
    me/             listings · saved · settings · settings/*
    landlord/       Overview · Properties · Tenants · Maintenance · Payments · Messages
    auth/           login · signup · verify/*
    onboarding/     index (3-screen welcome pager)
```

---

## Dependency notes (hard-won)

- `babel-preset-expo` is **not** included by `create-expo-app blank-typescript` when Expo Router is added separately. Install as devDependency: `npm install --save-dev babel-preset-expo --legacy-peer-deps`
- `react-native-reanimated` v4 (SDK 54) requires `react-native-worklets` as a peer dep. Install: `npx expo install react-native-worklets`
- Reanimated v4 Babel plugin is `react-native-worklets/plugin` — **not** `react-native-reanimated/plugin`
- `posthog-react-native` has a peer dep conflict with `react-dom`. Always install with `--legacy-peer-deps`
- Any `npm install` that fails with ERESOLVE: retry with `--legacy-peer-deps`

`babel.config.js` must be:
```js
module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin'],
  }
}
```

---

## Feed Surface relaxed rules

Only applies in `(tabs)/index` and anywhere `ListingCard` renders:
- `gap: 12` between cards (not 24)
- Coral can appear on multiple card elements
- `StoriesRow` ring uses `gradients.ring`

All other surfaces (landlord dashboard, listing detail, chat, post wizard, me): strict design rules.

---

## Design tokens

All in `src/constants/`. Import from there. Never write hex values.

| Token file | Key exports |
|---|---|
| `colors.ts` | `colors.jet`, `coral`, `slateBrand`, `surface`, `surfaceLow`, `amberBg`, `greenBg`, `redBg`, `amber`, `green`, `red`, `ghost` · `gradients.coral`, `gradients.slate`, `gradients.dark`, `gradients.ring` |
| `typography.ts` | `fonts.displayLg/Md`, `titleLg/Md/Sm`, `bodyLg/Md/Sm`, `labelMd/Sm`, `price`, `priceLg` |
| `shadows.ts` | `shadows.card`, `cardHover`, `dashboard`, `coral`, `navbar` |
| `spacing.ts` | 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 |

---

## Landlord dashboard data architecture

The maintenance tab derives all data from `useChatStore` — it flatMaps maintenance-type messages from the landlord's conversations. `mockMaintenanceRequests` in `src/data/maintenance.ts` is reference data only (not used at runtime).

`updateMaintenanceStatus(convId, msgId, status)` on `useChatStore` is the single write path for both the chat `MaintenanceCard` and the landlord Maintenance tab. Both surfaces subscribe to the same store — status changes reflect on both instantly.

---

## Auth + session notes

- **Dev session user**: `mockUsers[2]` (Aoife Murphy, `roles: ['user']`) — cannot access landlord dashboard
- **Test landlord login**: use email `priya@example.com` (Priya Nair, `roles: ['landlord']`, owns l4 + l6) or `sean@example.com` (Sean Brennan, owns l5 + l9)
- Onboarding screen shown when `!user && hasHydrated` — root `_layout.tsx` handles the redirect
- `useRequireAuth({ requireLandlord: true })` is called in `app/landlord/_layout.tsx`

---

## Accessibility standards

All new interactive elements must have:
- `accessibilityLabel` (descriptive, not just the icon name)
- `accessibilityRole="button"` on all Pressable/TouchableOpacity
- `accessibilityState={{ selected }}` on toggle buttons and filter chips
- Minimum 44×44 touch target via `hitSlop` on icon buttons
- Images: `accessibilityLabel` on content images, `accessibilityElementsHidden` on decorative ones

---

## Sessions completed

- [x] Session 1 — Project Setup
- [x] Session 2 — Feed Surface
- [x] Session 3 — Listing Detail + Post Wizard
- [x] Session 4 — Unified Chat
- [x] Session 5 — Tenant Home + Saved Searches
- [x] Session 6 — Auth + Verification Gate
- [x] Session 7 — Landlord Dashboard + Accessibility + Performance + TestFlight
