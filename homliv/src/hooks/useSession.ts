import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { User } from '../types'

type SessionStore = {
  user: User | null
  hasHydrated: boolean
  setUser: (user: User) => void
  clearSession: () => void
  setHasHydrated: (v: boolean) => void
}

function reviveUser(raw: unknown): User | null {
  if (!raw || typeof raw !== 'object') return null
  const u = raw as Record<string, unknown>
  return {
    ...(u as User),
    joinedAt: new Date(u.joinedAt as string),
    lastSeen: new Date(u.lastSeen as string),
  }
}

export const useSession = create<SessionStore>()(
  persist(
    (set) => ({
      user: null,
      hasHydrated: false,
      setUser: (user) => set({ user }),
      clearSession: () => set({ user: null }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: 'homliv-session',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
      merge: (persisted, current) => {
        const p = persisted as { user?: unknown }
        return { ...current, user: reviveUser(p.user) }
      },
    },
  ),
)
