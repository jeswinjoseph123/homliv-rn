# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**HomLiv — React Native iOS App**
Stack: Expo managed workflow · Expo Router v3 · TypeScript strict · React Native Reanimated

Scope: iOS-first prototype. Frontend only. Mock data. No backend.

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

## Architecture

```
homliv/
  src/
    constants/      colors.ts · typography.ts · shadows.ts · spacing.ts
    types/          index.ts — all shared TypeScript types
    data/           listings.ts · users.ts · conversations.ts · maintenance.ts
    lib/            analytics.ts · storage.ts · utils.ts
    hooks/          useSession · useBlocked · useNotifSettings · usePostDraft
    components/
      feed/         StoriesRow · FilterChips · ListingCard · ListingCardSkeleton
      layout/       FeedHeader
      shared/       VerificationBadge
  app/
    (tabs)/         index (Feed) · search · messages · me
    listing/[id]    Listing detail
    messages/[id]   Chat thread
    post/           4-step wizard (index · photos · details · review)
    me/             listings · saved · settings · settings/*
    landlord/       Overview · Properties · Tenants · Maintenance · Payments · Messages
    auth/           login · signup · verify/*
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

## Key rules — read before writing any code

See `docs/design.md` for the full design system. Summary:

- **No raw hex** — import all colors from `src/constants/colors.ts`
- **No `Animated` API** — Reanimated only
- **No `FlatList`** — `@shopify/flash-list` only
- **No `console.log`** in committed code
- **No `any`** types
- **8pt spacing grid only**: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48
- **Feed Surface is relaxed** — `gap: 12` OK, coral on multiple elements OK. All other surfaces are strict.
- **PPS number must never appear** in any form, anywhere
- `contact` verification = badge reads **"Contact-verified"** (amber). Never just "Verified".
- `owner_occupier` listing type unlocks gender/lifestyle preferences (Equal Status Acts s.6(2)(d)). `landlord` type must **never** show those fields.

---

## Sessions completed

- [x] Session 1 — Project Setup
- [x] Session 2 — Feed Surface
- [x] Session 3 — Listing Detail + Post Wizard
- [x] Session 4 — Unified Chat
- [x] Session 5 — Tenant Home + Saved Searches
- [ ] Session 6 — Auth + Verification Gate
- [ ] Session 7 — Landlord Dashboard + Polish + TestFlight
