import { create } from 'zustand'

type BlockedStore = {
  blockedIds: string[]
  block: (userId: string) => void
  unblock: (userId: string) => void
}

export const useBlocked = create<BlockedStore>((set) => ({
  blockedIds: [],
  block: (userId) => set((state) => ({ blockedIds: [...state.blockedIds, userId] })),
  unblock: (userId) => set((state) => ({ blockedIds: state.blockedIds.filter((id) => id !== userId) })),
}))
