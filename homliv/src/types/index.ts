export type VerificationLevel =
  | 'none'
  | 'contact'
  | 'homeowner'
  | 'landlord'

export type ListingType =
  | 'owner_occupier'
  | 'landlord'
  | 'housemate'

export type User = {
  id: string
  name: string
  avatar: string | null
  roles: ('user' | 'owner_occupier' | 'landlord')[]
  verificationLevel: VerificationLevel
  phone: string
  email: string
  joinedAt: Date
  isOnline: boolean
  lastSeen: Date
}

export type Listing = {
  id: string
  posterId: string
  listingType: ListingType
  title: string
  description: string
  price: number
  billsIncluded: boolean
  location: string
  eircode: string
  area: string
  coordinates: { lat: number; lng: number }
  photos: string[]
  roomType: 'single' | 'double' | 'shared' | 'whole_property'
  bedrooms: number
  bathrooms: number
  berRating: string
  moveInDate: Date | 'immediate'
  expiresAt: Date
  createdAt: Date
  preferences: {
    gender?: 'female' | 'male' | 'no_preference'
    diet?: 'vegetarian' | 'vegan' | 'halal' | 'none'
    languages?: string[]
    householdVibe?: 'quiet' | 'social' | 'mixed'
    workPattern?: 'standard' | 'night_shifts' | 'remote'
    pets?: 'cats' | 'dogs' | 'welcome' | 'none'
    smoking?: 'inside' | 'outside' | 'none'
  } | null
  tags: string[]
  likes: number
  views: number
  isRPZ: boolean
}

export type MessageType =
  | 'text'
  | 'maintenance'
  | 'viewing_request'
  | 'viewing_confirmed'
  | 'status'

export type Message = {
  id: string
  conversationId: string
  senderId: string
  type: MessageType
  text?: string
  maintenanceData?: {
    category: string
    priority: 'low' | 'medium' | 'high'
    description: string
    photos: string[]
    status: 'open' | 'in_progress' | 'resolved'
  }
  viewingData?: {
    slots: Date[]
    confirmedSlot?: Date
    note?: string
  }
  createdAt: Date
  readAt?: Date
}

export type Conversation = {
  id: string
  listingId: string
  participantIds: string[]
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export type MaintenanceRequest = {
  id: string
  conversationId: string
  propertyId: string
  tenantId: string
  category: string
  priority: 'low' | 'medium' | 'high'
  description: string
  photos: string[]
  status: 'open' | 'in_progress' | 'resolved'
  createdAt: Date
  updatedAt: Date
}

export type SavedSearch = {
  id: string
  name: string
  filters: {
    type?: string
    maxPrice?: number
    area?: string
    tags?: string[]
  }
  notify: boolean
  newResultCount: number
  createdAt: Date
}
