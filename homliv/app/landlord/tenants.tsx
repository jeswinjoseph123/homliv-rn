import { useMemo, useCallback } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
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
import { mockTenancy } from '../../src/data/tenancy'
import { getInitials, formatDate, formatPrice } from '../../src/lib/utils'
import type { User, Listing } from '../../src/types'

type TenantRow = {
  convId: string
  tenant: User
  listing: Listing
  hasActiveLease: boolean
}

function RentBadge({ status }: { status: 'paid' | 'pending' | 'overdue' }) {
  const { colors } = useTheme()
  const styles = useStyles()
  const map = {
    paid: { label: 'Paid', color: colors.green, bg: colors.greenBg },
    pending: { label: 'Pending', color: colors.amber, bg: colors.amberBg },
    overdue: { label: 'Overdue', color: colors.red, bg: colors.redBg },
  }
  const s = map[status]
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
    </View>
  )
}

function TenantCard({ row }: { row: TenantRow }) {
  const router = useRouter()
  const styles = useStyles()
  const isMockTenant = mockTenancy.tenantId === row.tenant.id && mockTenancy.listingId === row.listing.id

  return (
    <View style={styles.card} accessible={false}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(row.tenant.name)}</Text>
        </View>
        <View style={styles.tenantInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.tenantName}>{row.tenant.name}</Text>
            <RentBadge status={isMockTenant ? 'paid' : 'pending'} />
          </View>
          <Text style={styles.propertyLine} numberOfLines={1}>📍 {row.listing.location}</Text>
          <Text style={styles.rentLine}>{formatPrice(row.listing.price)}/mo</Text>
          {isMockTenant && (
            <Text style={styles.leaseLine}>
              {formatDate(mockTenancy.leaseStart)} – {formatDate(mockTenancy.leaseEnd)}
            </Text>
          )}
        </View>
      </View>
      <Pressable
        onPress={() =>
          router.push({
            pathname: '/messages/[threadId]',
            params: { threadId: row.convId },
          })
        }
        style={styles.messageBtn}
        accessibilityLabel={`Message ${row.tenant.name}`}
        accessibilityRole="button"
      >
        <Text style={styles.messageBtnText}>Message</Text>
      </Pressable>
    </View>
  )
}

export default function LandlordTenants() {
  const sessionUser = useSession((s) => s.user)
  const conversations = useChatStore((s) => s.conversations)
  const styles = useStyles()

  const tenantRows = useMemo<TenantRow[]>(() => {
    const rows: TenantRow[] = []
    const seen = new Set<string>()
    for (const conv of conversations) {
      const listing = mockListings.find((l) => l.id === conv.listingId)
      if (!listing || listing.posterId !== sessionUser?.id) continue
      const otherId = conv.participantIds.find((id) => id !== sessionUser?.id)
      if (!otherId || seen.has(otherId)) continue
      const tenant = mockUsers.find((u) => u.id === otherId)
      if (!tenant) continue
      seen.add(otherId)
      rows.push({ convId: conv.id, tenant, listing, hasActiveLease: true })
    }
    return rows
  }, [conversations, sessionUser?.id])

  const renderItem = useCallback(({ item }: { item: TenantRow }) => <TenantCard row={item} />, [])

  if (!sessionUser) return null

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tenants</Text>
        <Text style={styles.headerCount}>{tenantRows.length} active</Text>
      </View>

      <FlashList
        data={tenantRows}
        renderItem={renderItem}
        keyExtractor={(item) => item.convId}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No tenants yet</Text>
            <Text style={styles.emptySub}>Tenants will appear here once they message you</Text>
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

    list: { paddingHorizontal: 20, paddingBottom: 40 },

    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      gap: 12,
      ...(shadows.dashboard as object),
    },
    cardTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: colors.slateBrand,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    avatarText: { ...(fonts.titleSm as object), color: '#ffffff' },
    tenantInfo: { flex: 1, gap: 3 },
    nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    tenantName: { ...(fonts.titleSm as object), color: colors.jet, flex: 1 },
    propertyLine: { ...(fonts.bodySm as object), color: colors.slateBrand },
    rentLine: { ...(fonts.labelMd as object), color: colors.coral },
    leaseLine: { ...(fonts.labelSm as object), color: colors.slateBrand },

    badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
    badgeText: { ...(fonts.labelSm as object) },

    messageBtn: {
      backgroundColor: `${colors.coral}15`,
      borderRadius: 12,
      paddingVertical: 10,
      alignItems: 'center',
    },
    messageBtnText: { ...(fonts.labelMd as object), color: colors.coral },

    empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
    emptyIcon: { fontSize: 40 },
    emptyTitle: { ...(fonts.titleMd as object), color: colors.jet },
    emptySub: { ...(fonts.bodyMd as object), color: colors.slateBrand, textAlign: 'center' },
  }), [colors])
}
