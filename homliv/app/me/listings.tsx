import { useCallback, useState } from 'react'
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { FlashList } from '@shopify/flash-list'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useRouter } from 'expo-router'
import { colors } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'
import { shadows } from '../../src/constants/shadows'
import { mockListings } from '../../src/data/listings'
import { mockSessionUser } from '../../src/data/users'
import { formatPrice } from '../../src/lib/utils'
import type { Listing } from '../../src/types'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'

type ExpiryState = { label: string; color: string; bg: string }

function getExpiryState(expiresAt: Date): ExpiryState {
  const now = new Date()
  const msLeft = expiresAt.getTime() - now.getTime()
  const daysLeft = Math.ceil(msLeft / 86400000)

  if (daysLeft < 0) {
    return { label: 'Expired · Renew', color: colors.slateBrand, bg: colors.surfaceLow }
  }
  if (daysLeft <= 7) {
    return { label: `Expires in ${daysLeft}d · Bump?`, color: colors.amber, bg: colors.amberBg }
  }
  return { label: `Active · ${daysLeft}d left`, color: colors.green, bg: colors.greenBg }
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>🏠</Text>
      <Text style={styles.emptyTitle}>Nothing listed yet</Text>
      <Text style={styles.emptySub}>Start attracting tenants by posting your first listing.</Text>
      <Pressable onPress={() => router.push('/post')} style={styles.emptyCta}>
        <Text style={styles.emptyCtaText}>Post your first listing</Text>
      </Pressable>
    </View>
  )
}

function ListingActionBar({
  listing,
  onDelete,
}: {
  listing: Listing
  onDelete: (id: string) => void
}) {
  const routerHook = useRouter()

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete listing?',
      `"${listing.title}" will be permanently removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(listing.id),
        },
      ],
    )
  }, [listing, onDelete])

  const handleBump = useCallback(() => {
    Alert.alert('Boost', 'Your listing will be renewed for another 30 days.')
  }, [])

  return (
    <View style={styles.actionBar}>
      <Pressable
        onPress={() => routerHook.push({ pathname: '/post', params: { editId: listing.id } })}
        hitSlop={8}
      >
        <Text style={styles.actionBtn}>Edit</Text>
      </Pressable>
      <View style={styles.actionDivider} />
      <Pressable onPress={() => Alert.alert('Paused', 'Listing paused. You can resume it anytime.')} hitSlop={8}>
        <Text style={styles.actionBtn}>Pause</Text>
      </Pressable>
      <View style={styles.actionDivider} />
      <Pressable onPress={handleDelete} hitSlop={8}>
        <Text style={[styles.actionBtn, { color: colors.red }]}>Delete</Text>
      </Pressable>
      <View style={styles.actionDivider} />
      <Pressable onPress={() => Alert.alert('Boost', 'Boost puts your listing at the top of search results for 7 days.')} hitSlop={8}>
        <Text style={[styles.actionBtn, { color: colors.coral }]}>Boost</Text>
      </Pressable>
    </View>
  )
}

function MyListingCard({
  listing,
  onDelete,
}: {
  listing: Listing
  onDelete: (id: string) => void
}) {
  const routerHook = useRouter()
  const photo = listing.photos[0] ?? PLACEHOLDER
  const expiry = getExpiryState(listing.expiresAt)

  return (
    <View style={styles.card}>
      <Pressable onPress={() => routerHook.push(`/listing/${listing.id}`)}>
        <View style={styles.imageArea}>
          <Image
            source={{ uri: photo }}
            contentFit="cover"
            cachePolicy="memory-disk"
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.expiryBadge, { backgroundColor: expiry.bg }]}>
            <Text style={[styles.expiryLabel, { color: expiry.color }]}>{expiry.label}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>{listing.title}</Text>
          <Text style={styles.cardPrice}>{formatPrice(listing.price)}</Text>
          <Text style={styles.cardLocation}>📍 {listing.location}</Text>
        </View>
      </Pressable>
      <ListingActionBar listing={listing} onDelete={onDelete} />
    </View>
  )
}

export default function MyListingsScreen() {
  const myListings = mockListings.filter((l) => l.posterId === mockSessionUser.id)
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())

  const handleDelete = useCallback((id: string) => {
    setDeletedIds((prev) => new Set([...prev, id]))
  }, [])

  const visible = myListings.filter((l) => !deletedIds.has(l.id))

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/')} hitSlop={8}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>My Listings</Text>
        <Pressable onPress={() => router.push('/post')} hitSlop={8}>
          <Text style={styles.postBtn}>+ Post</Text>
        </Pressable>
      </View>

      <FlashList
        data={visible}
        keyExtractor={(l) => l.id}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <MyListingCard listing={item} onDelete={handleDelete} />
          </View>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceLow },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${colors.ghost}40`,
  },
  back: { ...(fonts.bodyMd as object), color: colors.coral },
  title: { ...(fonts.titleMd as object), color: colors.jet },
  postBtn: { ...(fonts.titleSm as object), color: colors.coral },
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  cardWrap: { marginBottom: 16 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    ...(shadows.card as object),
  },
  imageArea: {
    height: 180,
    backgroundColor: colors.surfaceLow,
  },
  expiryBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  expiryLabel: { ...(fonts.labelMd as object) },
  cardBody: {
    padding: 16,
    gap: 4,
  },
  cardTitle: { ...(fonts.titleSm as object), color: colors.jet },
  cardPrice: { ...(fonts.price as object), color: colors.coral },
  cardLocation: { ...(fonts.bodySm as object), color: colors.slateBrand },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 10,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: `${colors.ghost}20`,
  },
  actionBtn: { ...(fonts.labelMd as object), color: colors.slateBrand },
  actionDivider: {
    width: StyleSheet.hairlineWidth,
    height: 16,
    backgroundColor: `${colors.ghost}60`,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
    paddingHorizontal: 32,
  },
  emptyIcon: { fontSize: 44 },
  emptyTitle: { ...(fonts.titleMd as object), color: colors.jet },
  emptySub: { ...(fonts.bodyMd as object), color: colors.slateBrand, textAlign: 'center' },
  emptyCta: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.coral,
    borderRadius: 12,
  },
  emptyCtaText: { ...(fonts.titleSm as object), color: '#fff' },
})
