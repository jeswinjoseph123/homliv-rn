import { create } from 'zustand'

type NotifChannel = 'messages' | 'listings' | 'viewings' | 'payments' | 'maintenance' | 'marketing'

type NotifStore = {
  push: Record<NotifChannel, boolean>
  email: Record<NotifChannel, boolean>
  sms: Record<NotifChannel, boolean>
  setToggle: (medium: 'push' | 'email' | 'sms', channel: NotifChannel, value: boolean) => void
}

const defaultChannels: Record<NotifChannel, boolean> = {
  messages: true,
  listings: true,
  viewings: true,
  payments: true,
  maintenance: true,
  marketing: false,
}

export const useNotifSettings = create<NotifStore>((set) => ({
  push: { ...defaultChannels },
  email: { ...defaultChannels },
  sms: { ...defaultChannels, marketing: false },
  setToggle: (medium, channel, value) =>
    set((state) => ({
      [medium]: { ...state[medium], [channel]: value },
    })),
}))
