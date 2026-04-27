export type Report = {
  id: string
  reporterId: string
  reportedId: string
  reason: string
  description: string
  createdAt: Date
}

export const reports: Report[] = []
let counter = 0

export function addReport(
  reporterId: string,
  reportedId: string,
  reason: string,
  description: string,
): void {
  reports.push({ id: `r${++counter}`, reporterId, reportedId, reason, description, createdAt: new Date() })
}
