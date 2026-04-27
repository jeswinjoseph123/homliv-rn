import { useState, useCallback, useRef, useEffect } from 'react'
import { View, Text, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { FlashList, FlashListRef } from '@shopify/flash-list'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { colors } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'
import { useChatStore } from '../../src/hooks/useChatStore'
import { useBlocked } from '../../src/hooks/useBlocked'
import { mockUsers, mockSessionUser } from '../../src/data/users'
import { mockListings } from '../../src/data/listings'
import { addReport } from '../../src/data/reports'
import { track } from '../../src/lib/analytics'
import { ChatHeader } from '../../src/components/chat/ChatHeader'
import { ListingPin } from '../../src/components/chat/ListingPin'
import { MessageBubble } from '../../src/components/chat/MessageBubble'
import { MaintenanceCard } from '../../src/components/chat/MaintenanceCard'
import { ViewingCard } from '../../src/components/chat/ViewingCard'
import { FirstMessageBanner } from '../../src/components/chat/FirstMessageBanner'
import { ScamWarningModal } from '../../src/components/chat/ScamWarningModal'
import { AttachmentSheet } from '../../src/components/chat/AttachmentSheet'
import { ComposerBar } from '../../src/components/chat/ComposerBar'
import type { Message } from '../../src/types'

const REPORT_REASONS = ['Spam', 'Scam attempt', 'Harassment', 'Fake listing', 'Other']

function DateSeparator({ date }: { date: Date }) {
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()

  const label = isToday
    ? 'Today'
    : isYesterday
      ? 'Yesterday'
      : date.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })

  return (
    <View style={styles.separator}>
      <Text style={styles.separatorText}>{label}</Text>
    </View>
  )
}

