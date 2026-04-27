import { useMemo, useState } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { colors, gradients } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'
import { shadows } from '../../src/constants/shadows'
import { useSession } from '../../src/hooks/useSession'
import { useChatStore } from '../../src/hooks/useChatStore'
import { mockListings } from '../../src/data/listings'
import { mockUsers } from '../../src/data/users'
import { formatPrice, timeAgo } from '../../src/lib/utils'
import type { Message } from '../../src/types'

function previewText(msg: Message | undefined): string {
  if (!msg) return 'No messages yet'
  switch (msg.type) {
    case 'maintenance': return '🔧 Maintenance request'
    case 'viewing_request': return '📅 Viewing request'
    case 'viewing_confirmed': return '✅ Viewing confirmed'
    default: return msg.text ?? ''
  }
}

export default function LandlordOverview() {
  const router = useRouter()
  const sessionUser = useSession((s) => s.user)
  const conversations = useChatStore((s) => s.conversations)
  const [rtbDismissed, setRtbDismissed] = useState(false)

  const properties = useMemo(
    () => mockListings.filter((l) => l.posterId === sessionUser?.id),
    [sessionUser?.id],
  )

  const landlordConvs = useMemo(
    () => conversations.filter((c) => {
      const listing = mockListings.find((l) => l.id === c.listingId)
      return listing?.posterId === sessionUser?.id
    }),
    [conversations, sessionUser?.id],
  )

  const monthlyRent = useMemo(
    () => properties.reduce((sum, l) => sum + l.price, 0),
    [properties],
  )

  const openMaintenance = useMemo(
    () => landlordConvs.flatMap((c) =>
      c.messages.filter(
        (m) => m.type === 'maintenance' && m.maintenanceData?.status !== 'resolved',
      ),
    ).length,
    [landlordConvs],
  )

  const recentActivity = useMemo(() => {
    const items: Array<{ convId: string; msg: Message; otherName: string; listingTitle: string }> = []
    for (const conv of landlordConvs) {
      const last = conv.messages[conv.messages.length - 1]
      if (!last) continue
      const otherId = conv.participantIds.find((id) => id !== sessionUser?.id) ?? ''
      const other = mockUsers.find((u) => u.id === otherId)
      const listing = mockListings.find((l) => l.id === conv.listingId)
      if (!other || !listing) continue
      items.push({ convId: conv.id, msg: last, otherName: other.name, listingTitle: listing.title })
    }
    return items.sort((a, b) => b.msg.createdAt.getTime() - a.msg.createdAt.getTime()).slice(0, 5)
  }, [landlordConvs, sessionUser?.id])

  if (!sessionUser) return null

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Overview</Text>
          <Text style={styles.headerSub}>Welcome back, {sessionUser.name.split(' ')[0]}</Text>
        </View>
        <Pressable
          onPress={() => router.back()}
          style={styles.closeBtn}
          accessibilityLabel="Close landlord dashboard"
          accessibilityRole="button"
          hitSlop={12}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* RTB banner */}
        {!rtbDismissed && (
          <View style={styles.rtbBanner}>
            <Text style={styles.rtbText}>
              📋 Ensure your tenancies are registered with the RTB. Register at rtb.ie
            </Text>
            <Pressable
              onPress={() => setRtbDismissed(true)}
              hitSlop={8}
              accessibilityLabel="Dismiss RTB notice"
              accessibilityRole="button"
            >
              <Text style={styles.rtbDismiss}>✕</Text>
            </Pressable>
          </View>
        )}

        {/* Stats grid */}
        <View style={styles.statsRow}>
          <LinearGradient colors={gradients.coral} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statCard}>
            <Text style={styles.statValue}>{properties.length}</Text>
            <Text style={styles.statLabel}>Properties</Text>
          </LinearGradient>
          <LinearGradient colors={gradients.coral} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statCard}>
            <Text style={styles.statValue}>{landlordConvs.length}</Text>
            <Text style={styles.statLabel}>Tenants</Text>
          </LinearGradient>
        </View>
        <View style={styles.statsRow}>
          <LinearGradient colors={gradients.slate} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statCard}>
            <Text style={styles.statValue}>{formatPrice(monthlyRent)}</Text>
            <Text style={styles.statLabel}>Monthly rent</Text>
          </LinearGradient>
          <LinearGradient colors={gradients.slate} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statCard}>
            <Text style={styles.statValue}>{openMaintenance}</Text>
            <Text style={styles.statLabel}>Open maintenance</Text>
          </LinearGradient>
        </View>

        {/* Recent activity */}
        <Text style={styles.sectionTitle}>Recent activity</Text>
        {recentActivity.length > 0 ? (
          <View style={styles.activityCard}>
            {recentActivity.map((item, i) => (
              <Pressable
                key={item.convId}
                onPress={() =>
                  router.push({
                    pathname: '/messages/[threadId]',
                    params: { threadId: item.convId },
                  })
                }
                style={[styles.activityRow, i < recentActivity.length - 1 && styles.activityDivider]}
                accessibilityLabel={`Message from ${item.otherName}: ${previewText(item.msg)}`}
                accessibilityRole="button"
              >
                <View style={styles.activityAvatar}>
                  <Text style={styles.activityAvatarText}>
                    {item.otherName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </Text>
                </View>
                <View style={styles.activityContent}>
                  <View style={styles.activityTop}>
                    <Text style={styles.activityName}>{item.otherName}</Text>
                    <Text style={styles.activityTime}>{timeAgo(item.msg.createdAt)}</Text>
                  </View>
                  <Text style={styles.activityPreview} numberOfLines={1}>
                    {previewText(item.msg)}
                  </Text>
                  <Text style={styles.activityProperty} numberOfLines={1}>
                    {item.listingTitle}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.emptyActivity}>
            <Text style={styles.emptyText}>No recent activity</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
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
  headerSub: { ...(fonts.bodySm as object), color: colors.slateBrand, marginTop: 2 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...(shadows.card as object),
  },
  closeBtnText: { ...(fonts.titleMd as object), color: colors.slateBrand },

  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  rtbBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.amberBg,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: `${colors.amber}40`,
    marginBottom: 20,
  },
  rtbText: { ...(fonts.bodySm as object), color: colors.jet, flex: 1 },
  rtbDismiss: { ...(fonts.titleSm as object), color: colors.slateBrand },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    gap: 4,
    ...(shadows.dashboard as object),
  },
  statValue: { ...(fonts.priceLg as object), color: '#ffffff', fontSize: 28 },
  statLabel: { ...(fonts.labelMd as object), color: 'rgba(255,255,255,0.8)' },

  sectionTitle: {
    ...(fonts.titleMd as object),
    color: colors.jet,
    marginTop: 8,
    marginBottom: 12,
  },

  activityCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    ...(shadows.dashboard as object),
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  activityDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${colors.ghost}30`,
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.slateBrand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityAvatarText: { ...(fonts.labelMd as object), color: '#ffffff' },
  activityContent: { flex: 1, gap: 2 },
  activityTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activityName: { ...(fonts.titleSm as object), color: colors.jet },
  activityTime: { ...(fonts.labelSm as object), color: colors.slateBrand },
  activityPreview: { ...(fonts.bodySm as object), color: colors.slateBrand },
  activityProperty: { ...(fonts.labelSm as object), color: colors.coral },

  emptyActivity: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    ...(shadows.card as object),
  },
  emptyText: { ...(fonts.bodyMd as object), color: colors.slateBrand },
})
