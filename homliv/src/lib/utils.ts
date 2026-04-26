export function formatPrice(amount: number): string {
  return `€${amount.toLocaleString('en-IE')}/mo`
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function maskPhone(str: string): string {
  return str.replace(/(\+353\s?\d{2})\s?\d{3}\s?\d{4}/, '$1 *** ****')
}

export function maskIBAN(str: string): string {
  return str.replace(/(IE\d{2}[A-Z]{4})\d{14}/, '$1**************')
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}
