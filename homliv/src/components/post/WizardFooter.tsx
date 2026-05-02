import { useMemo } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { gradients } from '../../constants/colors'
import { fonts } from '../../constants/typography'
import { useTheme } from '../../hooks/useTheme'

type Props = {
  onBack?: () => void
  onNext?: () => void
  onNextDisabled?: () => void
  nextLabel?: string
  nextDisabled?: boolean
  showNext?: boolean
}

export function WizardFooter({
  onBack,
  onNext,
  onNextDisabled,
  nextLabel = 'Next',
  nextDisabled = false,
  showNext = true,
}: Props) {
  const insets = useSafeAreaInsets()
  const styles = useStyles()

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          style={styles.backBtn}
          hitSlop={12}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={styles.backLabel}>← Back</Text>
        </Pressable>
      ) : (
        <View style={styles.side} />
      )}

      {showNext && (
        <Pressable
          onPress={nextDisabled ? onNextDisabled : onNext}
          style={[styles.nextBtn, nextDisabled && styles.nextBtnDisabled]}
          hitSlop={12}
          accessibilityLabel={nextDisabled ? `${nextLabel} (incomplete)` : nextLabel}
          accessibilityRole="button"
        >
          <LinearGradient
            colors={gradients.coral}
            style={styles.nextGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextLabel}>{nextLabel} →</Text>
          </LinearGradient>
        </Pressable>
      )}
    </View>
  )
}

function useStyles() {
  const { colors } = useTheme()
  return useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 12,
      backgroundColor: colors.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: `${colors.ghost}40`,
    },
    side: { width: 80 },
    backBtn: { paddingVertical: 8 },
    backLabel: {
      ...(fonts.titleSm as object),
      color: colors.coral,
    },
    nextBtn: {
      borderRadius: 14,
      overflow: 'hidden',
      minWidth: 120,
    },
    nextBtnDisabled: { opacity: 0.4 },
    nextGradient: {
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    nextLabel: {
      ...(fonts.titleSm as object),
      color: '#ffffff',
    },
  }), [colors])
}
