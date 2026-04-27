import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { colors } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'
import { shadows } from '../../src/constants/shadows'
import { mockListings } from '../../src/data/listings'
import { useSavedSearches } from '../../src/hooks/useSavedSearches'
import { track } from '../../src/lib/analytics'
import { ListingCard } from '../../src/components/feed/ListingCard'
import type { Listing, ListingType } from '../../src/types'

type PriceFilter = 800 | 1200 | 1500 | null

const TYPE_CHIPS: { label: string; value: ListingType | null }[] = [
  { label: 'All',         value: null },
  { label: 'Rooms',       value: 'owner_occupier' },
  { label: 'Housemates',  value: 'housemate' },
  { label: 'Rentals',     value: 'landlord' },
]

const PRICE_CHIPS: { label: string; value: PriceFilter }[] = [
  { label: 'Any price',  value: null },
  { label: '< €800',     value: 800 },
  { label: '< €1,200',   value: 1200 },
  { label: '< €1,500',   value: 1500 },
]

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string
  active: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{label}</Text>
    </Pressable>
  )
}

function SaveSearchSheet({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean
  onClose: () => void
  onSave: (name: string, notify: boolean) => void
}) {
  const [name, setName] = useState('')
  const [notify, setNotify] = useState(true)
  const insets = useSafeAreaInsets()
  const translateY = useSharedValue(400)
  const opacity = useSharedValue(0)

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 })
      translateY.value = withSpring(0, { damping: 22, stiffness: 300 })
    } else {
      opacity.value = withTiming(0, { duration: 150 })
      translateY.value = withTiming(400, { duration: 200 })
      setName('')
      setNotify(true)
    }
  }, [visible])

  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))
  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const handleSave = useCallback(() => {
    if (!name.trim()) return
    onSave(name.trim(), notify)
    onClose()
  }, [name, notify, onSave, onClose])

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          </Animated.View>
          <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }, panelStyle]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Save this search</Text>

            <Text style={styles.sheetLabel}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Rooms near the office"
              placeholderTextColor={colors.slateBrand}
              style={styles.sheetInput}
              autoFocus
            />

            <View style={styles.notifyRow}>
              <View>
                <Text style={styles.notifyLabel}>Notify me</Text>
                <Text style={styles.notifySub}>Get alerts when new matching listings appear</Text>
              </View>
              <Switch
                value={notify}
                onValueChange={setNotify}
                trackColor={{ false: `${colors.ghost}80`, true: colors.coral }}
                thumbColor={colors.surface}
              />
            </View>

            <Pressable
              onPress={handleSave}
              style={[styles.saveBtn, !name.trim() && styles.saveBtnDisabled]}
              disabled={!name.trim()}
            >
              <Text style={styles.saveBtnLabel}>Save search</Text>
            </Pressable>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

function EmptyResults() {
  return (
    <View style={styles.emptyResults}>
      <Text style={styles.emptyIcon}>🏡</Text>
      <Text style={styles.emptyTitle}>No listings match</Text>
      <Text style={styles.emptySub}>Try different filters or save this search to get notified.</Text>
    </View>
  )
}

