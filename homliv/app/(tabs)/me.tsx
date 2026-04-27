import { useMemo } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { colors, gradients } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'
import { shadows } from '../../src/constants/shadows'
import { mockUsers } from '../../src/data/users'
import { mockListings } from '../../src/data/listings'
import { mockTenancy } from '../../src/data/tenancy'
import { useSession } from '../../src/hooks/useSession'
import { useRequireAuth } from '../../src/hooks/useRequireAuth'
import { useSaved } from '../../src/hooks/useSaved'
import { useSavedSearches } from '../../src/hooks/useSavedSearches'
import { useChatStore } from '../../src/hooks/useChatStore'
import { VerificationBadge } from '../../src/components/shared/VerificationBadge'
import { getInitials, formatPrice, formatDate } from '../../src/lib/utils'
import type { Listing, SavedSearch, User } from '../../src/types'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const PLACEHOLDER = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'

function ProfileHeader({ user }: { user: User }) {
  const router = useRouter()

  return (
    <View>
      <LinearGradient
        colors={gradients.slate}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.userName}>{user.name}</Text>
            {user.location ? (
              <Text style={styles.userLocation}>{user.location}</Text>
            ) : null}
            <Pressable onPress={() => router.push('/me/settings')} hitSlop={4}>
              <Text style={styles.editLink}>Edit profile</Text>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
      <View style={styles.badgesRow}>
        <VerificationBadge level={user.verificationLevel} />
      </View>
    </View>
  )
}

function MiniListingCard({ listing }: { listing: Listing }) {
  const router = useRouter()
  const photo = listing.photos[0] ?? PLACEHOLDER
  return (
    <Pressable
      onPress={() => router.push(`/listing/${listing.id}`)}
      style={styles.miniCard}
    >
      <Image
        source={{ uri: photo }}
        contentFit="cover"
        cachePolicy="memory-disk"
        style={styles.miniPhoto}
      />
      <View style={styles.miniBody}>
        <Text style={styles.miniTitle} numberOfLines={2}>{listing.title}</Text>
        <Text style={styles.miniPrice}>{formatPrice(listing.price)}</Text>
        <Text style={styles.miniLocation} numberOfLines={1}>📍 {listing.location}</Text>
      </View>
    </Pressable>
  )
}

function SectionHeader({ title, onViewAll }: { title: string; onViewAll: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable onPress={onViewAll} hitSlop={8}>
        <Text style={styles.viewAll}>View all →</Text>
      </Pressable>
    </View>
  )
}

function EmptySection({
  icon, title, body, cta, onCta,
}: {
  icon: string; title: string; body: string; cta: string; onCta: () => void
}) {
  return (
    <View style={styles.emptySection}>
      <Text style={styles.emptySectionIcon}>{icon}</Text>
      <View style={styles.emptySectionText}>
        <Text style={styles.emptySectionTitle}>{title}</Text>
        <Text style={styles.emptySectionBody}>{body}</Text>
      </View>
      <Pressable onPress={onCta} style={styles.emptySectionCta}>
        <Text style={styles.emptySectionCtaText}>{cta}</Text>
      </Pressable>
    </View>
  )
}

function criteriaLabels(s: SavedSearch): string[] {
  const labels: string[] = []
  if (s.filters.type) {
    labels.push(
      s.filters.type === 'owner_occupier'
        ? 'Rooms'
        : s.filters.type === 'landlord'
          ? 'Rentals'
          : 'Housemates',
    )
  }
  if (s.filters.maxPrice) labels.push(`Max €${s.filters.maxPrice}`)
  if (s.filters.area) labels.push(s.filters.area)
  return labels
}

