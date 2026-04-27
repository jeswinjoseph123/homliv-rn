import { useMemo, useState } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'
import { shadows } from '../../src/constants/shadows'
import { useSession } from '../../src/hooks/useSession'
import { useChatStore } from '../../src/hooks/useChatStore'
import { mockListings } from '../../src/data/listings'
import { mockUsers } from '../../src/data/users'
import { formatPrice } from '../../src/lib/utils'

type PayStatus = 'paid' | 'overdue' | 'pending'

type RentCard = {
  id: string
  tenantName: string
  propertyTitle: string
  propertyLocation: string
  amount: number
  dueDate: string
  status: PayStatus
}

const statusConfig = (s: PayStatus) => {
  if (s === 'paid') return { label: 'Paid', color: colors.green, bg: colors.greenBg }
  if (s === 'overdue') return { label: 'Overdue', color: colors.red, bg: colors.redBg }
  return { label: 'Pending', color: colors.amber, bg: colors.amberBg }
}

export default function LandlordPayments() {
  const sessionUser = useSession((s) => s.user)
  const conversations = useChatStore((s) => s.conversations)
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set(['c3']))

  const rentCards = useMemo<RentCard[]>(() => {
    const cards: RentCard[] = []
    const seen = new Set<string>()
    for (const conv of conversations) {
      const listing = mockListings.find((l) => l.id === conv.listingId)
      if (!listing || listing.posterId !== sessionUser?.id) continue
      if (seen.has(listing.id)) continue
      seen.add(listing.id)
      const otherId = conv.participantIds.find((id) => id !== sessionUser?.id)
      const tenant = otherId ? mockUsers.find((u) => u.id === otherId) : undefined
      cards.push({
        id: conv.id,
        tenantName: tenant?.name ?? 'Unknown',
        propertyTitle: listing.title,
        propertyLocation: listing.location,
        amount: listing.price,
        dueDate: '1 May 2026',
        status: paidIds.has(conv.id) ? 'paid' : 'pending',
      })
    }
    return cards
  }, [conversations, sessionUser?.id, paidIds])

  const markPaid = (id: string) => {
    Alert.alert(
      'Mark as paid',
      'This records the payment for your records. No money moves through HomLiv yet.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark paid',
          onPress: () => setPaidIds((prev) => new Set([...prev, id])),
        },
      ],
    )
  }

  if (!sessionUser) return null

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payments</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Coming soon banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            📋 Manual ledger — automated rent collection coming soon.
          </Text>
        </View>

        {/* Rent tracker cards */}
        <Text style={styles.sectionTitle}>Rent tracker — May 2026</Text>

        {rentCards.length > 0 ? (
          rentCards.map((card) => {
            const sc = statusConfig(card.status)
            return (
              <View key={card.id} style={styles.rentCard}>
                <View style={styles.rentCardHeader}>
                  <View style={styles.rentCardInfo}>
                    <Text style={styles.rentTenantName}>{card.tenantName}</Text>
                    <Text style={styles.rentProperty} numberOfLines={1}>📍 {card.propertyLocation}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
                  </View>
                </View>

                <View style={styles.rentCardAmountRow}>
                  <Text style={styles.rentAmount}>{formatPrice(card.amount)}</Text>
                  <Text style={styles.rentDue}>Due {card.dueDate}</Text>
                </View>

                {card.status !== 'paid' && (
                  <Pressable
                    onPress={() => markPaid(card.id)}
                    style={styles.markPaidBtn}
                    accessibilityLabel={`Mark rent paid for ${card.tenantName}`}
                    accessibilityRole="button"
                  >
                    <Text style={styles.markPaidText}>Mark as paid</Text>
                  </Pressable>
                )}
              </View>
            )
          })
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💳</Text>
            <Text style={styles.emptyTitle}>No rent records yet</Text>
            <Text style={styles.emptySub}>Rent tracker appears once you have active tenants</Text>
          </View>
        )}

        {/* Payment history */}
        <Text style={styles.sectionTitle}>Payment history</Text>
        <View style={styles.historyCard}>
          {[
            { month: 'April 2026', tenant: 'Aoife Murphy', amount: 2800, status: 'paid' as PayStatus },
            { month: 'March 2026', tenant: 'Aoife Murphy', amount: 2800, status: 'paid' as PayStatus },
            { month: 'February 2026', tenant: 'Aoife Murphy', amount: 2800, status: 'paid' as PayStatus },
          ].map((entry, i) => (
            <View
              key={i}
              style={[styles.historyRow, i < 2 && styles.historyDivider]}
              accessible
              accessibilityLabel={`${entry.month}: ${entry.tenant}, ${formatPrice(entry.amount)}, ${entry.status}`}
            >
              <View style={styles.historyLeft}>
                <Text style={styles.historyMonth}>{entry.month}</Text>
                <Text style={styles.historyTenant}>{entry.tenant}</Text>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.historyAmount}>{formatPrice(entry.amount)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: colors.greenBg }]}>
                  <Text style={[styles.statusText, { color: colors.green }]}>Paid</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceLow },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { ...(fonts.titleLg as object), color: colors.jet },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  banner: {
    backgroundColor: colors.amberBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: `${colors.amber}40`,
    marginBottom: 20,
  },
  bannerText: { ...(fonts.bodySm as object), color: colors.jet },

  sectionTitle: {
    ...(fonts.titleMd as object),
    color: colors.jet,
    marginBottom: 12,
  },

  rentCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    gap: 10,
    ...(shadows.dashboard as object),
  },
  rentCardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  rentCardInfo: { flex: 1, gap: 2, marginRight: 8 },
  rentTenantName: { ...(fonts.titleSm as object), color: colors.jet },
  rentProperty: { ...(fonts.bodySm as object), color: colors.slateBrand },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { ...(fonts.labelSm as object) },
  rentCardAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  rentAmount: { ...(fonts.priceLg as object), color: colors.jet, fontSize: 24 },
  rentDue: { ...(fonts.labelSm as object), color: colors.slateBrand },
  markPaidBtn: {
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: `${colors.green}15`,
    alignItems: 'center',
  },
  markPaidText: { ...(fonts.labelMd as object), color: colors.green },

  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { ...(fonts.titleMd as object), color: colors.jet },
  emptySub: { ...(fonts.bodyMd as object), color: colors.slateBrand, textAlign: 'center' },

  historyCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    ...(shadows.dashboard as object),
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  historyDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${colors.ghost}30`,
  },
  historyLeft: { gap: 2 },
  historyMonth: { ...(fonts.titleSm as object), color: colors.jet },
  historyTenant: { ...(fonts.labelSm as object), color: colors.slateBrand },
  historyRight: { alignItems: 'flex-end', gap: 4 },
  historyAmount: { ...(fonts.price as object), color: colors.jet, fontSize: 15 },
})
