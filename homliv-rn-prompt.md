# HomLiv — React Native iOS App (Expo)
## Complete Build Prompt — All Sessions

**Platform:** iOS first (iPhone), Expo managed workflow, Expo Router v3
**Target:** User testing prototype with all features from the social-feed HomLiv architecture
**Design:** HomLiv "Digital Curator" design language — same color tokens as web, native primitives
**Scope:** Frontend only. Mock data. No backend integration.
**Metrics:**
- Time from app open to first message sent: under 5 minutes
- First listing posted in under 90 seconds (owner-occupier flow)

---

## How to use this document

7 sessions. Each is a self-contained Claude Code prompt.

1. Open a fresh Claude Code conversation
2. Paste the session block in full
3. Review every file diff before accepting
4. Run the verification checklist before moving to the next session
5. Never skip ahead — each session builds on the previous

---

## Architectural Rules — Read Before Every Session

These apply to every line of code in every session.

### Design tokens

No new colors. These are the only values used throughout the app:

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
  // Primary CTA — terracotta
  coral: ['#d47550', '#b85530'] as const,
  // Stories ring
  ring:  ['#ef8354', '#9c441a'] as const,
  // Dark card
  dark:  ['#1a1c2e', '#0f1018'] as const,
  // Slate card
  slate: ['#4f5d75', '#3d4d63'] as const,
}
```

Store in `src/constants/colors.ts`. Import from there everywhere. Never write raw hex in a component.

### Typography

Apple system font only. In React Native this is SF Pro automatically on iOS.

```ts
export const fonts = {
  // Display
  displayLg:  { fontSize: 40, fontWeight: '700', letterSpacing: -1.6, lineHeight: 44 },
  displayMd:  { fontSize: 28, fontWeight: '700', letterSpacing: -0.84, lineHeight: 32 },
  // Title
  titleLg:    { fontSize: 20, fontWeight: '700', letterSpacing: -0.4, lineHeight: 24 },
  titleMd:    { fontSize: 17, fontWeight: '600', letterSpacing: -0.34, lineHeight: 22 },
  titleSm:    { fontSize: 15, fontWeight: '600', letterSpacing: -0.3, lineHeight: 20 },
  // Body
  bodyLg:     { fontSize: 17, fontWeight: '400', lineHeight: 26 },
  bodyMd:     { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodySm:     { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  // Label
  labelMd:    { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, lineHeight: 16 },
  labelSm:    { fontSize: 11, fontWeight: '600', letterSpacing: 0.4, lineHeight: 14 },
  // Price
  price:      { fontSize: 20, fontWeight: '700', letterSpacing: -0.4 },
  priceLg:    { fontSize: 28, fontWeight: '800', letterSpacing: -0.6 },
}
```

Store in `src/constants/typography.ts`.

### Shadows

```ts
export const shadows = {
  card:       { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  cardHover:  { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 8 },
  dashboard:  { shadowColor: '#17172b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.09, shadowRadius: 20, elevation: 5 },
  coral:      { shadowColor: '#b45028', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.30, shadowRadius: 16, elevation: 6 },
  navbar:     { shadowColor: '#12141f', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.50, shadowRadius: 24, elevation: 12 },
}
```

Store in `src/constants/shadows.ts`.

### Feed Surface rules (relaxed)

On the feed (`/` route and anywhere a listing card grid renders):
- `gap: 12` is acceptable between cards (not the usual 24)
- Coral can appear on multiple elements per card (Like, Message, price, badge)
- Stories ring uses `gradients.ring`

All other surfaces use full design strictness.

### Code rules

- TypeScript strict. No `any`. No `console.log` in committed code.
- All StyleSheet definitions typed. All props interfaces typed.
- React Native Reanimated for all animations. No `Animated` API.
- `expo-linear-gradient` for all gradient backgrounds and buttons.
- `expo-blur` for blur effects (tab bar, modals).
- `@shopify/flash-list` for all list/feed rendering (not FlatList).
- `react-hook-form` for all forms.
- `zustand` for global state (session, notifications, blocked users).
- All color values imported from `src/constants/colors.ts`. Never raw hex.
- All spacing uses an 8pt grid: 4, 8, 12, 16, 20, 24, 32, 40, 48.

---

## Mock data types

Define all types in `src/types/index.ts` before session 1 starts.

```ts
export type VerificationLevel =
  | 'none'
  | 'contact'        // phone + email
  | 'homeowner'      // contact + eircode confirmation
  | 'landlord'       // full 4-step

export type ListingType =
  | 'owner_occupier' // room in own home
  | 'landlord'       // whole property
  | 'housemate'      // current tenant

export type User = {
  id: string
  name: string
  avatar: string | null
  roles: ('user' | 'owner_occupier' | 'landlord')[]
  verificationLevel: VerificationLevel
  phone: string
  email: string
  joinedAt: Date
  isOnline: boolean
  lastSeen: Date
}

export type Listing = {
  id: string
  posterId: string
  listingType: ListingType
  title: string
  description: string
  price: number
  billsIncluded: boolean
  location: string
  eircode: string
  area: string
  coordinates: { lat: number; lng: number }
  photos: string[]       // local require() paths for mock
  roomType: 'single' | 'double' | 'shared' | 'whole_property'
  bedrooms: number
  bathrooms: number
  berRating: string
  moveInDate: Date | 'immediate'
  expiresAt: Date
  createdAt: Date
  preferences: {
    gender?: 'female' | 'male' | 'no_preference'
    diet?: 'vegetarian' | 'vegan' | 'halal' | 'none'
    languages?: string[]
    householdVibe?: 'quiet' | 'social' | 'mixed'
    workPattern?: 'standard' | 'night_shifts' | 'remote'
    pets?: 'cats' | 'dogs' | 'welcome' | 'none'
    smoking?: 'inside' | 'outside' | 'none'
  } | null              // null for landlord listings
  tags: string[]
  likes: number
  views: number
  isRPZ: boolean
}

export type MessageType =
  | 'text'
  | 'maintenance'
  | 'viewing_request'
  | 'viewing_confirmed'
  | 'status'

export type Message = {
  id: string
  conversationId: string
  senderId: string
  type: MessageType
  text?: string
  maintenanceData?: {
    category: string
    priority: 'low' | 'medium' | 'high'
    description: string
    photos: string[]
    status: 'open' | 'in_progress' | 'resolved'
  }
  viewingData?: {
    slots: Date[]
    confirmedSlot?: Date
    note?: string
  }
  createdAt: Date
  readAt?: Date
}

export type Conversation = {
  id: string
  listingId: string
  participantIds: string[]
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export type MaintenanceRequest = {
  id: string
  conversationId: string
  propertyId: string
  tenantId: string
  category: string
  priority: 'low' | 'medium' | 'high'
  description: string
  photos: string[]
  status: 'open' | 'in_progress' | 'resolved'
  createdAt: Date
  updatedAt: Date
}

export type SavedSearch = {
  id: string
  name: string
  filters: {
    type?: string
    maxPrice?: number
    area?: string
    tags?: string[]
  }
  notify: boolean
  newResultCount: number
  createdAt: Date
}
```

---

## SESSION 1 — Project Setup

**Goal:** Expo project scaffolded, design tokens wired, Expo Router routes created, mock data written, analytics installed.

**End state:** All routes show placeholder screens. SF Pro renders. Colors correct.

---

You are building a React Native iOS app called HomLiv — an Irish social rental platform. This is session 1 of 7. Build the foundation only.

**1. Create an Expo project:**
```bash
npx create-expo-app homliv --template blank-typescript
cd homliv
```

Install all dependencies in one shot:
```bash
npx expo install expo-router expo-linear-gradient expo-blur expo-image expo-haptics expo-camera expo-image-picker expo-document-picker expo-notifications expo-secure-store expo-constants react-native-reanimated react-native-gesture-handler react-native-safe-area-context react-native-screens @shopify/flash-list react-hook-form zustand @react-native-async-storage/async-storage
npm install posthog-react-native
```

Set up Expo Router in `app.json`:
```json
{
  "expo": {
    "scheme": "homliv",
    "web": { "bundler": "metro" },
    "plugins": [
      "expo-router",
      "expo-secure-store"
    ]
  }
}
```

**2. File structure to create:**
```
src/
  constants/
    colors.ts        ← paste tokens from Architectural Rules
    typography.ts    ← paste font scales
    shadows.ts       ← paste shadow values
    spacing.ts       ← 8pt grid: xs:4 sm:8 md:12 lg:16 xl:20 xxl:24 xxxl:32
  types/
    index.ts         ← paste all types from this document
  data/
    listings.ts      ← 10 mock listings (varied: owner_occupier, landlord, housemate)
    users.ts         ← 8 mock users (varied verification levels and roles)
    conversations.ts ← 5 mock conversations (varied message types)
    maintenance.ts   ← 4 mock maintenance requests
  lib/
    analytics.ts     ← typed track() helper using PostHog
    storage.ts       ← typed AsyncStorage helpers: get<T>, set<T>, remove
    utils.ts         ← formatPrice(n), formatDate(d), getInitials(name), maskPhone(str), maskIBAN(str)
  hooks/
    useSession.ts    ← zustand store: { user, setUser, clearSession }
    useBlocked.ts    ← zustand store: { blockedIds, block, unblock }
    useNotifSettings.ts ← zustand store: notification toggles per channel

app/
  _layout.tsx              ← root layout, safe area, gesture handler, reanimated
  (tabs)/
    _layout.tsx            ← bottom tab navigator
    index.tsx              ← Feed
    search.tsx             ← Search
    messages.tsx           ← Inbox
    me.tsx                 ← Tenant home
  post/
    _layout.tsx
    index.tsx              ← Step 1: listing type
    photos.tsx             ← Step 2: photos
    details.tsx            ← Step 3: details + preferences
    review.tsx             ← Step 4: review + publish
  listing/
    [id].tsx               ← Listing detail
  messages/
    [threadId].tsx         ← Chat thread
  me/
    listings.tsx
    saved.tsx
    settings.tsx
    settings/
      notifications.tsx
      blocked.tsx
  landlord/
    _layout.tsx
    index.tsx              ← Overview
    properties.tsx
    tenants.tsx
    maintenance.tsx
    payments.tsx
  auth/
    login.tsx
    signup.tsx
    verify/
      phone.tsx
      email.tsx
      landlord.tsx
```

**3. Bottom tab navigator (`app/(tabs)/_layout.tsx`):**
Five tabs: Feed · Search · Post (center) · Messages · Me.

- Tab bar: `BlurView` with `intensity={80}` and `tint="light"`, absolute positioned above safe-area bottom inset.
- Feed icon: house outline / filled
- Search: magnifier outline / filled
- Post: `expo-linear-gradient` with `gradients.coral`, 56×56 rounded-20, "+" at 28px white, no label, raised 8px above tab bar surface with `shadows.coral`
- Messages icon: chat bubble outline / filled. Unread badge on icon.
- Me icon: person outline / filled

Hide the tab bar completely on: `listing/[id]`, `messages/[threadId]`, `post/*`, `auth/*`, `landlord/*`.

**4. Root layout (`app/_layout.tsx`):**
- Wrap in `GestureHandlerRootView`, `SafeAreaProvider`
- Configure Reanimated
- Set status bar to dark-content
- On mount: fire `track('app_opened')` from `src/lib/analytics.ts`
- Font: no custom font loading. SF Pro is system default.

**5. Mock data requirements:**
- `listings.ts`: 10 listings. Include at least: 3 owner-occupier with preferences set (including gender and language tags), 3 landlord listings (1 with RPZ badge, 1 with BER B2), 2 housemate listings, 2 expired/expiring listings. Use local placeholder images from `src/assets/photos/` — include 6 colored rect placeholder PNGs (can be generated with `expo-image` backgroundColor).
- `users.ts`: 8 users. Mix of verification levels. Include: 1 landlord user with 3 properties, 1 owner-occupier verified, 3 contact-verified only, 1 admin. Ensure mock session user is stored too.
- `conversations.ts`: 5 conversations. At least 1 with a maintenance card message, 1 with a viewing request card, 1 with a confirmed viewing. All with realistic WhatsApp-style message history.

**6. Analytics (`src/lib/analytics.ts`):**
```ts
import PostHog from 'posthog-react-native'

const client = new PostHog('YOUR_POSTHOG_KEY', {
  host: 'https://eu.posthog.com'
})

type EventName =
  | 'app_opened'
  | 'feed_scrolled'
  | 'story_tapped'
  | 'listing_viewed'
  | 'listing_saved'
  | 'message_sent'
  | 'listing_posted'
  | 'post_started'
  | 'post_step_completed'
  | 'post_listing_type_chosen'
  | 'post_abandoned'
  | 'viewing_requested'
  | 'viewing_confirmed'
  | 'maintenance_raised'
  | 'user_blocked'
  | 'user_reported'
  | 'scam_warning_shown'
  | 'scam_warning_proceeded'
  | 'signup_completed'
  | 'phone_verified'
  | 'email_verified'
  | 'saved_search_created'
  | 'landlord_verification_completed'

export function track(event: EventName, properties?: Record<string, unknown>) {
  client.capture(event, properties)
}
```

**Verification before commit:**
- `npx expo start` boots without errors
- Expo Go on iPhone shows all 4 tabs
- Post button is raised, coral gradient, center
- Tab bar blurs content behind it
- PostHog `app_opened` fires (check PostHog dashboard)
- All type imports resolve with no errors
- No `any`, no `console.log`

**Commit:** `chore: scaffold expo app with design tokens, routing, and mock data`

---

## SESSION 2 — Feed Surface

**Goal:** Build the social feed at `(tabs)/index.tsx` — Stories row, filter chips, listing cards, and bounded pagination.

**End state:** Scrollable feed with mock data, stories, filters, empty states, and skeleton loaders.

---

Session 2 of 7. The feed scaffold exists. Now build the social feed — the heart of HomLiv.

**Critical context:** The Feed Surface has relaxed design rules. Coral appears on multiple elements per card. Gap between cards is 12. Stories ring uses `gradients.ring`. All other surfaces stay strict.

**1. Build `src/components/feed/StoriesRow.tsx`:**

Horizontal `FlashList` (horizontal: true). Each story item:
- 68×68 rounded-20 container
- Border: animated `LinearGradient` ring (`gradients.ring`) for unseen, `colors.ghost` at 40% opacity for seen
- Inner image: `expo-image` with the listing's first photo, border radius 16, border 2.5 white
- Price chip overlaid at bottom: `colors.jet` at 80% opacity, blur, white text, 9px bold SF Pro
- Story name below (10px, `colors.slateBrand`)
- Tap → `router.push('/listing/' + id)` + `track('story_tapped', { listingId })`
- Animate unseen → seen ring on tap using Reanimated `withTiming`

Scroll container: `ScrollView` horizontal, `showsHorizontalScrollIndicator={false}`, `paddingHorizontal: 16`, `gap: 12`.
Section label above: "🔥 Last 24 hours near you" — `colors.slateBrand`, `typography.labelMd`.

**2. Build `src/components/feed/FilterChips.tsx`:**

Horizontal `ScrollView`, `showsHorizontalScrollIndicator={false}`.

Chips: All · Rooms 🛏️ · Apartments 🏢 · Houses 🏡 · South Asian 🌶️ · Female only 👩 · Veg-friendly 🥦 · Students 🎓 · Pets OK 🐾 · Quiet home 🤫

Active chip: `backgroundColor: colors.ink`, `color: colors.surface`, `borderRadius: 20`, `paddingHorizontal: 14`, `paddingVertical: 7`.
Inactive: `backgroundColor: colors.surface`, `borderColor: colors.ghost`, `borderWidth: 1.5`, `color: colors.ink`.
Font: `typography.bodySm`, `fontWeight: '500'`.
Active state managed via `useState`. On tap: `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`.

**3. Build `src/components/feed/ListingCard.tsx`:**

White card, `borderRadius: 24`, `backgroundColor: colors.surface`, `...shadows.card`.
On press-in: scale to 0.98 with Reanimated `withSpring`. On press-out: scale back.
Card press → `router.push('/listing/' + id)`.

Structure:
```
┌─────────────────────────────┐
│  IMAGE AREA (height: 220)   │  ← borderRadius 20, margin 10, overflow hidden
│  [Badges top-left]          │  ← verification badge + "2h ago" badge
│  [Save heart top-right]     │  ← white circle 36×36, shadow
│  [Price bottom-left]        │  ← white text, priceLg font, text shadow
└─────────────────────────────┘
  BODY (padding 14 16 16)
  ┌ Poster row ─────────────────┐
  │ Avatar (32×32 rounded-10)   │
  │ Name + posted-time          │
  │ [Message] button →          │  ← coral gradient, rounded-14, 12px bold
  └─────────────────────────────┘
  Title (titleSm)
  Location (bodySm, slateBrand) 📍
  Tags row (scrollable chips)
  ─────────────────────────────
  Action row:
  ❤️ count  💬 count  ↗  |  View details →
```

Tags: small rounded-8 chips. Community/preference tags use `colors.greenBg` text `colors.green`. Bills/expiry use `colors.amberBg` text `colors.amber`.

Save heart: filled coral if saved, outline if not. Toggle with `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)`. Track `listing_saved`.

Message button: `LinearGradient` with `gradients.coral`, rounded-14, text white, bold 12px. Tap → open conversation or new thread.

Verification badge per level:
- `landlord`: green pill "✓ Verified landlord"
- `homeowner`: green pill "✓ Verified homeowner"
- `contact`: amber pill "Contact-verified" (NOT "Verified" — trust language matters)
- `none`: slate pill "Unverified poster"

"Posted N ago" badge: jet/80% opacity, blur, white text.

**4. Build `src/components/feed/ListingCardSkeleton.tsx`:**

Same dimensions as `ListingCard`. Use Reanimated `withRepeat` + `withTiming` to pulse between `colors.surfaceLow` and `colors.ghost/30`. Show 3 skeleton cards during loading state.

**5. Build `app/(tabs)/index.tsx` — Feed:**

```tsx
<SafeAreaView>
  <Header />           {/* logo + bell + search icon */}
  <FlashList
    data={filtered}
    renderItem={({ item }) => <ListingCard listing={item} />}
    estimatedItemSize={380}
    ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
    ListHeaderComponent={
      <>
        <StoriesRow />
        <FilterChips />
        <SectionHeader />
        {showDivider && <DividerRow text="Verified landlords" />}
      </>
    }
    ListEmptyComponent={<FeedEmptyState />}
    onEndReached={loadMore}
    onEndReachedThreshold={0.3}
    onScroll={debounce(() => track('feed_scrolled'), 2000)}
  />
</SafeAreaView>
```

Show 8 listings initially, load 8 more on end reached. Show "Showing 8 of 24" counter below first batch.

**6. Feed empty state (`src/components/feed/FeedEmptyState.tsx`):**

Large house icon from `@expo/vector-icons/Ionicons` in `colors.slateBrand` at 30% opacity, size 72.
Heading: "No listings here yet" (`typography.titleMd`, `colors.jet`).
Body: "Try adjusting your filters or check back tomorrow for new listings." (`typography.bodyMd`, `colors.slateBrand`).
CTA: "Clear filters" — ghost button, border `colors.ghost`, text `colors.coral`.

**7. Header (`src/components/layout/FeedHeader.tsx`):**

Height 56. `colors.surface/94` with `BlurView intensity={60}`. Logo left ("Hom" ink + "Liv" coral, `typography.titleLg`). Right: bell icon (with red dot if unread notifs) + search icon. Both 38×38 rounded-12 `colors.surfaceLow`.

**8. Wire analytics:** `feed_scrolled` (debounced 2s), `story_tapped`, `listing_viewed` (on card press), `listing_saved`.

**Verification before commit:**
- Feed scrolls smoothly at 60fps (no jank)
- Stories row shows 5+ stories scrolling horizontally
- Tapping a filter chip filters listing types
- Skeleton shows briefly on first load
- Empty state appears when all filters yield no results
- Save heart toggles with haptic
- PostHog events firing

**Commit:** `feat: social feed with stories, filter chips, listing cards, and skeletons`

---

## SESSION 3 — Listing Detail + Post Wizard

**Goal:** `/listing/[id]` detail screen and the 4-step `/post` wizard with legal type chooser, photo upload, details form, and conditional preferences.

---

Session 3 of 7. Feed done. Build the listing detail screen and the full post wizard.

**Critical context:** The post wizard step 1 is the legal moat — the thing Daft can't copy. Owner-occupier toggle unlocks gender/lifestyle preferences. Selection drives different verification gates in step 4.

**1. Build `app/listing/[id].tsx`:**

Full-screen modal-style push screen (stack presentation). No tab bar.

Layout:
```
ScrollView (bounces, no padding-top):
  ├── Photo gallery (height 300, full-bleed)
  │     ExpoImage pager (horizontal scroll, 3-4 photos)
  │     Back chevron top-left (safe-area aware, white circle)
  │     Save + Share top-right (white circles)
  │     Photo counter "2/4" top-right
  │     Price overlay bottom-left (priceLg, white, text shadow)
  │     Gradient overlay bottom half
  ├── Content (padding 20)
  │     Title (displayMd, jet, letterSpacing -0.03)
  │     Location row (📍 slateBrand bodySm)
  │     [Verified badge] + [Posted time]
  │     ─ Specs row (4 cells: Rooms · Baths · BER · Type) ──
  │     Description (bodyLg, ink)
  │     Tags section
  │     Community/preference tags (if owner_occupier listing)
  │     Amenities chips
  │     ─ Poster card ──────────────────────────────────────
  │     │ Avatar + Name + Verification badge               │
  │     │ "Member since" + response time                   │
  │     └──────────────────────────────────────────────────┘
  │     Report listing (text button, slateBrand, bodySm)
  └── Bottom padding (120px for sticky CTA)

Sticky CTA (absolute bottom, safe-area inset):
  BlurView + LinearGradient coral button "💬 Message [Name]"
```

Spec cells: white card `borderRadius: 14`, `shadows.card`, icon + value (titleSm, jet) + key (labelSm, slateBrand).

Poster card: white card `borderRadius: 18`, `padding: 14`, `shadows.card`. Avatar 46×46 `borderRadius: 14` with gradient. Tap avatar → public profile (placeholder for now).

Sticky message CTA: `LinearGradient` coral, full-width minus 32px margin, `borderRadius: 18`, height 56, "💬 Message Priya →" bold 15px white. Tap → `router.push('/messages/[id]?listingId=X&recipientId=Y')`.

**2. Build `app/post/_layout.tsx`:**

Stack navigator. All post screens share a persistent header: close (✕) button left + step title center + "Next →" or "Publish" right. Progress bar below header (3px coral gradient, animated width). Step dots below progress bar: 4 dots, active = coral pill 24×8, done = mint 8×8, pending = ghost 8×8.

**3. Build `app/post/index.tsx` — Step 1: Listing type:**

Title: "What are you listing?" (`typography.displayMd`)
Subtitle: "This keeps listings legally correct for Ireland." (`typography.bodyMd`, `colors.slateBrand`)

Three selection cards:
```
Card:
  borderRadius: 20
  borderWidth: 2
  borderColor: selected ? colors.coral : colors.ghost/40
  backgroundColor: selected ? coral/4% : colors.surface
  padding: 18
  
  Row: [icon 28px]  ...  [radio circle 22×22]
  Type name (titleMd, jet)
  Description (bodySm, slateBrand, marginTop: 4)
  Legal note (conditionally shown when selected):
    backgroundColor: colors.greenBg
    borderRadius: 10
    padding: 10
    text: bodySm, colors.green
```

Owner-occupier legal note: "✅ You can set gender and lifestyle preferences — protected under Equal Status Acts Section 6(2)(d) for owner-occupiers sharing their home."

Landlord legal note: "⚠️ Preferences based on gender, nationality, or religion cannot be applied — Equal Status Acts apply in full."

Radio circle: empty when unselected, coral fill + white ✓ when selected. Animate with Reanimated `withSpring`.

Selection stored in Zustand `usePostDraft` store (persist across steps): `{ listingType, photos, details, preferences }`.

Track: `post_started` (first time user opens /post), `post_listing_type_chosen` (with type).

**4. Build `app/post/photos.tsx` — Step 2: Photos:**

Title: "Add photos" sub: "First photo is your cover. Add up to 6."

Photo grid: 2-column, first cell `aspectRatio: 16/9` full-width. Remaining 2-up.
- Filled cell: `expo-image` thumbnail, `borderRadius: 16`, delete button top-right (red circle ✕)
- Empty cell: dashed border `colors.ghost`, `borderRadius: 16`, 📷 icon + "Add photo" (slateBrand)
- Tap empty cell → `expo-image-picker` ImagePicker.launchImageLibraryAsync with mediaTypes Images
- Main photo (first): "Cover photo" badge bottom-left
- Long-press a filled cell → drag to reorder (use React Native Reanimated drag-and-drop pattern)

Minimum 1 photo required to proceed. "Next" button disabled with opacity 0.4 until at least 1 photo.

**5. Build `app/post/details.tsx` — Step 3: Details + Preferences:**

All inputs use consistent style:
```
backgroundColor: colors.surfaceLow
borderRadius: 14
paddingHorizontal: 16
paddingVertical: 13
fontSize: 15
color: colors.ink
```
Focus state: add `borderWidth: 1.5`, `borderColor: colors.coral` — use Reanimated for smooth transition.

Fields:
- Title (text, required)
- Rent per month (numeric keyboard, €prefix)
- Bills: segmented control "Included / Excluded / To discuss"
- Eircode or area (text, required)
- Move-in date: two options — toggle "Available immediately" OR date picker calendar sheet
- Description (multiline, min 100 chars, char counter shown, required)

**Conditional section — only rendered if `listingType === 'owner_occupier'`:**

```
Green container:
  backgroundColor: colors.greenBg
  borderRadius: 16
  borderWidth: 1
  borderColor: colors.green/20
  padding: 16

Header: "🏠 Home preferences"
  Badge: "Owner-occupier only" — green small pill
Sub: "These are legally allowed because you live here. Help the right housemate find you."

Fields (multi-select tags or segmented controls):
  Languages spoken: multi-select tag grid
    Options: Malayalam · Hindi · Polish · Portuguese · Spanish · Mandarin
             Arabic · English · Tamil · Telugu · Bengali · Urdu
             Romanian · Lithuanian · French · Italian
    Each tag: rounded-12, inactive ghost border, active ink bg white text

  Diet: single select — Vegetarian-friendly · Vegan-friendly · Halal kitchen · No restriction
  Household vibe: Quiet/professional · Social · Mixed
  Work pattern: Standard hours · Night shifts welcome · Remote-friendly
  Pets: Cats · Dogs · No pets · Pets welcome
  Smoking: Inside · Outside only · None
  Gender preference (optional): Female only · Male only · No preference
    Show info tooltip: (ℹ️) "Legal under Equal Status Acts for owner-occupiers sharing their home"
```

All preferences optional except description. Store in `usePostDraft`.

**6. Build `app/post/review.tsx` — Step 4: Review & Publish:**

Read-only summary: photo strip (horizontal scroll, small), all fields displayed, preferences shown if applicable.

Verification gate:
```
if listingType === 'owner_occupier' || 'housemate':
  if not phone-verified: show "Verify your phone to publish" → /auth/verify/phone
  if not email-verified: show "Verify your email to publish" → /auth/verify/email
  if both done: show "Publish" CTA

if listingType === 'landlord':
  if verification < 'landlord': show "Complete landlord verification to publish"
    sub: "Required for RTB compliance. Your listing saves as a draft."
    CTA → /auth/verify/landlord
  if verified: show "Publish" CTA
```

"Publish" CTA: full-width `LinearGradient` coral, height 56, `borderRadius: 18`, bold white. Tap → optimistic add to mock feed, `track('listing_posted')`, `router.replace('/')` with success toast.

Close button (✕) anywhere in wizard → confirm modal "Discard listing?" with "Discard" (red) / "Save draft" / "Keep editing". Track `post_abandoned` on discard.

**Verification before commit:**
- Listing detail screen renders any of the 10 mock listings
- Back chevron works, safe-area safe
- Sticky message CTA visible above iPhone home indicator
- Post wizard navigates forward/backward, state persists across steps
- Home preferences section only appears for owner-occupier
- Legal notes appear on card selection
- Verification gate blocks landlord listings correctly
- Photo picker opens and shows thumbnails

**Commit:** `feat: listing detail and 4-step post wizard with legal type chooser`

---

## SESSION 4 — Unified Chat

**Goal:** Full messaging surface — inbox, threads, inline maintenance cards, inline viewing scheduler, anti-scam protection.

**This is the most complex session. Block 8-10 hours. Do not split it.**

---

Session 4 of 7. The most important session. Build the unified chat — home for all communication, maintenance, and viewings.

**Critical context:** Maintenance requests and viewing schedulers are structured message types that render as cards inline in the message thread. Not separate screens. The thread IS the product.

**1. Build `app/(tabs)/messages.tsx` — Inbox:**

`FlashList` of conversation rows:
```
Row (height 76, paddingHorizontal 16):
  Avatar 48×48 borderRadius 14
  Content:
    Row: Name (titleSm, jet) + timestamp (labelSm, slateBrand) right-aligned
    Preview: last message text OR icon + type label for structured msgs
      maintenance → "🔧 Maintenance request"
      viewing_request → "📅 Viewing request"
      viewing_confirmed → "✅ Viewing confirmed"
  Unread badge: coral gradient circle, white count, labelSm
  Online dot: 8×8 green circle on avatar bottom-right if isOnline
```

Empty state: chat-bubble icon, "No conversations yet", "Start by messaging a listing" (slateBrand), "Browse listings" coral link.

**2. Build `app/messages/[threadId].tsx` — Thread:**

Full-screen. No tab bar.

```
SafeAreaView (flex: 1, backgroundColor: surfaceLow):
  ChatHeader (sticky)
  ListingPin (sticky below header, if listing context)
  FlashList messages (flex: 1, inverted: true)
  ComposerBar (sticky bottom)
```

**ChatHeader:**
Back chevron + Avatar 40×40 rounded-13 + Name (titleSm) + status (online/last seen, green/slateBrand labelSm) + phone icon + "⋯" more menu.
More menu (ActionSheet via `@expo/vector-icons` + modal): Block user · Report user · Mute · View profile.
`BlurView intensity={80}` background.

**ListingPin:**
```
Pressable (router.push to listing):
  backgroundColor: colors.surface
  borderBottomWidth: 1, borderColor: colors.ghost/20
  padding: 12, flexDirection: row, gap: 12
  
  Thumb: 56×56, borderRadius: 12, expo-image
  Info:
    Title (titleSm, jet)
    Price (bodySm, coral, bold)
    Location (labelSm, slateBrand)
  › chevron (slateBrand)
```

**Message bubbles:**
```
Outgoing (right):
  backgroundColor: colors.jet
  color: white
  borderRadius: 18, borderBottomRightRadius: 4
  maxWidth: '72%'
  padding: 10 14
  alignSelf: 'flex-end'
  timestamp: labelSm white/60 right-aligned below

Incoming (left):
  backgroundColor: colors.surface
  borderWidth: 1, borderColor: colors.ghost/15
  color: colors.ink
  borderRadius: 18, borderBottomLeftRadius: 4
  maxWidth: '72%'
  alignSelf: 'flex-start'
  timestamp: labelSm slateBrand
```

Date separator between message groups: centered labelSm slateBrand "Today" / "Yesterday" / date.

**Maintenance card (inline):**
```
Container:
  backgroundColor: colors.amberBg
  borderWidth: 1.5, borderColor: colors.amber/40
  borderRadius: 16, padding: 14
  margin: 4 0

Header row:
  🔧 icon + title (titleSm, jet) + status badge right
  Status badge: OPEN=amber · IN PROGRESS=amber · RESOLVED=green

Description: bodySm ink
Photos: horizontal thumbnail row (56×56, borderRadius 10, gap 6)
Footer (landlord only):
  Two buttons equal width:
  "✓ Acknowledge" → backgroundColor greenBg, color green, borderRadius 10
  "View photos" → backgroundColor surfaceLow, color jet, border ghost/40

Tenant sees status updates as a centered system message
```

**Viewing request card (inline):**
```
Container:
  backgroundColor: colors.surfaceLow
  borderWidth: 1, borderColor: colors.ghost/40
  borderRadius: 16, padding: 14

Header: 📅 + "Viewing request" (titleSm, jet)
Slots: 3 pressable slot buttons
  Unconfirmed (landlord view): borderWidth 1.5 ghost/40, text jet, borderRadius 10
  Confirmed: backgroundColor greenBg, borderColor green/30, text green bold
  Tap a slot (landlord) → animate to confirmed, insert "Viewing confirmed for [slot]" status message

Viewing confirmed card (both parties):
  backgroundColor: colors.greenBg
  borderColor: colors.green/30
  "✅ Viewing confirmed · Sat 10 May, 2pm"
  "📍 [property address]"
  "Add to Calendar" link (expo-calendar, optional)
```

**First-message banner:**
Shown once per new conversation. Dismissible per thread (store dismissed state in AsyncStorage).
```
backgroundColor: colors.amberBg
borderRadius: 12, padding: 12, margin: 8 16
icon 🛡️ + "Never send a deposit before viewing the property in person." (bodySm, amber)
"×" dismiss button
```

**Composer bar:**
```
BlurView intensity={80}, borderTopWidth 1 ghost/20, paddingBottom safe-area
Row: gap 10, padding 12 16

"+" button (38×38, surfaceLow, borderRadius 12):
  Tap → AttachmentSheet slides up

TextInput:
  flex: 1
  backgroundColor: colors.surfaceLow
  borderRadius: 20
  paddingHorizontal: 16, paddingVertical: 11
  fontSize: 15, color: colors.ink
  multiline: true, maxHeight: 120

Send button (42×42):
  LinearGradient coral, borderRadius 14
  ↑ icon white
  Disabled (no text) → backgroundColor ghost/40
```

**Attachment sheet (bottom sheet modal, `@gorhom/bottom-sheet`):**
```
5 options (tappable rows, 56px height each):
  📷  Photo
  📅  Request a viewing   (tenant, if has active listing context)
  🔧  Report maintenance  (tenant only, if active tenancy with this landlord)
  📍  Share location
  📄  Send document
```

**3. Viewing scheduler modal:**
Opens from attachment sheet. Full-screen modal (stack).
- 3 date pickers (DateTimePicker, iOS wheel style, min: today+1)
- Time slot buttons for each: 10am · 2pm · 6pm · 8pm
- Optional note field
- "Send request" → inserts `viewing_request` message card into thread, dismisses modal
- Track `viewing_requested`

**4. Maintenance request modal:**
Opens from attachment sheet. Full-screen modal.
- Category: segmented/picker — Plumbing · Electrical · Heating · Appliance · Lock & Security · Other
- Priority: 3 radio cards — Low (green dot) · Medium (amber dot) · High (red dot). Priority dot colors use semantic status colors.
- Description: multiline text input, min 50 chars
- Photos: up to 3, same component as post wizard
- "Send request" → inserts `maintenance` message card into thread, track `maintenance_raised`

**5. Anti-scam detection:**
In `ComposerBar`, before sending:
```ts
const irishPhone = /(\+353|0)\s?[1-9]\d{1,2}\s?\d{3}\s?\d{3,4}/
const irishIBAN = /IE\d{2}[A-Z]{4}\d{14}/

if (irishPhone.test(text) || irishIBAN.test(text)) {
  // Show warning modal before sending
  track('scam_warning_shown')
}
```
Warning modal: title "⚠️ Sharing contact details", body "Sharing phone numbers or bank details outside HomLiv removes scam protection. Scammers often ask for deposits without viewings.", "Send anyway" (red) / "Cancel" (coral gradient). Track `scam_warning_proceeded` on confirm.

**6. Block user flow:**
Confirm modal → on confirm:
- Add userId to `useBlocked` store (persisted in AsyncStorage)
- Prepend thread with status message "You blocked this user"
- Disable composer, show "Unblock to send messages" message
- Track `user_blocked`

**7. Report user modal:**
Reasons: Spam · Scam attempt · Harassment · Fake listing · Other.
Description field (optional).
Submit → store in `data/reports.ts`, show "Report submitted. We'll review within 24 hours." toast.
Track `user_reported`.

**Verification before commit:**
- Inbox shows 5 mock conversations with correct previews
- Thread opens with full message history, listing pin visible
- Maintenance card renders with correct status badge
- Viewing request card shows slots, tapping a slot confirms it
- First-message banner shows on first open, dismisses and stays dismissed
- Typing phone number triggers scam warning
- "+" menu opens bottom sheet, all options present
- Block flow disables composer

**Commit:** `feat: unified chat with inline maintenance, viewings, anti-scam, and block`

---

## SESSION 5 — Tenant Home + Saved Searches

**Goal:** Build `/me` profile home replacing dashboards. Saved searches, My Listings with expiry states, Settings.

---

Session 5 of 7. Build the unified Me tab that replaces all separate tenant and roommate dashboards.

**1. Build `app/(tabs)/me.tsx` — Tenant Home:**

```
ScrollView (contentContainerStyle paddingBottom: 100):
  ProfileHeader
  [MyTenancy section — only if user has tenancyId]
  MyListingsPreview
  SavedPropertiesPreview
  SavedSearches
  [MaintenanceSection — only if open maintenance tickets]
  SettingsLink
```

**ProfileHeader:**
```
Gradient background strip (height 120, gradients.slate):
  Avatar (72×72, borderRadius 20, border 3 white, shadow)
  Name (titleLg, white)
  Location (bodySm, white/70)
  "Edit profile" link (labelMd, white/60)
  Verification badges row: pill badges for earned levels only
    contact-verified: amber  |  homeowner: green  |  landlord: green
```

**MyTenancy card (only if tenancyId present):**
White card `borderRadius: 20`, `shadows.dashboard`, `padding: 16`.
Left: property thumbnail 72×72 `borderRadius: 14`. Right: address (titleSm), rent/mo (price, coral), lease dates (bodySm, slateBrand), landlord name + "Message" inline link.

**Section pattern (reuse for all preview sections):**
```
SectionHeader:
  Left: title (titleMd, jet)
  Right: "View all →" (labelMd, coral)

Content: 2 listing cards side-by-side (smaller ListingCard variant, no action row)
          OR empty state
```

**Empty states for each section:** Icon + heading + body + CTA. Designed, not placeholder.
- My listings empty: "Nothing listed yet" → "Post your first listing"
- Saved empty: "No saved listings" → "Browse the feed"
- Saved searches empty: "No saved searches" → "Try a search and save it"

**SavedSearches section:**
Vertical list of `SavedSearch` items:
```
Row (padding 12, borderRadius 14, backgroundColor surfaceLow):
  Icon 🔍 (surfaceLow icon container, slateBrand icon)
  Name (titleSm, jet) + criteria tags (labelSm, slateBrand)
  New results badge (coral gradient, white count) if > 0
  → chevron
```
Tap row → navigate to feed with filters applied (via router push with query params).

**2. Build `app/me/listings.tsx`:**

Full-screen. FlashList of user's listings. Each card same as feed card but with action bar below:
```
Action bar (paddingTop 10, borderTop ghost/20):
  "Edit" · "Pause" · "Delete" · "Boost"
  All text buttons: labelMd
  Delete: red500 text, confirm modal before action
```

Expiry badge on card image (bottom-right):
- Green "Active · 12d left" if > 7 days remaining
- Amber "Expires in 3d · Bump?" if ≤ 7 days, with tap opening renew modal
- Grey "Expired · Renew" if past expiry

**3. Build `app/me/saved.tsx`:**

FlashList feed grid of saved listings. Same `ListingCard` as feed. "Unsave" on heart shows confirm. "Clear all" button in header.

**4. Build `app/me/settings.tsx`:**

```
ScrollView:
  SectionHeader "Account"
    Name field + email field + phone field
    "Change password" row with › chevron
  
  SectionHeader "Verification"
    Current level shown with badge
    "Upgrade to Verified Homeowner" (if eligible)
    "Upgrade to Verified Landlord" (if eligible)
  
  SectionHeader "Preferences"
    "Notifications" row → /me/settings/notifications
    "Privacy & Blocked" row → /me/settings/blocked
  
  SectionHeader "App"
    "Rate HomLiv" row
    "Send feedback" row
    "About" row
  
  SectionHeader "Danger zone" (no top border — background shift only)
    "Delete account" — text-red500, confirm modal
```

**5. Build `app/me/settings/notifications.tsx`:**

Toggles for Push / Email / SMS, grouped by category:
New messages · New listings matching saved searches · Viewing reminders · Payment reminders · Maintenance updates · Marketing.

Each row: labelMd jet left, Switch right (`trackColor={{ true: colors.coral }}`). Persist to AsyncStorage via `useNotifSettings` Zustand store.

**6. Build `app/me/settings/blocked.tsx`:**

List of blocked users. Each row: avatar + name + "Unblock" button (ghost border, coral text). Empty state: "No blocked users". Unblock with confirm modal.

**7. Saved search — creation:**

In `app/(tabs)/search.tsx` (basic search screen): when filters are active, show "Save this search" button. Tap → sheet with name field and "Notify me" toggle. Save to `useSavedSearches` Zustand store (persisted in AsyncStorage). Track `saved_search_created`.

**Verification before commit:**
- Me tab shows profile header with correct verification badges
- Tenancy card shows only when user has tenancy
- My listings shows expiry states
- Tapping a saved search opens feed with filters
- Notification toggles persist after app restart
- Blocked users list matches block actions from session 4

**Commit:** `feat: unified /me profile with saved searches, my listings, and settings`

---

## SESSION 6 — Auth + Verification Gate

**Goal:** Single-account auth, role flags, hybrid verification. Remove PPS. Honest trust badges.

---

Session 6 of 7. Build auth and verification.

**Critical context:** One account. Role flags added as user earns them. Three verification levels with different gates. PPS number must never appear anywhere.

**1. Build `app/auth/login.tsx`:**

Full-screen. Safe-area aware.

Left 45% of screen (on iPad/landscape) OR top 35% (on iPhone portrait): dark panel `colors.jet`, `gradients.dark`. Logo at top. 3 feature bullets mid. "For Ireland's rental generation" tagline at bottom.

iPhone portrait: dark header panel (height 280) + white form below in `ScrollView`.

Form below dark panel:
- Tab switcher "Sign In / Sign Up" — pill tabs, active coral gradient
- Sign In fields: email, password (show/hide toggle)
- Sign Up fields: name, email, phone (+353 prefix), password
- Primary CTA: `LinearGradient` coral full-width
- Divider "or"
- "Continue with Apple" → placeholder toast "Coming soon"
- "Continue with Google" → placeholder toast "Coming soon"
- "Forgot password?" → placeholder toast

On sign in/up success: `useSession.setUser(mockUser)` → `router.replace('/')`.

**2. Build `app/auth/verify/phone.tsx`:**

Large phone emoji (or Ionicons phone icon, size 64, coral).
Heading "Verify your phone" (displayMd).
Sub "We sent a 6-digit code to +353 89 XXX XXXX" (bodyMd, slateBrand).

6-digit OTP input: 6 separate `TextInput` boxes (48×56, borderRadius 14, borderWidth 1.5, surfaceLow bg). Auto-advance on digit entry. Auto-submit when all 6 filled. Backspace goes back to previous box.

For mock: any 6 digits confirm. On confirm: `useSession` update verificationLevel to at least 'contact'. Track `phone_verified`.

"Resend code" after 60s countdown (gray text during countdown, coral after).

**3. Build `app/auth/verify/email.tsx`:**

Same pattern as phone. "Check your inbox" heading. Email OTP. On confirm: update session. Track `email_verified`.

**4. Build `app/auth/verify/landlord.tsx`:**

4-step wizard (same step-indicator pattern as post wizard).

Step 1 — Personal Info: name, DOB, address. **NO PPS NUMBER FIELD. Remove entirely.**
Step 2 — Property Ownership: upload utility bill or title deed (expo-document-picker or expo-image-picker). Document preview card after upload.
Step 3 — Bank Details: IBAN (IE format), account holder name. NOTE below field: "Your bank details are used to set up rent payments. No charges until you activate rent collection." Display only — no real Stripe in this build.
Step 4 — Confirmation: summary, "Submit for review" button. After submit: show "Under review — usually within 24 hours" status screen. Mock: set verificationLevel to 'landlord'. Track `landlord_verification_completed`.

**5. Verification gate in post wizard review screen (session 3 — update):**

The review screen should now import from `useSession` and check real verification levels, not mock flags.

**6. Trust badge component (`src/components/shared/VerificationBadge.tsx`):**

```ts
type BadgeProps = { level: VerificationLevel; compact?: boolean }

// Renders:
// 'none'      → "Unverified poster" — slateBrand bg, white text
// 'contact'   → "Contact-verified" — amberBg, amber text  (NOT "Verified")
// 'homeowner' → "✓ Verified homeowner" — greenBg, green text
// 'landlord'  → "✓ Verified landlord" — greenBg, green text
```

Replace all badge usage across the app with this single component.

**7. Session guard:**

`src/hooks/useRequireAuth.ts` — if no session, `router.replace('/auth/login')`. Call in: post wizard, messages thread, me tab.

Landlord routes: check `roles.includes('landlord')` else redirect to `/me` with toast "Landlord account required."

**Verification before commit:**
- Sign up → land on feed
- Post owner-occupier listing: only phone+email required
- Post landlord listing: requires full verification
- PPS field absent from landlord verification
- "Contact-verified" badge (not "Verified") shows for phone+email only users
- Session persists after app restart (AsyncStorage)

**Commit:** `feat: single-account auth with hybrid verification gate and honest trust badges`

---

## SESSION 7 — Landlord Dashboard + Polish + TestFlight

**Goal:** Mount landlord dashboard, sync maintenance to chat data, accessibility, performance, TestFlight.

---

Session 7 of 7. Final session. Polish and ship to TestFlight.

**1. Build `app/landlord/_layout.tsx` and landlord screens:**

Landlord dashboard is a separate navigation surface accessed from the Me tab → "Switch to Landlord view". Not part of the main tab navigator.

Use a custom tab bar at the top (horizontal segmented scrollable tabs) OR a sidebar-style drawer for iPad. For iPhone: custom horizontal tab scroll.

Tabs: Overview · Properties · Tenants · Maintenance · Payments · Messages

All landlord screens: full `design.md` strict rules. `colors.surfaceLow` background, white cards, `shadows.dashboard`. No Feed Surface relaxations.

**Overview tab:**
- 4 stat cards (coral gradient: Total properties · Total tenants; slate gradient: Monthly rent · Open maintenance)
- Recent activity list
- RTB compliance banner: dismissible `colors.amberBg` card at top — "📋 Ensure your tenancies are registered with the RTB. Register at rtb.ie"

**Properties tab:**
- FlashList of property cards (image + address + tenant name + rent + status badge)
- "Add property" FAB (coral gradient, bottom-right, `shadows.coral`)

**Tenants tab:**
- FlashList of tenant rows: avatar + name + property + lease dates + rent status badge + "Message" action

**Maintenance tab (sync with chat):**
- This renders the same `data/maintenance.ts` records that appear in chat threads
- Table-style rows: Property · Tenant · Category · Priority dot · Status badge · Days open · Actions
- "Open chat" → `router.push('/messages/[conversationId]')` — navigates to the thread containing that maintenance card
- Updating status here: update the record in `data/maintenance.ts` mock store → the same card in the chat thread reflects the update (same Zustand store or React context)

**Payments tab:**
- Banner at top: `colors.amberBg`, text: "📋 Manual ledger — payments recorded for tracking. Online rent collection coming soon."
- Rent tracker cards: tenant name + property + amount + due date + status (Paid green / Overdue red / Pending amber)
- "Mark as paid" button with tooltip: "This records the payment for your records. No money moves through HomLiv yet."
- Payment history accordion below

**Messages tab:**
- Identical to the main messages inbox but filtered to conversations where user is the landlord party
- Reuse `ConversationRow` component

**2. Welcome/marketing screen for logged-out state:**

When `useSession` has no user and user tries to open the app, show an onboarding flow (not a full marketing page — this is native):

Screen 1: Full-screen gradient (`gradients.dark`), logo, tagline, floating property card preview. "Get started" + "Sign in" buttons.
Screen 2: "Find your room in Ireland" — 3 feature highlights with icons.
Screen 3: "Own a property?" — landlord pitch, 3 features.
"Start browsing" CTA on screen 3 → sign up.

Horizontal page scroll between screens. Dot indicator at bottom. Skip button top-right.

**3. Accessibility pass:**

- All interactive elements: `accessibilityLabel`, `accessibilityRole`, `accessibilityHint`
- Icon-only buttons: `accessibilityLabel` required (heart save = "Save listing", send = "Send message", etc.)
- All images: `alt` prop on `expo-image`
- Dynamic Type: use `allowFontScaling={true}` on all `Text` components. Test at iPhone Accessibility → Display & Text Size → Larger Text at maximum.
- VoiceOver test: navigate feed, open a listing, send a message using VoiceOver only. Fix any traps.
- Color contrast: verify `colors.slateBrand` text on `colors.surface` meets 4.5:1 (it does — verify with contrast checker).
- Touch targets: minimum 44×44 for all interactive elements. Audit every icon button.

**4. Performance pass:**

- `FlashList` `estimatedItemSize` should be measured and set correctly for feed and inbox
- All images use `expo-image` with `contentFit: 'cover'` and `cachePolicy: 'memory-disk'`
- Heavy screens (chat thread, listing detail): add `React.memo` on expensive child components
- Animations: confirm all Reanimated animations run on UI thread (no JS thread animations)
- App launch: target < 2s cold start. Profile with Flipper or Expo Dev Tools.

**5. Update CLAUDE.md:**

```md
# HomLiv React Native — CLAUDE.md

## Before you change anything
1. Read src/constants/colors.ts — use ONLY these tokens
2. Read the Feed Surface rules in this file — different rules apply on feed vs other surfaces
3. No raw hex values in components
4. No Animated API — use Reanimated only
5. No FlatList — use FlashList only
6. No console.log in committed code
7. The PPS number field must NEVER be added to any form
8. Trust badges: 'contact' level = "Contact-verified" (amber). Never "Verified" for this level.
9. Legal note: owner_occupier listing type unlocks gender/lifestyle preferences (Equal Status Acts s.6(2)(d))
   landlord listing type must NEVER show those fields

## Route map
(tabs)/index     Feed
(tabs)/messages  Inbox
(tabs)/me        Profile/tenant home
listing/[id]     Listing detail
messages/[id]    Chat thread
post/*           Post wizard (4 steps)
landlord/*       Landlord dashboard (role-gated)
auth/*           Auth + verification

## Feed Surface relaxed rules
Only applies in (tabs)/index and anywhere ListingCard renders:
- gap: 12 between cards (not 24)
- Coral can appear on multiple card elements
- StoriesRow ring uses gradients.ring

## Design tokens
All in src/constants/. Import from there. Never write hex.
```

**6. TestFlight deployment:**

```bash
# Install EAS CLI
npm install -g eas-cli
eas login

# Configure build
eas build:configure
# Select iOS, managed workflow

# Build for TestFlight
eas build --platform ios --profile preview

# Submit to TestFlight
eas submit --platform ios
```

Before building:
- Set real bundle ID in `app.json`: `"bundleIdentifier": "ie.homliv.app"`
- Set display name: `"name": "HomLiv"`
- App icon: 1024×1024 PNG in `assets/icon.png` — use coral gradient background with white house + H mark
- Splash screen: `colors.surface` background, centered logo mark, `assets/splash.png`

**7. Testing script (`TESTING.md`):**

```md
# HomLiv User Testing Script — v1

## Setup
Install HomLiv from TestFlight (link provided).
Allow notifications when prompted.

## 5 tasks (10 minutes total)

**Task 1 (2min):** Browse the feed. Find a room in Maynooth under €600/month.
→ We're watching: how long to first story tap, first card tap, first filter use

**Task 2 (1min):** Save 2 listings you like.
→ We're watching: did they find the heart, did they know it saved

**Task 3 (2min):** Message the person who posted the first listing you liked.
→ We're watching: time to first message sent (target: under 5 min from app open)

**Task 4 (3min):** Post a room listing in your current house (pick "A room in my own home").
→ We're watching: time to post, did they complete preferences, where did they drop off

**Task 5 (2min):** Request a viewing for a listing you like.
→ We're watching: did they find the + button, did the viewing card make sense

## After tasks
3 questions:
1. What would make you use this instead of a WhatsApp group? (open)
2. Did anything confuse you? (open)
3. On a scale of 1-10, how likely would you be to use this to find/post a room in Ireland?
```

**Final verification before merge:**
- TestFlight build installs and opens on real iPhone
- All 5 testing tasks completable end-to-end
- PostHog shows events from your test session
- CLAUDE.md updated and accurate
- No `any` types, no `console.log` in committed code
- VoiceOver: feed and chat navigable
- Cold start under 2 seconds

**Commit:** `feat: landlord dashboard, accessibility, performance, testflight deployment`

---

## After the app ships — what comes next

In order:

1. **Backend (Supabase)** — auth, listings, real-time chat
2. **Push notifications** — Expo Notifications + Supabase webhooks
3. **Stripe Identity** — upgrade roommate verification
4. **Stripe / SEPA** — rent collection replacing manual ledger
5. **Android build** — same codebase, `eas build --platform android`
6. **Web (Next.js)** — shared types and business logic, separate UI layer
7. **App Store submission** (after user testing validates product)

---

## Shared code with the web build

When you build the Next.js web version later, extract these to a shared package:

```
packages/
  core/
    types/index.ts         ← identical to native types
    data/                  ← identical mock data
    lib/analytics.ts       ← same event names
    lib/utils.ts           ← formatPrice, formatDate (no DOM/RN deps)
    constants/colors.ts    ← same hex values
    constants/typography.ts ← scale values only (no RN-specific props)
```

Components do NOT share — RN uses `View/Text/Pressable`, web uses `div/p/button`. Business logic shares. UI does not.
