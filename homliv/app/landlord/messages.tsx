import { useCallback, useMemo } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlashList } from '@shopify/flash-list'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { gradients } from '../../src/constants/colors'
import { useTheme } from '../../src/hooks/useTheme'
import { fonts } from '../../src/constants/typography'
import { useSession } from '../../src/hooks/useSession'
import { useChatStore } from '../../src/hooks/useChatStore'
import { mockListings } from '../../src/data/listings'
import { mockUsers } from '../../src/data/users'
import { getInitials, timeAgo } from '../../src/lib/utils'
import type { Conversation, Message } from '../../src/types'

function previewText(msg: Message | undefined): string {
  if (!msg) return 'Start a conversation'
  switch (msg.type) {
    case 'maintenance': return '🔧 Maintenance request'
    case 'viewing_request': return '📅 Viewing request'
    case 'viewing_confirmed': return '✅ Viewing confirmed'
    case 'status': return msg.text ?? ''
    default: return msg.text ?? ''
  }
}

function ConvRow({
  conv,
  sessionUserId,
  onPress,
}: {
  conv: Conversation
  sessionUserId: string
  onPress: () => void
}) {
  const { colors } = useTheme()
  const styles = useStyles()
  const otherId = conv.participantIds.find((id) => id !== sessionUserId) ?? conv.participantIds[0]
  const other = mockUsers.find((u) => u.id === otherId)
  if (!other) return null

  const lastMsg = conv.messages[conv.messages.length - 1]
  const unreadCount = conv.messages.filter(
    (m) => m.senderId !== sessionUserId && !m.readAt,
  ).length

  return (
    <Pressable
      onPress={onPress}
      style={styles.row}
      accessibilityLabel={`Conversation with ${other.name}${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      accessibilityRole="button"
    >
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(other.name)}</Text>
        </View>
        {other.isOnline && <View style={styles.onlineDot} />}
      </View>

      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text style={styles.name} numberOfLines={1}>{other.name}</Text>
          {lastMsg && <Text style={styles.timestamp}>{timeAgo(lastMsg.createdAt)}</Text>}
        </View>
        <Text style={styles.preview} numberOfLines={1}>{previewText(lastMsg)}</Text>
      </View>

      {unreadCount > 0 && (
        <LinearGradient
          colors={gradients.coral}
          style={styles.badge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.badgeText}>{unreadCount}</Text>
        </LinearGradient>
      )}
    </Pressable>
  )
}

export default function LandlordMessages() {
  const router = useRouter()
  const sessionUser = useSession((s) => s.user)
  const conversations = useChatStore((s) => s.conversations)
  const styles = useStyles()

  const landlordConvs = useMemo(() => {
    if (!sessionUser) return []
    return conversations
      .filter((c) => {
        const listing = mockListings.find((l) => l.id === c.listingId)
        return listing?.posterId === sessionUser.id
      })
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }, [conversations, sessionUser])

  const handlePress = useCallback((conv: Conversation) => {
    const otherId = conv.participantIds.find((id) => id !== sessionUser?.id) ?? ''
    router.push({
      pathname: '/messages/[threadId]',
      params: { threadId: conv.id, listingId: conv.listingId, recipientId: otherId },
    })
  }, [router, sessionUser?.id])

  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => (
      <ConvRow
        conv={item}
        sessionUserId={sessionUser?.id ?? ''}
        onPress={() => handlePress(item)}
      />
    ),
    [handlePress, sessionUser?.id],
  )

  if (!sessionUser) return null

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerCount}>{landlordConvs.length} conversations</Text>
      </View>

      <FlashList
        data={landlordConvs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySub}>Tenant enquiries appear here</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
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
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: `${colors.ghost}40`,
    },
    headerTitle: { ...(fonts.titleLg as object), color: colors.jet },
    headerCount: { ...(fonts.bodyMd as object), color: colors.slateBrand },
    listContent: { paddingBottom: 20 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 76,
      paddingHorizontal: 16,
      gap: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: `${colors.ghost}20`,
    },
    avatarWrap: { position: 'relative' },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: colors.slateBrand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { ...(fonts.titleSm as object), color: '#ffffff' },
    onlineDot: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.green,
      borderWidth: 1.5,
      borderColor: colors.surface,
    },
    rowContent: { flex: 1, gap: 3 },
    rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    name: { ...(fonts.titleSm as object), color: colors.jet, flex: 1, marginRight: 8 },
    timestamp: { ...(fonts.labelSm as object), color: colors.slateBrand },
    preview: { ...(fonts.bodySm as object), color: colors.slateBrand },
    badge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
    },
    badgeText: { ...(fonts.labelSm as object), color: '#ffffff' },
    empty: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 80,
      gap: 8,
    },
    emptyIcon: { fontSize: 40 },
    emptyTitle: { ...(fonts.titleMd as object), color: colors.jet },
    emptySub: { ...(fonts.bodyMd as object), color: colors.slateBrand },
  }), [colors])
}