export default function MeScreen() {
  const router = useRouter()
  const sessionUser = useSession((s) => s.user)
  useRequireAuth()

  const savedIds = useSaved((s) => s.savedIds)
  const searches = useSavedSearches((s) => s.searches)
  const conversations = useChatStore((s) => s.conversations)

  const myListings = useMemo(
    () => mockListings.filter((l) => l.posterId === sessionUser?.id),
    [sessionUser?.id],
  )
  const savedListings = useMemo(
    () => mockListings.filter((l) => savedIds.has(l.id)),
    [savedIds],
  )
  const openMaintenance = useMemo(
    () =>
      conversations
        .flatMap((c) => c.messages)
        .filter(
          (m) =>
            m.type === 'maintenance' &&
            m.senderId === sessionUser?.id &&
            m.maintenanceData?.status !== 'resolved',
        ),
    [conversations, sessionUser?.id],
  )

  if (!sessionUser) return null

  const hasTenancy = mockTenancy.tenantId === sessionUser.id
  const landlord = hasTenancy ? mockUsers.find((u) => u.id === mockTenancy.landlordId) : undefined
  const tenancyListing = hasTenancy
    ? mockListings.find((l) => l.id === mockTenancy.listingId)
    : undefined

  const previewMyListings = myListings.slice(0, 2)
  const previewSaved = savedListings.slice(0, 2)

  const navigateToSearch = (s: SavedSearch) => {
    router.push({
      pathname: '/(tabs)/search',
      params: {
        type: s.filters.type ?? '',
        maxPrice: s.filters.maxPrice ? String(s.filters.maxPrice) : '',
        area: s.filters.area ?? '',
      },
    })
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <ProfileHeader user={sessionUser} />

        {/* Tenancy card */}
        {hasTenancy && tenancyListing && (
          <View style={styles.tenancyCard}>
            <Image
              source={{ uri: tenancyListing.photos[0] ?? PLACEHOLDER }}
              contentFit="cover"
              cachePolicy="memory-disk"
              style={styles.tenancyThumb}
            />
            <View style={styles.tenancyInfo}>
              <Text style={styles.tenancyAddress} numberOfLines={2}>{mockTenancy.address}</Text>
              <Text style={styles.tenancyRent}>{formatPrice(mockTenancy.rent)}</Text>
              <Text style={styles.tenancyDates}>
                {formatDate(mockTenancy.leaseStart)} – {formatDate(mockTenancy.leaseEnd)}
              </Text>
              {landlord && (
                <View style={styles.tenancyLandlordRow}>
                  <Text style={styles.tenancyLandlordName}>{landlord.name} · </Text>
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: '/messages/[threadId]',
                        params: { threadId: 'c3', recipientId: landlord.id },
                      })
                    }
                  >
                    <Text style={styles.tenancyMessageLink}>Message</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        )}

        {/* My Listings */}
        <View style={styles.section}>
          <SectionHeader title="My Listings" onViewAll={() => router.push('/me/listings')} />
          {previewMyListings.length > 0 ? (
            <View style={styles.cardsRow}>
              {previewMyListings.map((l) => (
                <MiniListingCard key={l.id} listing={l} />
              ))}
              {previewMyListings.length === 1 && <View style={styles.miniCardPlaceholder} />}
            </View>
          ) : (
            <EmptySection
              icon="🏠"
              title="Nothing listed yet"
              body="Post a listing to reach thousands of renters."
              cta="Post your first listing"
              onCta={() => router.push('/post')}
            />
          )}
        </View>

        {/* Saved Properties */}
        <View style={styles.section}>
          <SectionHeader title="Saved Properties" onViewAll={() => router.push('/me/saved')} />
          {previewSaved.length > 0 ? (
            <View style={styles.cardsRow}>
              {previewSaved.map((l) => (
                <MiniListingCard key={l.id} listing={l} />
              ))}
              {previewSaved.length === 1 && <View style={styles.miniCardPlaceholder} />}
            </View>
          ) : (
            <EmptySection
              icon="🔖"
              title="No saved listings"
              body="Heart listings on the feed to save them here."
              cta="Browse the feed"
              onCta={() => router.replace('/')}
            />
          )}
        </View>

        {/* Saved Searches */}
        <View style={styles.section}>
          <SectionHeader title="Saved Searches" onViewAll={() => router.push('/(tabs)/search')} />
          {searches.length > 0 ? (
            <View style={styles.searchList}>
              {searches.map((s) => {
                const labels = criteriaLabels(s)
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => navigateToSearch(s)}
                    style={styles.searchRow}
                  >
                    <View style={styles.searchIcon}>
                      <Text style={{ fontSize: 16 }}>🔍</Text>
                    </View>
                    <View style={styles.searchInfo}>
                      <Text style={styles.searchName}>{s.name}</Text>
                      <View style={styles.searchCriteria}>
                        {labels.map((lbl) => (
                          <View key={lbl} style={styles.criteriaTag}>
                            <Text style={styles.criteriaText}>{lbl}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    {s.newResultCount > 0 && (
                      <View style={styles.resultBadge}>
                        <Text style={styles.resultBadgeText}>{s.newResultCount}</Text>
                      </View>
                    )}
                    <Text style={styles.searchChevron}>›</Text>
                  </Pressable>
                )
              })}
            </View>
          ) : (
            <EmptySection
              icon="🔍"
              title="No saved searches"
              body="Save a search to get notified of new matching listings."
              cta="Try a search and save it"
              onCta={() => router.push('/(tabs)/search')}
            />
          )}
        </View>

        {/* Maintenance section */}
        {openMaintenance.length > 0 && (
          <View style={styles.section}>
            <View style={[styles.maintenanceCard]}>
              <View style={styles.maintenanceLeft}>
                <Text style={styles.maintenanceIcon}>🔧</Text>
                <View>
                  <Text style={styles.maintenanceTitle}>
                    {openMaintenance.length} open maintenance {openMaintenance.length === 1 ? 'issue' : 'issues'}
                  </Text>
                  <Text style={styles.maintenanceSub}>
                    {openMaintenance[0].maintenanceData?.category} · {openMaintenance[0].maintenanceData?.priority} priority
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => router.push({ pathname: '/messages/[threadId]', params: { threadId: 'c3' } })}
                hitSlop={8}
              >
                <Text style={styles.maintenanceLink}>View →</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Landlord dashboard */}
        {sessionUser.roles.includes('landlord') && (
          <View style={styles.section}>
            <Pressable
              onPress={() => router.push('/landlord')}
              style={styles.landlordRow}
              accessibilityLabel="Switch to Landlord view"
              accessibilityRole="button"
            >
              <View style={styles.landlordLeft}>
                <LinearGradient
                  colors={gradients.coral}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.landlordIcon}
                >
                  <Text style={{ fontSize: 16 }}>🏢</Text>
                </LinearGradient>
                <View style={styles.landlordText}>
                  <Text style={styles.landlordLabel}>Landlord Dashboard</Text>
                  <Text style={styles.landlordSub}>Manage your properties</Text>
                </View>
              </View>
              <Text style={styles.settingsChevron}>›</Text>
            </Pressable>
          </View>
        )}

        {/* Settings link */}
        <View style={styles.section}>
          <Pressable
            onPress={() => router.push('/me/settings')}
            style={styles.settingsRow}
            accessibilityLabel="Settings"
            accessibilityRole="button"
          >
            <Text style={styles.settingsLabel}>⚙️  Settings</Text>
            <Text style={styles.settingsChevron}>›</Text>
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceLow },
  scroll: { paddingBottom: 100 },

  // Profile header
  gradient: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.jet,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    ...(shadows.card as object),
  },
  avatarText: { ...(fonts.titleLg as object), color: '#ffffff' },
  nameBlock: { flex: 1, gap: 2 },
  userName: { ...(fonts.titleLg as object), color: '#ffffff' },
  userLocation: { ...(fonts.bodySm as object), color: 'rgba(255,255,255,0.7)' },
  editLink: { ...(fonts.labelMd as object), color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surfaceLow,
  },
  // Tenancy
  tenancyCard: {
    marginHorizontal: 20,
    marginTop: 4,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    gap: 16,
    ...(shadows.dashboard as object),
  },
  tenancyThumb: {
    width: 72,
    height: 72,
    borderRadius: 14,
  },
  tenancyInfo: { flex: 1, gap: 3 },
  tenancyAddress: { ...(fonts.titleSm as object), color: colors.jet },
  tenancyRent: { ...(fonts.price as object), color: colors.coral, fontSize: 16 },
  tenancyDates: { ...(fonts.bodySm as object), color: colors.slateBrand },
  tenancyLandlordRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  tenancyLandlordName: { ...(fonts.bodySm as object), color: colors.slateBrand },
  tenancyMessageLink: { ...(fonts.labelMd as object), color: colors.coral },

  // Sections
  section: { marginHorizontal: 20, marginTop: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { ...(fonts.titleMd as object), color: colors.jet },
  viewAll: { ...(fonts.labelMd as object), color: colors.coral },

  // Mini cards
  cardsRow: { flexDirection: 'row', gap: 8 },
  miniCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    ...(shadows.card as object),
  },
  miniCardPlaceholder: { flex: 1 },
  miniPhoto: { height: 100, width: '100%' },
  miniBody: { padding: 10, gap: 2 },
  miniTitle: { ...(fonts.labelMd as object), color: colors.jet },
  miniPrice: { ...(fonts.titleSm as object), color: colors.coral },
  miniLocation: { ...(fonts.labelSm as object), color: colors.slateBrand },

  // Empty section
  emptySection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  emptySectionIcon: { fontSize: 32 },
  emptySectionText: { alignItems: 'center', gap: 4 },
  emptySectionTitle: { ...(fonts.titleSm as object), color: colors.jet },
  emptySectionBody: { ...(fonts.bodySm as object), color: colors.slateBrand, textAlign: 'center' },
  emptySectionCta: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.coral,
    borderRadius: 10,
  },
  emptySectionCtaText: { ...(fonts.labelMd as object), color: '#fff' },

  // Saved searches
  searchList: { gap: 8 },
  searchRow: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...(shadows.card as object),
  },
  searchIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInfo: { flex: 1, gap: 4 },
  searchName: { ...(fonts.titleSm as object), color: colors.jet },
  searchCriteria: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  criteriaTag: {
    backgroundColor: colors.surfaceLow,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  criteriaText: { ...(fonts.labelSm as object), color: colors.slateBrand },
  resultBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  resultBadgeText: { ...(fonts.labelSm as object), color: '#fff' },
  searchChevron: { ...(fonts.titleMd as object), color: colors.slateBrand },

  // Maintenance
  maintenanceCard: {
    backgroundColor: colors.amberBg,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: `${colors.amber}30`,
  },
  maintenanceLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  maintenanceIcon: { fontSize: 22 },
  maintenanceTitle: { ...(fonts.titleSm as object), color: colors.jet },
  maintenanceSub: { ...(fonts.bodySm as object), color: colors.slateBrand },
  maintenanceLink: { ...(fonts.labelMd as object), color: colors.coral },

  // Landlord dashboard row
  landlordRow: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...(shadows.card as object),
  },
  landlordLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  landlordIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  landlordText: { gap: 2 },
  landlordLabel: { ...(fonts.titleSm as object), color: colors.jet },
  landlordSub: { ...(fonts.bodySm as object), color: colors.slateBrand },

  // Settings row
  settingsRow: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...(shadows.card as object),
  },
  settingsLabel: { ...(fonts.titleSm as object), color: colors.jet },
  settingsChevron: { ...(fonts.titleMd as object), color: colors.slateBrand },
})
