export const lightColors = {
  jet:        '#2d3142',
  slateBrand: '#4f5d75',
  coral:      '#ef8354',
  coralDark:  '#9c441a',
  surface:    '#fafafa',
  surfaceLow: '#f5f5f7',
  ink:        '#1d1d1f',
  ghost:      '#dcc1b7',
  green:      '#16a34a',
  greenBg:    '#f0fdf4',
  red:        '#dc2626',
  redBg:      '#fef2f2',
  amber:      '#f59e0b',
  amberBg:    '#fffbeb',
  whiteHigh:  'rgba(255,255,255,0.85)',
  whiteMid:   'rgba(255,255,255,0.70)',
  whiteLow:   'rgba(255,255,255,0.55)',
} as const

export const darkColors = {
  jet:        '#e5e5e7',
  slateBrand: '#8e8e93',
  coral:      '#ef8354',
  coralDark:  '#9c441a',
  surface:    '#000000',
  surfaceLow: '#1c1c1e',
  ink:        '#f2f2f7',
  ghost:      '#38383a',
  green:      '#34d058',
  greenBg:    '#0d2a15',
  red:        '#ff453a',
  redBg:      '#2d1010',
  amber:      '#ffd60a',
  amberBg:    '#2d2208',
  whiteHigh:  'rgba(255,255,255,0.85)',
  whiteMid:   'rgba(255,255,255,0.70)',
  whiteLow:   'rgba(255,255,255,0.55)',
} as const

export type ColorTokens = { [K in keyof typeof lightColors]: string }

// Re-export as `colors` so files not yet migrated still compile
export const colors = lightColors

export const gradients = {
  coral: ['#d47550', '#b85530'] as const,
  ring:  ['#ef8354', '#9c441a'] as const,
  dark:  ['#1a1c2e', '#0f1018'] as const,
  slate: ['#4f5d75', '#3d4d63'] as const,
} as const