export default function SearchScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{
    type?: string
    maxPrice?: string
    area?: string
  }>()

  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<ListingType | null>(
    (params.type as ListingType) || null,
  )
  const [priceFilter, setPriceFilter] = useState<PriceFilter>(
    params.maxPrice ? (Number(params.maxPrice) as PriceFilter) : null,
  )
  const [showSaveSheet, setShowSaveSheet] = useState(false)
  const { add: addSearch } = useSavedSearches()

  const hasFilters = !!(typeFilter || priceFilter || query.trim())

  const results = useMemo<Listing[]>(() => {
    return mockListings.filter((l) => {
      if (typeFilter && l.listingType !== typeFilter) return false
      if (priceFilter && l.price > priceFilter) return false
      if (query.trim()) {
        const q = query.trim().toLowerCase()
        if (
          !l.title.toLowerCase().includes(q) &&
          !l.location.toLowerCase().includes(q) &&
          !l.area.toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
  }, [typeFilter, priceFilter, query])

  const handleSave = useCallback(
    (name: string, notify: boolean) => {
      addSearch({
        name,
        filters: {
          type: typeFilter ?? undefined,
          maxPrice: priceFilter ?? undefined,
          area: query.trim() || undefined,
        },
        notify,
        newResultCount: results.length,
      })
      track('saved_search_created')
    },
    [addSearch, typeFilter, priceFilter, query, results.length],
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by title, area, eircode…"
          placeholderTextColor={colors.slateBrand}
          style={styles.searchInput}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Text style={styles.clearIcon}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Type filter chips */}
      <View style={styles.filterRow}>
        {TYPE_CHIPS.map((chip) => (
          <FilterChip
            key={chip.label}
            label={chip.label}
            active={typeFilter === chip.value}
            onPress={() => setTypeFilter(chip.value)}
          />
        ))}
      </View>

      {/* Price filter chips */}
      <View style={styles.filterRow}>
        {PRICE_CHIPS.map((chip) => (
          <FilterChip
            key={chip.label}
            label={chip.label}
            active={priceFilter === chip.value}
            onPress={() => setPriceFilter(chip.value)}
          />
        ))}
      </View>

      {/* Results count */}
      {hasFilters && (
        <View style={styles.resultsRow}>
          <Text style={styles.resultsCount}>{results.length} listings found</Text>
        </View>
      )}

      {/* Results list */}
      <FlashList
        data={hasFilters ? results : mockListings}
        keyExtractor={(l) => l.id}
        ListEmptyComponent={EmptyResults}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <ListingCard
              listing={item}
              onMessage={() =>
                router.push({
                  pathname: '/messages/[threadId]',
                  params: { threadId: 'new', listingId: item.id, recipientId: item.posterId },
                })
              }
            />
          </View>
        )}
      />

      {/* Save this search FAB */}
      {hasFilters && (
        <View style={styles.saveFab}>
          <Pressable onPress={() => setShowSaveSheet(true)} style={styles.saveFabBtn}>
            <Text style={styles.saveFabLabel}>🔖  Save this search</Text>
          </Pressable>
        </View>
      )}

      <SaveSearchSheet
        visible={showSaveSheet}
        onClose={() => setShowSaveSheet(false)}
        onSave={handleSave}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceLow },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${colors.ghost}40`,
  },
  headerTitle: { ...(fonts.titleLg as object), color: colors.jet },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    ...(shadows.card as object),
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    ...(fonts.bodyMd as object),
    color: colors.jet,
  },
  clearIcon: { ...(fonts.labelMd as object), color: colors.slateBrand },

  // Filter chips
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: `${colors.ghost}60`,
  },
  chipActive: {
    backgroundColor: colors.jet,
    borderColor: colors.jet,
  },
  chipLabel: { ...(fonts.labelMd as object), color: colors.slateBrand },
  chipLabelActive: { color: '#fff' },

  // Results
  resultsRow: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
  },
  resultsCount: { ...(fonts.labelMd as object), color: colors.slateBrand },
  listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100 },
  cardWrap: { marginBottom: 16 },

  // Save FAB
  saveFab: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  saveFabBtn: {
    backgroundColor: colors.jet,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 14,
    ...(shadows.dashboard as object),
  },
  saveFabLabel: { ...(fonts.titleSm as object), color: '#fff' },

  // Save sheet
  backdrop: { backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 16,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: `${colors.ghost}80`,
    alignSelf: 'center',
    marginBottom: 4,
  },
  sheetTitle: { ...(fonts.titleMd as object), color: colors.jet },
  sheetLabel: { ...(fonts.labelMd as object), color: colors.slateBrand, marginBottom: -8 },
  sheetInput: {
    backgroundColor: colors.surfaceLow,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...(fonts.bodyMd as object),
    color: colors.jet,
    borderWidth: 1,
    borderColor: `${colors.ghost}60`,
  },
  notifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  notifyLabel: { ...(fonts.titleSm as object), color: colors.jet },
  notifySub: { ...(fonts.bodySm as object), color: colors.slateBrand },
  saveBtn: {
    backgroundColor: colors.coral,
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnLabel: { ...(fonts.titleSm as object), color: '#fff' },

  // Empty
  emptyResults: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
    paddingHorizontal: 32,
  },
  emptyIcon: { fontSize: 44 },
  emptyTitle: { ...(fonts.titleMd as object), color: colors.jet },
  emptySub: { ...(fonts.bodyMd as object), color: colors.slateBrand, textAlign: 'center' },
})
