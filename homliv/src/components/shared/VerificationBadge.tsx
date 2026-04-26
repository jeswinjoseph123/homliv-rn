import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/typography'
import type { VerificationLevel } from '../../types'

type Props = { level: VerificationLevel }

const BADGE_CONFIG = {
  none:      { text: 'Unverified poster',    bg: colors.surfaceLow, color: colors.slateBrand },
  contact:   { text: 'Contact-verified',     bg: colors.amberBg,    color: colors.amber      },
  homeowner: { text: '✓ Verified homeowner', bg: colors.greenBg,    color: colors.green      },
  landlord:  { text: '✓ Verified landlord',  bg: colors.greenBg,    color: colors.green      },
} as const

export function VerificationBadge({ level }: Props) {
  const { text, bg, color } = BADGE_CONFIG[level]
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color }]}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  label: { ...(fonts.labelSm as object) },
})
