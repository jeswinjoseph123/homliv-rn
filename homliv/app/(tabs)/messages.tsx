import { useCallback } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { colors, gradients } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'
import { useChatStore } from '../../src/hooks/useChatStore'
import { mockUsers, mockSessionUser } from '../../src/data/users'
import { mockListings } from '../../src/data/listings'
import { timeAgo } from '../../src/lib/utils'
import { getInitials } from '../../src/lib/utils'
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

function ConvRow({ conv, onPress }: { conv: Conversation; onPress: () => void }) {
  const otherId = conv.participantIds.find((id) => id !== mockSessionUser.id) ?? conv.participantIds[0]
  const other = mockUsers.find((u) => u.id === otherId)
  if (!other) return null

  const lastMsg = conv.messages[conv.messages.length - 1]
  const unreadCount = conv.messages.filter(
    (m) => m.senderId !== mockSessionUser.id && !m.readAt,
  ).length

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(other.name)}</Text>
        </View>
        {other.isOnline && <View style={styles.onlineDot} />}
      </View>

      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text style={styles.name} numberOfLines={1}>{other.name}</Text>
          {lastMsg && (
            <Text style={styles.timestamp}>{timeAgo(lastMsg.createdAt)}</Text>
          )}
        </View>
        <Text style={styles.preview} numberOfLines={1}>
          {previewText(lastMsg)}
        </Text>
      </View>

      {unreadCount > 0 && (
        <LinearGradient colors={gradients.coral} style={styles.badge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={styles.badgeText}>{unreadCount}</Text>
        </LinearGradient>
      )}
    </Pressable>
  )
}

function EmptyState() {
  const router = useRouter()
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>💬</Text>
      <Text style={styles.emptyTitle}>No conversations yet</Text>
      <Text style={styles.emptySub}>Start by messaging a listing</Text>
      <Pressable onPress={() => router.push('/')}>
        <Text style={styles.emptyLink}>Browse listings</Text>
      </Pressable>
    </View>
  )
}

export default function MessagesScreen() {
  const router = useRouter()
  const conversations = useChatStore((s) => s.conversations)

  const sorted = [...conversations].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

  const handlePress = useCallback((conv: Conversation) => {
    const listing = mockListings.find((l) => l.id === conv.listingId)
    const otherId = conv.participantIds.find((id) => id !== mockSessionUser.id) ?? ''
    router.push({
      pathname: '/messages/[threadId]',
      params: {
        threadId: conv.id,
        listingId: conv.listingId ?? '',
        recipientId: otherId,
      },
    })
  }, [router])

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      <FlashList
        data={sorted}
        renderItem={({ item }) => (
          <ConvRow conv={item} onPress={() => handlePress(item)} />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${colors.ghost}40`,
  },
  headerTitle: { ...(fonts.titleLg as object), color: colors.jet },
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
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { ...(fonts.titleMd as object), color: colors.jet },
  emptySub: { ...(fonts.bodyMd as object), color: colors.slateBrand },
  emptyLink: { ...(fonts.titleSm as object), color: colors.coral, marginTop: 4 },
})
