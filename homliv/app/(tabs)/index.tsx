import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlashList } from '@shopify/flash-list'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { colors } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'
import { FeedHeader } from '../../src/components/layout/FeedHeader'
import { StoriesRow } from '../../src/components/feed/StoriesRow'
import { FilterChips, FilterKey } from '../../src/components/feed/FilterChips'
import { ListingCard } from '../../src/components/feed/ListingCard'
import { ListingCardSkeleton } from '../../src/components/feed/ListingCardSkeleton'
import { FeedEmptyState } from '../../src/components/feed/FeedEmptyState'
import { mockListings } from '../../src/data/listings'
import { mockUsers } from '../../src/data/users'
import { track } from '../../src/lib/analytics'
import type { Listing } from '../../src/types'

const PAGE_SIZE = 8

function filterListings(listings: Listing[], filter: FilterKey): Listing[] {
  if (filter === 'All') return listings
  return listings.filter((l) => {
    switch (filter) {
      case 'Rooms':
        return l.roomType !== 'whole_property'
      case 'Apartments':
        return l.roomType === 'whole_property' && l.bedrooms <= 2
      case 'Houses':
        return l.roomType === 'whole_property' && l.bedrooms >= 3
      case 'South Asian':
        return (
          l.tags.some((t) => t.toLowerCase().includes('south asian')) ||
          (l.preferences?.languages?.some((lang) =>
            ['Hindi', 'Tamil', 'Malayalam', 'Gujarati', 'Punjabi', 'Urdu'].includes(lang),
          ) ?? false)
        )
      case 'Female only':
        return l.preferences?.gender === 'female'
      case 'Veg-friendly':
        return (
          l.preferences?.diet === 'vegetarian' ||
          l.preferences?.diet === 'vegan' ||
          l.tags.some((t) => t.toLowerCase().includes('veg'))
        )
      case 'Students':
        return l.tags.some(
          (t) => t.toLowerCase().includes('student') || t.toLowerCase().includes('university'),
        )
      case 'Pets OK':
        return (
          (l.preferences?.pets != null && l.preferences.pets !== 'none') ||
          l.tags.some((t) => t.toLowerCase().includes('pet'))
        )
      case 'Quiet home':
        return (
          l.preferences?.householdVibe === 'quiet' ||
          l.tags.some((t) => t.toLowerCase().includes('quiet'))
        )
      default:
        return true
    }
  })
}

function SectionHeader({ count, total }: { count: number; total: number }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Dublin & beyond</Text>
      <Text style={styles.sectionCount}>Showing {count} of {total}</Text>
    </View>
  )
}

function DividerRow({ text }: { text: string }) {
  return (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerLabel}>{text}</Text>
      <View style={styles.dividerLine} />
    </View>
  )
}

export default function FeedScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const lastScrollTrack = useRef(0)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const filtered = useMemo(() => filterListings(mockListings, activeFilter), [activeFilter])
  const paginated = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page])

  const showDivider = useMemo(
    () =>
      filtered.some(
        (l) => mockUsers.find((u) => u.id === l.posterId)?.verificationLevel === 'landlord',
      ),
    [filtered],
  )

  const handleFilterChange = useCallback((key: FilterKey) => {
    setActiveFilter(key)
    setPage(1)
  }, [])

  const loadMore = useCallback(() => {
    if (paginated.length < filtered.length) {
      setPage((p) => p + 1)
    }
  }, [paginated.length, filtered.length])

  const handleScroll = useCallback(() => {
    const now = Date.now()
    if (now - lastScrollTrack.current > 2000) {
      lastScrollTrack.current = now
      track('feed_scrolled')
    }
  }, [lastScrollTrack])

  const clearFilters = useCallback(() => handleFilterChange('All'), [handleFilterChange])

  const ListHeader = useCallback(
    () => (
      <>
        <StoriesRow />
        <FilterChips active={activeFilter} onChange={handleFilterChange} />
        <SectionHeader count={paginated.length} total={filtered.length} />
        {showDivider && <DividerRow text="Verified landlords" />}
      </>
    ),
    [activeFilter, handleFilterChange, paginated.length, filtered.length, showDivider],
  )

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <FeedHeader />
        <View style={styles.skeletonList}>
          <ListingCardSkeleton />
          <ListingCardSkeleton />
          <ListingCardSkeleton />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FeedHeader hasUnread />
      <FlashList
        data={paginated}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ListingCard listing={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={<FeedEmptyState onClearFilters={clearFilters} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        onScroll={handleScroll}
        scrollEventThrottle={400}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  separator: { height: 12 },
  skeletonList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  sectionTitle: {
    ...(fonts.titleSm as object),
    color: colors.jet,
  },
  sectionCount: {
    ...(fonts.labelSm as object),
    color: colors.slateBrand,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.ghost,
    opacity: 0.5,
  },
  dividerLabel: {
    ...(fonts.labelSm as object),
    color: colors.slateBrand,
  },
})
