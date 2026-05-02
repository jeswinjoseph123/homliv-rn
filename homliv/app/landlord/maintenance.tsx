import { useMemo, useState, useCallback } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlashList } from '@shopify/flash-list'
import { useRouter } from 'expo-router'
import { useTheme } from '../../src/hooks/useTheme'
import { fonts } from '../../src/constants/typography'
import { shadows } from '../../src/constants/shadows'
import { useSession } from '../../src/hooks/useSession'
import { useChatStore } from '../../src/hooks/useChatStore'
import { mockListings } from '../../src/data/listings'
import { mockUsers } from '../../src/data/users'
import type { Message, Conversation } from '../../src/types'

type StatusFilter = 'all' | 'open' | 'in_progress' | 'resolved'

type MaintenanceItem = {
  msg: Message
  conv: Conversation
  propertyTitle: string
  propertyLocation: string
  tenantName: string
  daysOpen: number
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const styles = useStyles()
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      accessibilityLabel={`Filter by ${label}`}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  )
}

function MaintenanceCard({ item }: { item: MaintenanceItem }) {
  const router = useRouter()
  const { colors } = useTheme()
  const styles = useStyles()
  const updateMaintenanceStatus = useChatStore((s) => s.updateMaintenanceStatus)
  const data = item.msg.maintenanceData!

  const priorityDotColor = (p: 'low' | 'medium' | 'high') => {
    if (p === 'high') return colors.red
    if (p === 'medium') return colors.amber
    return colors.green
  }

  const statusConfig = (s: 'open' | 'in_progress' | 'resolved') => {
    if (s === 'open') return { label: 'Open', color: colors.red, bg: colors.redBg }
    if (s === 'in_progress') return { label: 'In progress', color: colors.amber, bg: colors.amberBg }
    return { label: 'Resolved', color: colors.green, bg: colors.greenBg }
  }

  const sc = statusConfig(data.status)

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.priorityDot, { backgroundColor: priorityDotColor(data.priority) }]} />
        <View style={styles.cardHeaderText}>
          <Text style={styles.cardCategory}>{data.category}</Text>
          <Text style={styles.cardProperty} numberOfLines={1}>{item.propertyLocation}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
        </View>
      </View>

      <Text style={styles.cardDesc} numberOfLines={2}>{data.description}</Text>

      <View style={styles.cardMeta}>
        <Text style={styles.cardMetaItem}>👤 {item.tenantName}</Text>
        <Text style={styles.cardMetaItem}>⏱ {item.daysOpen}d open</Text>
      </View>

      <View style={styles.cardActions}>
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/messages/[threadId]',
              params: { threadId: item.conv.id },
            })
          }
          style={styles.chatBtn}
          accessibilityLabel="Open conversation thread"
          accessibilityRole="button"
        >
          <Text style={styles.chatBtnText}>Open chat</Text>
        </Pressable>

        {data.status === 'open' && (
          <Pressable
            onPress={() => updateMaintenanceStatus(item.conv.id, item.msg.id, 'in_progress')}
            style={styles.actionBtn}
            accessibilityLabel="Mark as in progress"
            accessibilityRole="button"
          >
            <Text style={styles.actionBtnText}>Start</Text>
          </Pressable>
        )}

        {data.status === 'in_progress' && (
          <Pressable
            onPress={() => updateMaintenanceStatus(item.conv.id, item.msg.id, 'resolved')}
            style={[styles.actionBtn, styles.resolveBtn]}
            accessibilityLabel="Mark as resolved"
            accessibilityRole="button"
          >
            <Text style={[styles.actionBtnText, styles.resolveBtnText]}>Resolve</Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}

export default function LandlordMaintenance() {
  const sessionUser = useSession((s) => s.user)
  const conversations = useChatStore((s) => s.conversations)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const styles = useStyles()

  const allItems = useMemo<MaintenanceItem[]>(() => {
    const items: MaintenanceItem[] = []
    for (const conv of conversations) {
      const listing = mockListings.find((l) => l.id === conv.listingId)
      if (!listing || listing.posterId !== sessionUser?.id) continue
      const otherId = conv.participantIds.find((id) => id !== sessionUser?.id)
      const tenant = otherId ? mockUsers.find((u) => u.id === otherId) : undefined
      for (const msg of conv.messages) {
        if (msg.type !== 'maintenance' || !msg.maintenanceData) continue
        const daysOpen = Math.floor((Date.now() - msg.createdAt.getTime()) / 86400000)
        items.push({
          msg,
          conv,
          propertyTitle: listing.title,
          propertyLocation: listing.location,
          tenantName: tenant?.name ?? 'Unknown',
          daysOpen,
        })
      }
    }
    return items.sort((a, b) => {
      const pri = { high: 0, medium: 1, low: 2 }
      return pri[a.msg.maintenanceData!.priority] - pri[b.msg.maintenanceData!.priority]
    })
  }, [conversations, sessionUser?.id])

  const filtered = useMemo(
    () => filter === 'all' ? allItems : allItems.filter((i) => i.msg.maintenanceData?.status === filter),
    [allItems, filter],
  )

  const renderItem = useCallback(({ item }: { item: MaintenanceItem }) => <MaintenanceCard item={item} />, [])

  if (!sessionUser) return null

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Maintenance</Text>
        <Text style={styles.headerCount}>{allItems.filter((i) => i.msg.maintenanceData?.status !== 'resolved').length} open</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {(['all', 'open', 'in_progress', 'resolved'] as StatusFilter[]).map((f) => (
          <FilterChip
            key={f}
            label={f === 'all' ? 'All' : f === 'in_progress' ? 'In progress' : f.charAt(0).toUpperCase() + f.slice(1)}
            active={filter === f}
            onPress={() => setFilter(f)}
          />
        ))}
      </ScrollView>

      <FlashList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.msg.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔧</Text>
            <Text style={styles.emptyTitle}>No maintenance issues</Text>
            <Text style={styles.emptySub}>
              {filter === 'all' ? 'Issues reported by tenants appear here' : `No ${filter.replace('_', ' ')} issues`}
            </Text>
          </View>
        }
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
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    headerTitle: { ...(fonts.titleLg as object), color: colors.jet },
    headerCount: { ...(fonts.bodyMd as object), color: colors.slateBrand },

    filterRow: { paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 10,
      backgroundColor: colors.surface,
      ...(shadows.card as object),
    },
    chipActive: { backgroundColor: colors.jet },
    chipText: { ...(fonts.labelMd as object), color: colors.slateBrand },
    chipTextActive: { color: '#ffffff' },

    list: { paddingHorizontal: 20, paddingBottom: 40 },

    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      gap: 10,
      ...(shadows.dashboard as object),
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    priorityDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
    cardHeaderText: { flex: 1 },
    cardCategory: { ...(fonts.titleSm as object), color: colors.jet },
    cardProperty: { ...(fonts.labelSm as object), color: colors.slateBrand },
    statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
    statusText: { ...(fonts.labelSm as object) },

    cardDesc: { ...(fonts.bodyMd as object), color: colors.slateBrand },

    cardMeta: { flexDirection: 'row', gap: 16 },
    cardMetaItem: { ...(fonts.labelSm as object), color: colors.slateBrand },

    cardActions: { flexDirection: 'row', gap: 8 },
    chatBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: `${colors.slateBrand}15`,
      alignItems: 'center',
    },
    chatBtnText: { ...(fonts.labelMd as object), color: colors.slateBrand },
    actionBtn: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: `${colors.amber}20`,
      alignItems: 'center',
    },
    actionBtnText: { ...(fonts.labelMd as object), color: colors.amber },
    resolveBtn: { backgroundColor: `${colors.green}20` },
    resolveBtnText: { color: colors.green },

    empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
    emptyIcon: { fontSize: 40 },
    emptyTitle: { ...(fonts.titleMd as object), color: colors.jet },
    emptySub: { ...(fonts.bodyMd as object), color: colors.slateBrand, textAlign: 'center' },
  }), [colors])
}
