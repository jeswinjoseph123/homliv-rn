import { useMemo, useCallback } from 'react'
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Image } from 'expo-image'
import { FlashList } from '@shopify/flash-list'
import { useRouter } from 'expo-router'
import { colors, gradients } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'
import { shadows } from '../../src/constants/shadows'
import { useSession } from '../../src/hooks/useSession'
import { useChatStore } from '../../src/hooks/useChatStore'
import { mockListings } from '../../src/data/listings'
import { mockUsers } from '../../src/data/users'
import { formatPrice } from '../../src/lib/utils'
import type { Listing } from '../../src/types'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'

function StatusBadge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  )
}

function PropertyCard({ listing, tenantName }: { listing: Listing; tenantName: string | null }) {
  const router = useRouter()
  const photo = listing.photos[0] ?? PLACEHOLDER
  const isOccupied = tenantName !== null

  return (
    <Pressable
      onPress={() => router.push(`/listing/${listing.id}`)}
      style={styles.card}
      accessibilityLabel={`${listing.title}, ${formatPrice(listing.price)} per month, ${isOccupied ? `tenant: ${tenantName}` : 'vacant'}`}
      accessibilityRole="button"
    >
      <Image
        source={{ uri: photo }}
        contentFit="cover"
        cachePolicy="memory-disk"
        style={styles.cardImage}
        accessibilityLabel={listing.title}
      />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{listing.title}</Text>
        <Text style={styles.cardLocation} numberOfLines={1}>📍 {listing.location}</Text>
        <Text style={styles.cardPrice}>{formatPrice(listing.price)}/mo</Text>
        <View style={styles.cardFooter}>
          {isOccupied ? (
            <Text style={styles.tenantName} numberOfLines={1}>👤 {tenantName}</Text>
          ) : (
            <Text style={styles.vacantText}>Vacant</Text>
          )}
          <StatusBadge
            label={isOccupied ? 'Occupied' : 'Available'}
            color={isOccupied ? colors.green : colors.slateBrand}
            bg={isOccupied ? colors.greenBg : `${colors.slateBrand}15`}
          />
        </View>
      </View>
    </Pressable>
  )
}

export default function LandlordProperties() {
  const sessionUser = useSession((s) => s.user)
  const conversations = useChatStore((s) => s.conversations)

  const properties = useMemo(
    () => mockListings.filter((l) => l.posterId === sessionUser?.id),
    [sessionUser?.id],
  )

  const tenantMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const conv of conversations) {
      const listing = mockListings.find((l) => l.id === conv.listingId)
      if (!listing || listing.posterId !== sessionUser?.id) continue
      const otherId = conv.participantIds.find((id) => id !== sessionUser?.id)
      if (!otherId) continue
      const other = mockUsers.find((u) => u.id === otherId)
      if (other) map.set(listing.id, other.name)
    }
    return map
  }, [conversations, sessionUser?.id])

  const renderItem = useCallback(
    ({ item }: { item: Listing }) => (
      <PropertyCard listing={item} tenantName={tenantMap.get(item.id) ?? null} />
    ),
    [tenantMap],
  )

  if (!sessionUser) return null

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Properties</Text>
        <Text style={styles.headerCount}>{properties.length} listed</Text>
      </View>

      <FlashList
        data={properties}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏠</Text>
            <Text style={styles.emptyTitle}>No properties yet</Text>
            <Text style={styles.emptySub}>Tap + to add your first listing</Text>
          </View>
        }
      />

      <Pressable
        onPress={() => Alert.alert('Add property', 'Coming soon — post from the main tab for now.')}
        style={styles.fab}
        accessibilityLabel="Add a property"
        accessibilityRole="button"
      >
        <LinearGradient
          colors={gradients.coral}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGrad}
        >
          <Text style={styles.fabText}>+</Text>
        </LinearGradient>
      </Pressable>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceLow },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { ...(fonts.titleLg as object), color: colors.jet },
  headerCount: { ...(fonts.bodyMd as object), color: colors.slateBrand },

  list: { paddingHorizontal: 20, paddingBottom: 100 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    ...(shadows.dashboard as object),
  },
  cardImage: { width: '100%', height: 140 },
  cardBody: { padding: 16, gap: 4 },
  cardTitle: { ...(fonts.titleSm as object), color: colors.jet },
  cardLocation: { ...(fonts.bodySm as object), color: colors.slateBrand },
  cardPrice: { ...(fonts.price as object), color: colors.coral, fontSize: 16, marginTop: 4 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  tenantName: { ...(fonts.labelMd as object), color: colors.slateBrand, flex: 1, marginRight: 8 },
  vacantText: { ...(fonts.labelMd as object), color: colors.ghost },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { ...(fonts.labelSm as object) },

  empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { ...(fonts.titleMd as object), color: colors.jet },
  emptySub: { ...(fonts.bodyMd as object), color: colors.slateBrand },

  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    ...(shadows.coral as object),
  },
  fabGrad: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: { ...(fonts.displayMd as object), color: '#ffffff', lineHeight: 56 },
})
