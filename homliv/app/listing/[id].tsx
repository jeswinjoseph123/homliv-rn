import { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Share,
  NativeScrollEvent,
  NativeSyntheticEvent,
  useWindowDimensions,
} from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, gradients } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'
import { shadows } from '../../src/constants/shadows'
import { mockListings } from '../../src/data/listings'
import { mockUsers, mockSessionUser } from '../../src/data/users'
import { mockConversations } from '../../src/data/conversations'
import { VerificationBadge } from '../../src/components/shared/VerificationBadge'
import { useSaved } from '../../src/hooks/useSaved'
import { track } from '../../src/lib/analytics'

const GALLERY_HEIGHT = 300

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return `${diffDays} days ago`
}

function formatMoveIn(date: Date | 'immediate'): string {
  if (date === 'immediate') return 'Immediately'
  return date.toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })
}

const ROOM_TYPE_LABEL: Record<string, string> = {
  single: 'Single',
  double: 'Double',
  shared: 'Shared',
  whole_property: 'Whole',
}

const LISTING_TYPE_LABEL: Record<string, string> = {
  owner_occupier: 'Owner-occ',
  housemate: 'Housemate',
  landlord: 'Landlord',
}

const PREF_GENDER_LABEL: Record<string, string> = {
  female: '👩 Female only',
  male: '👨 Male only',
  no_preference: '👥 Any gender',
}

const PREF_DIET_LABEL: Record<string, string> = {
  vegetarian: '🥗 Vegetarian-friendly',
  vegan: '🌱 Vegan-friendly',
  halal: '☪️ Halal kitchen',
  none: '🍽 No diet restriction',
}

const PREF_VIBE_LABEL: Record<string, string> = {
  quiet: '🤫 Quiet household',
  social: '🎉 Social',
  mixed: '🔀 Mixed vibe',
}

const PREF_WORK_LABEL: Record<string, string> = {
  standard: '💼 Standard hours',
  night_shifts: '🌙 Night shifts OK',
  remote: '🏠 Remote-friendly',
}

const PREF_PETS_LABEL: Record<string, string> = {
  cats: '🐱 Cats welcome',
  dogs: '🐶 Dogs welcome',
  welcome: '🐾 Pets welcome',
  none: '🚫 No pets',
}

const PREF_SMOKE_LABEL: Record<string, string> = {
  inside: '🚬 Smoking inside OK',
  outside: '🚭 Outside only',
  none: '🚭 No smoking',
}

function SpecCell({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <View style={styles.specCell}>
      <Text style={styles.specIcon}>{icon}</Text>
      <Text style={styles.specValue}>{value}</Text>
      <Text style={styles.specLabel}>{label}</Text>
    </View>
  )
}

function PrefChip({ label }: { label: string }) {
  return (
    <View style={styles.prefChip}>
      <Text style={styles.prefChipLabel}>{label}</Text>
    </View>
  )
}

