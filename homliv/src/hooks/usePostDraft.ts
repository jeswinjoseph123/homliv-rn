import { create } from 'zustand'
import type { ListingType } from '../types'

export type BillsOption = 'included' | 'excluded' | 'discuss'

export type PostDraftDetails = {
  title: string
  price: string
  billsIncluded: BillsOption
  location: string
  moveImmediate: boolean
  moveInDate: string
  description: string
}

export type PostDraftPreferences = {
  languages: string[]
  diet: string | null
  householdVibe: string | null
  workPattern: string | null
  pets: string | null
  smoking: string | null
  gender: string | null
}

const defaultDetails: PostDraftDetails = {
  title: '',
  price: '',
  billsIncluded: 'excluded',
  location: '',
  moveImmediate: false,
  moveInDate: '',
  description: '',
}

const defaultPrefs: PostDraftPreferences = {
  languages: [],
  diet: null,
  householdVibe: null,
  workPattern: null,
  pets: null,
  smoking: null,
  gender: null,
}

type PostDraftStore = {
  listingType: ListingType | null
  photos: string[]
  details: PostDraftDetails
  preferences: PostDraftPreferences
  setListingType: (t: ListingType) => void
  setPhotos: (p: string[]) => void
  setDetails: (d: Partial<PostDraftDetails>) => void
  setPreferences: (p: Partial<PostDraftPreferences>) => void
  reset: () => void
}

export const usePostDraft = create<PostDraftStore>((set) => ({
  listingType: null,
  photos: [],
  details: defaultDetails,
  preferences: defaultPrefs,
  setListingType: (listingType) => set({ listingType }),
  setPhotos: (photos) => set({ photos }),
  setDetails: (d) => set((s) => ({ details: { ...s.details, ...d } })),
  setPreferences: (p) => set((s) => ({ preferences: { ...s.preferences, ...p } })),
  reset: () =>
    set({
      listingType: null,
      photos: [],
      details: defaultDetails,
      preferences: defaultPrefs,
    }),
}))