export default function ChatThreadScreen() {
  const { threadId, listingId, recipientId } = useLocalSearchParams<{
    threadId: string
    listingId?: string
    recipientId?: string
  }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const {
    conversations,
    dismissedBanners,
    sendMessage,
    addStatusMessage,
    acknowledgeMaintenanceReport,
    dismissBanner,
    createConversation,
  } = useChatStore()

  const { blockedIds, block } = useBlocked()

  const [activeConvId, setActiveConvId] = useState<string>(threadId)
  const [showAttachment, setShowAttachment] = useState(false)
  const [scamPending, setScamPending] = useState<{ text: string; proceed: () => void } | null>(null)
  const [showReport, setShowReport] = useState(false)
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [reportDesc, setReportDesc] = useState('')

  const conv = conversations.find((c) => c.id === activeConvId)

  const otherId =
    conv?.participantIds.find((id) => id !== mockSessionUser.id) ??
    recipientId ??
    ''
  const otherUser = mockUsers.find((u) => u.id === otherId)

  const listing =
    listingId
      ? mockListings.find((l) => l.id === listingId)
      : conv?.listingId
        ? mockListings.find((l) => l.id === conv.listingId)
        : undefined

  const isBlocked = blockedIds.includes(otherId)
  const bannerDismissed = dismissedBanners.includes(activeConvId)
  const hasMessages = (conv?.messages.length ?? 0) > 0

  const getOrCreateConvId = useCallback((): string => {
    if (conv) return conv.id
    const newId = createConversation(listingId ?? '', otherId)
    setActiveConvId(newId)
    return newId
  }, [conv, createConversation, listingId, otherId])

  const handleSend = useCallback(
    (text: string) => {
      const cid = getOrCreateConvId()
      sendMessage(cid, { type: 'text', text })
    },
    [getOrCreateConvId, sendMessage],
  )

  const handleScamWarning = useCallback(
    (text: string, proceed: () => void) => {
      track('scam_warning_shown')
      setScamPending({ text, proceed })
    },
    [],
  )

  const handleBlock = useCallback(() => {
    if (!otherUser) return
    Alert.alert(
      `Block ${otherUser.name}?`,
      'You will no longer receive messages from this person.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => {
            block(otherId)
            addStatusMessage(activeConvId, 'You blocked this user.')
            track('user_blocked')
          },
        },
      ],
    )
  }, [otherUser, otherId, block, addStatusMessage, activeConvId])

  const handleReport = useCallback(() => {
    setShowReport(true)
  }, [])

  const handleSubmitReport = useCallback(() => {
    if (!selectedReason) return
    addReport(mockSessionUser.id, otherId, selectedReason, reportDesc)
    setShowReport(false)
    setSelectedReason(null)
    setReportDesc('')
    track('user_reported')
    Alert.alert('Report submitted', "We'll review within 24 hours.")
  }, [selectedReason, otherId, reportDesc])

  const handleBack = useCallback(() => {
    router.canGoBack() ? router.back() : router.replace('/')
  }, [router])

  const openViewing = useCallback(() => {
    setShowAttachment(false)
    router.push({ pathname: '/messages/viewing', params: { convId: activeConvId } })
  }, [activeConvId, router])

  const openMaintenance = useCallback(() => {
    setShowAttachment(false)
    router.push({ pathname: '/messages/maintenance', params: { convId: activeConvId } })
  }, [activeConvId, router])

  const listRef = useRef<FlashListRef<Message>>(null)
  const messages = conv?.messages ?? []

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50)
    }
  }, [messages.length])

  const isLandlordForMsg = useCallback(
    (msg: Message) => msg.senderId !== mockSessionUser.id,
    [],
  )

  const renderItem = useCallback(
    ({ item: msg }: { item: Message }) => {
      const isOwn = msg.senderId === mockSessionUser.id

      if (msg.type === 'status') {
        return (
          <View style={styles.statusMsg}>
            <Text style={styles.statusText}>{msg.text}</Text>
          </View>
        )
      }

      if (msg.type === 'maintenance') {
        return (
          <View style={styles.msgPad}>
            <MaintenanceCard
              message={msg}
              isLandlord={isLandlordForMsg(msg)}
              onAcknowledge={() => acknowledgeMaintenanceReport(activeConvId, msg.id)}
            />
          </View>
        )
      }

      if (msg.type === 'viewing_request' || msg.type === 'viewing_confirmed') {
        return (
          <View style={styles.msgPad}>
            <ViewingCard
              message={msg}
              isLandlord={isLandlordForMsg(msg)}
              convId={activeConvId}
            />
          </View>
        )
      }

      return (
        <View style={[styles.msgPad, isOwn ? styles.msgRight : styles.msgLeft]}>
          <MessageBubble message={msg} isOwn={isOwn} />
        </View>
      )
    },
    [activeConvId, acknowledgeMaintenanceReport, isLandlordForMsg],
  )

  const showBanner = !bannerDismissed && !hasMessages

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {otherUser && (
          <ChatHeader
            otherUser={otherUser}
            onBack={handleBack}
            onBlock={handleBlock}
            onReport={handleReport}
          />
        )}

        {listing && (
          <ListingPin
            listing={listing}
            onPress={() =>
              router.push({
                pathname: '/listing/[id]',
                params: { id: listing.id },
              })
            }
          />
        )}

        {showBanner && (
          <FirstMessageBanner onDismiss={() => dismissBanner(activeConvId)} />
        )}

        <FlashList
          ref={listRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 12, paddingBottom: 80 + insets.bottom }}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatText}>
                Send a message to start the conversation.
              </Text>
            </View>
          }
        />

        <ComposerBar
          disabled={isBlocked}
          disabledMessage={isBlocked ? 'Unblock to send messages.' : undefined}
          onSend={handleSend}
          onAttachPress={() => setShowAttachment(true)}
          onScamWarning={handleScamWarning}
          paddingBottom={insets.bottom}
        />

        <AttachmentSheet
          visible={showAttachment}
          hasListingContext={!!listing}
          hasTenancyContext={false}
          onClose={() => setShowAttachment(false)}
          onPhoto={() => setShowAttachment(false)}
          onViewingRequest={openViewing}
          onMaintenanceReport={openMaintenance}
          onLocation={() => setShowAttachment(false)}
          onDocument={() => setShowAttachment(false)}
        />

        <ScamWarningModal
          visible={!!scamPending}
          onCancel={() => setScamPending(null)}
          onProceed={() => {
            track('scam_warning_proceeded')
            scamPending?.proceed()
            setScamPending(null)
          }}
        />

        {showReport && (
          <View style={styles.reportOverlay}>
            <View style={styles.reportCard}>
              <Text style={styles.reportTitle}>Report user</Text>
              {REPORT_REASONS.map((reason) => (
                <View
                  key={reason}
                  style={[
                    styles.reportOption,
                    selectedReason === reason && styles.reportOptionActive,
                  ]}
                >
                  <View
                    style={[
                      styles.reportRadio,
                      selectedReason === reason && styles.reportRadioActive,
                    ]}
                  />
                  <Text
                    style={styles.reportReasonLabel}
                    onPress={() => setSelectedReason(reason)}
                  >
                    {reason}
                  </Text>
                </View>
              ))}
              <View style={styles.reportButtons}>
                <View style={styles.reportCancelBtn}>
                  <Text style={styles.reportCancelLabel} onPress={() => setShowReport(false)}>
                    Cancel
                  </Text>
                </View>
                <View
                  style={[styles.reportSubmitBtn, !selectedReason && styles.reportSubmitDisabled]}
                >
                  <Text style={styles.reportSubmitLabel} onPress={handleSubmitReport}>
                    Report
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceLow },
  msgPad: { paddingHorizontal: 16, paddingVertical: 2 },
  msgRight: { alignItems: 'flex-end' },
  msgLeft: { alignItems: 'flex-start' },
  statusMsg: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  statusText: {
    ...(fonts.labelSm as object),
    color: colors.slateBrand,
    backgroundColor: `${colors.ghost}30`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyChatText: {
    ...(fonts.bodySm as object),
    color: colors.slateBrand,
    textAlign: 'center',
  },
  reportOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  reportCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 24,
    gap: 12,
    width: '100%',
    maxWidth: 360,
  },
  reportTitle: { ...(fonts.titleMd as object), color: colors.jet },
  reportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  reportOptionActive: {},
  reportRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.ghost,
  },
  reportRadioActive: {
    borderColor: colors.coral,
    backgroundColor: colors.coral,
  },
  reportReasonLabel: { ...(fonts.bodyMd as object), color: colors.ink },
  reportButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  reportCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportCancelLabel: { ...(fonts.titleSm as object), color: colors.slateBrand },
  reportSubmitBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportSubmitDisabled: { opacity: 0.4 },
  reportSubmitLabel: { ...(fonts.titleSm as object), color: '#ffffff' },
  separator: {
    alignItems: 'center' as const,
    paddingVertical: 8,
  },
  separatorText: {
    ...(fonts.labelSm as object),
    color: colors.slateBrand,
  },
})
