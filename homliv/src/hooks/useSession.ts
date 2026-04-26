import { create } from 'zustand'
import { User } from '../types'

type SessionStore = {
  user: User | null
  setUser: (user: User) => void
  clearSession: () => void
}

export const useSession = create<SessionStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearSession: () => set({ user: null }),
}))
