export type MockTenancy = {
  id: string
  tenantId: string
  landlordId: string
  listingId: string
  address: string
  rent: number
  leaseStart: Date
  leaseEnd: Date
}

export const mockTenancy: MockTenancy = {
  id: 't1',
  tenantId: 'u3',
  landlordId: 'u6',
  listingId: 'l5',
  address: '3-bed house, Clontarf, Dublin 3',
  rent: 2800,
  leaseStart: new Date('2025-10-01'),
  leaseEnd: new Date('2026-09-30'),
}