function AmenityChip({ label }: { label: string }) {
  return (
    <View style={styles.amenityChip}>
      <Text style={styles.amenityChipLabel}>{label}</Text>
    </View>
  )
}

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { width: screenWidth } = useWindowDimensions()
  const { savedIds, toggle } = useSaved()
  const [photoIndex, setPhotoIndex] = useState(0)

  const listing = mockListings.find((l) => l.id === id)
  const poster = listing ? mockUsers.find((u) => u.id === listing.posterId) : null

  useEffect(() => {
    if (listing) track('listing_viewed', { listingId: listing.id })
  }, [listing?.id])

  if (!listing || !poster) {
    return (
      <View style={[styles.container, styles.notFound]}>
        <Text style={styles.notFoundText}>Listing not found.</Text>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={styles.backFallback}>
          <Text style={styles.backFallbackLabel}>← Go back</Text>
        </Pressable>
      </View>
    )
  }

  const isSaved = savedIds.has(listing.id)
  const photos = listing.photos.length > 0 ? listing.photos : []

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(
      e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width,
    )
    setPhotoIndex(Math.max(0, Math.min(index, photos.length - 1)))
  }

  const handleMessage = () => {
    const conv = mockConversations.find(
      (c) =>
        c.listingId === listing.id &&
        c.participantIds.includes(mockSessionUser.id),
    )
    const threadId = conv?.id ?? 'new'
    router.push({
      pathname: '/messages/[threadId]',
      params: { threadId, listingId: listing.id, recipientId: listing.posterId },
    })
  }

  const handleShare = async () => {
    await Share.share({ message: `${listing.title} — €${listing.price}/mo — HomLiv` })
  }

  const prefTags: string[] = []
  if (listing.preferences) {
    const p = listing.preferences
    if (p.gender && PREF_GENDER_LABEL[p.gender]) prefTags.push(PREF_GENDER_LABEL[p.gender])
    if (p.diet && PREF_DIET_LABEL[p.diet]) prefTags.push(PREF_DIET_LABEL[p.diet])
    if (p.householdVibe && PREF_VIBE_LABEL[p.householdVibe]) prefTags.push(PREF_VIBE_LABEL[p.householdVibe])
    if (p.workPattern && PREF_WORK_LABEL[p.workPattern]) prefTags.push(PREF_WORK_LABEL[p.workPattern])
    if (p.pets && PREF_PETS_LABEL[p.pets]) prefTags.push(PREF_PETS_LABEL[p.pets])
    if (p.smoking && PREF_SMOKE_LABEL[p.smoking]) prefTags.push(PREF_SMOKE_LABEL[p.smoking])
    if (p.languages && p.languages.length > 0) prefTags.push(`🗣 ${p.languages.join(', ')}`)
  }

  const memberSince = poster.joinedAt.getFullYear()

  return (
    <View style={styles.container}>
      <ScrollView
        bounces
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Photo Gallery */}
        <View style={{ height: GALLERY_HEIGHT }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={{ width: screenWidth, height: GALLERY_HEIGHT }}
          >
            {photos.length > 0 ? (
              photos.map((uri, i) => (
                <Image
                  key={i}
                  source={{ uri }}
                  style={{ width: screenWidth, height: GALLERY_HEIGHT }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
              ))
            ) : (
              <View
                style={[
                  { width: screenWidth, height: GALLERY_HEIGHT },
                  styles.photoPlaceholder,
                ]}
              >
                <Text style={styles.photoPlaceholderIcon}>🏠</Text>
              </View>
            )}
          </ScrollView>

          {/* Gradient overlay bottom half */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.55)']}
            style={styles.galleryGradient}
            pointerEvents="none"
          />

          {/* Back button */}
          <Pressable
            onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
            style={[styles.galleryBtn, { top: insets.top + 12, left: 16 }]}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={20} color="#ffffff" />
          </Pressable>

          {/* Save + Share */}
          <View style={[styles.galleryBtnRow, { top: insets.top + 12, right: 16 }]}>
            <Pressable
              onPress={() => { toggle(listing.id); track('listing_saved', { listingId: listing.id }) }}
              style={styles.galleryBtn}
              hitSlop={8}
            >
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color={isSaved ? colors.coral : '#ffffff'}
              />
            </Pressable>
            <Pressable onPress={() => void handleShare()} style={styles.galleryBtn} hitSlop={8}>
              <Ionicons name="share-outline" size={18} color="#ffffff" />
            </Pressable>
          </View>

          {/* Photo counter */}
          {photos.length > 1 && (
            <View style={styles.photoCounter}>
              <Text style={styles.photoCounterText}>
                {photoIndex + 1}/{photos.length}
              </Text>
            </View>
          )}

          {/* Price overlay */}
          <View style={styles.priceOverlay}>
            <Text style={styles.priceText}>€{listing.price.toLocaleString('en-IE')}/mo</Text>
            {listing.billsIncluded && (
              <Text style={styles.billsText}>Bills included</Text>
            )}
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{listing.title}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.locationText}>📍 {listing.location}</Text>
            {listing.isRPZ && (
              <View style={styles.rpzBadge}>
                <Text style={styles.rpzLabel}>RPZ</Text>
              </View>
            )}
          </View>

          <View style={styles.badgeRow}>
            <VerificationBadge level={poster.verificationLevel} />
            <Text style={styles.postedTime}>{formatRelativeTime(listing.createdAt)}</Text>
          </View>

          {/* Specs row */}
          <View style={styles.specsRow}>
            <SpecCell
              icon="🛏"
              value={listing.bedrooms > 0 ? String(listing.bedrooms) : 'Studio'}
              label="Rooms"
            />
            <View style={styles.specDivider} />
            <SpecCell icon="🚿" value={String(listing.bathrooms)} label="Baths" />
            <View style={styles.specDivider} />
            <SpecCell icon="⚡" value={listing.berRating} label="BER" />
            <View style={styles.specDivider} />
            <SpecCell
              icon="🏷"
              value={ROOM_TYPE_LABEL[listing.roomType] ?? listing.roomType}
              label="Type"
            />
          </View>

          <Text style={styles.description}>{listing.description}</Text>

          {/* Move-in */}
          <View style={styles.moveInRow}>
            <Text style={styles.moveInLabel}>Move-in</Text>
            <Text style={styles.moveInValue}>{formatMoveIn(listing.moveInDate)}</Text>
          </View>

          {/* Tags / amenities */}
          {listing.tags.length > 0 && (
            <View style={styles.chipsSection}>
              <Text style={styles.chipsSectionLabel}>Amenities</Text>
              <View style={styles.chipsRow}>
                {listing.tags.map((tag) => (
                  <AmenityChip key={tag} label={tag} />
                ))}
              </View>
            </View>
          )}

          {/* Preference tags — only owner_occupier */}
          {listing.listingType === 'owner_occupier' && prefTags.length > 0 && (
            <View style={styles.chipsSection}>
              <Text style={styles.chipsSectionLabel}>Home preferences</Text>
              <View style={styles.chipsRow}>
                {prefTags.map((tag) => (
                  <PrefChip key={tag} label={tag} />
                ))}
              </View>
            </View>
          )}

          {/* Poster card */}
          <View style={styles.posterCard}>
            <View style={styles.posterAvatar}>
              <Text style={styles.posterAvatarText}>
                {poster.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <View style={styles.posterNameRow}>
                <Text style={styles.posterName}>{poster.name}</Text>
                <VerificationBadge level={poster.verificationLevel} />
              </View>
              <Text style={styles.posterMeta}>
                Member since {memberSince} · Usually responds in a few hours
              </Text>
            </View>
          </View>

          {/* Report */}
          <Pressable style={styles.reportBtn} hitSlop={8}>
            <Text style={styles.reportLabel}>Report this listing</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View
        style={[
          styles.ctaContainer,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
        <Pressable onPress={handleMessage} style={styles.ctaBtn}>
          <LinearGradient
            colors={gradients.coral}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.ctaLabel}>💬 Message {poster.name.split(' ')[0]} →</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  notFound: { alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { ...(fonts.bodyMd as object), color: colors.slateBrand },
  backFallback: { padding: 12 },
  backFallbackLabel: { ...(fonts.titleSm as object), color: colors.coral },

  galleryGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: GALLERY_HEIGHT / 2,
  },
  galleryBtn: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryBtnRow: {
    position: 'absolute',
    flexDirection: 'row',
    gap: 8,
  },
  photoCounter: {
    position: 'absolute',
    bottom: 52,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  photoCounterText: {
    ...(fonts.labelSm as object),
    color: '#ffffff',
  },
  priceOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    gap: 2,
  },
  priceText: {
    ...(fonts.priceLg as object),
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  billsText: {
    ...(fonts.labelSm as object),
    color: 'rgba(255,255,255,0.85)',
  },
  photoPlaceholder: {
    backgroundColor: colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderIcon: { fontSize: 48 },

  content: { padding: 20, gap: 16 },

  title: {
    ...(fonts.displayMd as object),
    color: colors.jet,
    letterSpacing: -0.84,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  locationText: {
    ...(fonts.bodySm as object),
    color: colors.slateBrand,
    flex: 1,
  },
  rpzBadge: {
    backgroundColor: colors.amberBg,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rpzLabel: {
    ...(fonts.labelSm as object),
    color: colors.amber,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  postedTime: {
    ...(fonts.bodySm as object),
    color: colors.slateBrand,
  },

  specsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    ...shadows.card,
    overflow: 'hidden',
  },
  specCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  specIcon: { fontSize: 18 },
  specValue: {
    ...(fonts.titleSm as object),
    color: colors.jet,
  },
  specLabel: {
    ...(fonts.labelSm as object),
    color: colors.slateBrand,
  },
  specDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: `${colors.ghost}50`,
    marginVertical: 12,
  },

  description: {
    ...(fonts.bodyLg as object),
    color: colors.ink,
  },
  moveInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moveInLabel: {
    ...(fonts.bodySm as object),
    color: colors.slateBrand,
  },
  moveInValue: {
    ...(fonts.bodySm as object),
    color: colors.ink,
    fontWeight: '600',
  },

  chipsSection: { gap: 8 },
  chipsSectionLabel: {
    ...(fonts.labelMd as object),
    color: colors.slateBrand,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    backgroundColor: colors.surfaceLow,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  amenityChipLabel: {
    ...(fonts.bodySm as object),
    color: colors.ink,
  },
  prefChip: {
    backgroundColor: colors.greenBg,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  prefChipLabel: {
    ...(fonts.bodySm as object),
    color: colors.green,
  },

  posterCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...shadows.card,
  },
  posterAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.jet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterAvatarText: {
    ...(fonts.titleMd as object),
    color: colors.surface,
  },
  posterNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  posterName: {
    ...(fonts.titleSm as object),
    color: colors.jet,
  },
  posterMeta: {
    ...(fonts.bodySm as object),
    color: colors.slateBrand,
  },

  reportBtn: { alignSelf: 'flex-start', paddingVertical: 4 },
  reportLabel: {
    ...(fonts.bodySm as object),
    color: colors.slateBrand,
    textDecorationLine: 'underline',
  },

  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  ctaBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    ...shadows.coral,
  },
  ctaGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
})
