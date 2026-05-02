import { useCallback, useMemo } from 'react'
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useRouter } from 'expo-router'
import { useTheme } from '../../src/hooks/useTheme'
import { fonts } from '../../src/constants/typography'
import { useSaved } from '../../src/hooks/useSaved'
import { mockListings } from '../../src/data/listings'
import { ListingCard } from '../../src/components/feed/ListingCard'
import type { Listing } from '../../src/types'

function EmptyState() {
  const styles = useStyles()
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>🔖</Text>
      <Text style={styles.emptyTitle}>No saved listings</Text>
      <Text style={styles.emptySub}>Heart any listing to save it here.</Text>
      <Pressable onPress={() => router.replace('/')} style={styles.emptyCta}>
        <Text style={styles.emptyCtaText}>Browse the feed</Text>
      </Pressable>
    </View>
  )
}

export default function SavedScreen() {
  const routerHook = useRouter()
  const savedIds = useSaved((s) => s.savedIds)
  const toggle = useSaved((s) => s.toggle)
  const savedListings = mockListings.filter((l) => savedIds.has(l.id))
  const styles = useStyles()

  const handleUnsave = useCallback((listing: Listing) => {
    Alert.alert(
      'Remove from saved?',
      `"${listing.title}" will be removed from your saved listings.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => toggle(listing.id) },
      ],
    )
  }, [toggle])

  const handleClearAll = useCallback(() => {
    if (savedListings.length === 0) return
    Alert.alert(
      'Clear all saved listings?',
      'All saved listings will be removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear all',
          style: 'destructive',
          onPress: () => savedListings.forEach((l) => toggle(l.id)),
        },
      ],
    )
  }, [savedListings, toggle])

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/')} hitSlop={8}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>Saved Listings</Text>
        {savedListings.length > 0 ? (
          <Pressable onPress={handleClearAll} hitSlop={8}>
            <Text style={styles.clearAll}>Clear all</Text>
          </Pressable>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      <FlashList
        data={savedListings}
        keyExtractor={(l) => l.id}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <ListingCard
              listing={item}
              onMessage={() =>
                routerHook.push({
                  pathname: '/messages/[threadId]',
                  params: { threadId: 'new', listingId: item.id, recipientId: item.posterId },
                })
              }
            />
          </View>
        )}
      />
    </SafeAreaView>
  )
}

function useStyles() {
  const { colors } = useTheme()
  return useMemo(() => StyleSheet.create({
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
    clearAll: { ...(fonts.labelMd as object), color: colors.red },
    listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
    cardWrap: { marginBottom: 16 },
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
  }), [colors])
}
