import { create } from 'zustand'
import type { SavedSearch } from '../types'

type SavedSearchesStore = {
  searches: SavedSearch[]
  add: (s: Omit<SavedSearch, 'id' | 'createdAt'>) => void
  remove: (id: string) => void
  update: (id: string, patch: Partial<SavedSearch>) => void
}

let counter = 100

const initial: SavedSearch[] = [
  {
    id: 'ss1',
    name: 'Rooms in Dublin 6',
    filters: { type: 'owner_occupier', maxPrice: 1200, area: 'Dublin 6' },
    notify: true,
    newResultCount: 3,
    createdAt: new Date(Date.now() - 86400 * 7 * 1000),
  },
  {
    id: 'ss2',
    name: 'Apartments under €1500',
    filters: { type: 'landlord', maxPrice: 1500 },
    notify: false,
    newResultCount: 0,
    createdAt: new Date(Date.now() - 86400 * 14 * 1000),
  },
]

export const useSavedSearches = create<SavedSearchesStore>((set) => ({
  searches: initial,
  add: (s) =>
    set((state) => ({
      searches: [
        ...state.searches,
        { ...s, id: `ss${++counter}`, createdAt: new Date() },
      ],
    })),
  remove: (id) =>
    set((state) => ({ searches: state.searches.filter((s) => s.id !== id) })),
  update: (id, patch) =>
    set((state) => ({
      searches: state.searches.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    })),
}))
