import { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../../hooks/useTheme'
import { fonts } from '../../constants/typography'
import type { VerificationLevel } from '../../types'

type Props = { level: VerificationLevel; compact?: boolean }

export function VerificationBadge({ level, compact }: Props) {
  const { colors } = useTheme()
  const styles = useStyles()

  const BADGE_CONFIG = {
    none:      { text: 'Unverified poster',    bg: colors.surfaceLow, color: colors.slateBrand },
    contact:   { text: 'Contact-verified',     bg: colors.amberBg,    color: colors.amber      },
    homeowner: { text: '✓ Verified homeowner', bg: colors.greenBg,    color: colors.green      },
    landlord:  { text: '✓ Verified landlord',  bg: colors.greenBg,    color: colors.green      },
  } as const

  const { text, bg, color } = BADGE_CONFIG[level]
  return (
    <View style={[styles.badge, compact && styles.compact, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color }]}>{text}</Text>
    </View>
  )
}

function useStyles() {
  const { colors } = useTheme()
  return useMemo(() => StyleSheet.create({
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 20,
      alignSelf: 'flex-start',
    },
    compact: { paddingHorizontal: 6, paddingVertical: 2 },
    label: { ...(fonts.labelSm as object) },
  }), [colors])
}
