import { create } from 'zustand'
import type { Conversation, Message, MessageType } from '../types'
import { mockConversations } from '../data/conversations'
import { mockSessionUser } from '../data/users'

export type SendMessageInput = {
  type: MessageType
  text?: string
  maintenanceData?: Message['maintenanceData']
  viewingData?: Message['viewingData']
}

let msgCounter = 500
let convCounter = 20

type ChatStore = {
  conversations: Conversation[]
  dismissedBanners: string[]

  getConv: (id: string) => Conversation | undefined
  sendMessage: (convId: string, input: SendMessageInput) => void
  addStatusMessage: (convId: string, text: string) => void
  confirmViewingSlot: (convId: string, slot: Date) => void
  acknowledgeMaintenanceReport: (convId: string, msgId: string) => void
  updateMaintenanceStatus: (convId: string, msgId: string, status: 'open' | 'in_progress' | 'resolved') => void
  dismissBanner: (convId: string) => void
  createConversation: (listingId: string, recipientId: string) => string
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [...mockConversations],
  dismissedBanners: [],

  getConv: (id) => get().conversations.find((c) => c.id === id),

  sendMessage: (convId, input) => {
    const msg: Message = {
      id: `m${++msgCounter}`,
      conversationId: convId,
      senderId: mockSessionUser.id,
      ...input,
      createdAt: new Date(),
    }
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id !== convId ? c : { ...c, messages: [...c.messages, msg], updatedAt: new Date() },
      ),
    }))
  },

  addStatusMessage: (convId, text) => {
    const msg: Message = {
      id: `m${++msgCounter}`,
      conversationId: convId,
      senderId: 'system',
      type: 'status',
      text,
      createdAt: new Date(),
    }
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id !== convId ? c : { ...c, messages: [...c.messages, msg], updatedAt: new Date() },
      ),
    }))
  },

  confirmViewingSlot: (convId, slot) => {
    const conv = get().getConv(convId)
    if (!conv) return
    const reqMsg = [...conv.messages].reverse().find((m) => m.type === 'viewing_request')
    const slots = reqMsg?.viewingData?.slots ?? []
    const note = reqMsg?.viewingData?.note
    const msg: Message = {
      id: `m${++msgCounter}`,
      conversationId: convId,
      senderId: mockSessionUser.id,
      type: 'viewing_confirmed',
      viewingData: { slots, confirmedSlot: slot, note },
      createdAt: new Date(),
    }
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id !== convId ? c : { ...c, messages: [...c.messages, msg], updatedAt: new Date() },
      ),
    }))
  },

  acknowledgeMaintenanceReport: (convId, msgId) => {
    set((s) => ({
      conversations: s.conversations.map((c) => {
        if (c.id !== convId) return c
        return {
          ...c,
          messages: c.messages.map((m) => {
            if (m.id !== msgId || !m.maintenanceData) return m
            return { ...m, maintenanceData: { ...m.maintenanceData, status: 'in_progress' as const } }
          }),
        }
      }),
    }))
  },

  updateMaintenanceStatus: (convId, msgId, status) => {
    set((s) => ({
      conversations: s.conversations.map((c) => {
        if (c.id !== convId) return c
        return {
          ...c,
          messages: c.messages.map((m) => {
            if (m.id !== msgId || !m.maintenanceData) return m
            return { ...m, maintenanceData: { ...m.maintenanceData, status } }
          }),
        }
      }),
    }))
  },

  dismissBanner: (convId) =>
    set((s) => ({ dismissedBanners: [...s.dismissedBanners, convId] })),

  createConversation: (listingId, recipientId) => {
    const id = `c${++convCounter}`
    const conv: Conversation = {
      id,
      listingId,
      participantIds: [mockSessionUser.id, recipientId],
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    set((s) => ({ conversations: [...s.conversations, conv] }))
    return id
  },
}))
