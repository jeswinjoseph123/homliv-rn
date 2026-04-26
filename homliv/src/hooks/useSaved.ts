import { create } from 'zustand'

type SavedStore = {
  savedIds: Set<string>
  toggle: (id: string) => void
}

export const useSaved = create<SavedStore>((set, get) => ({
  savedIds: new Set<string>(),
  toggle: (id) => {
    const next = new Set(get().savedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    set({ savedIds: next })
  },
}))
