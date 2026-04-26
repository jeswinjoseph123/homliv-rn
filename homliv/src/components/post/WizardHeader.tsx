import { useEffect } from 'react'
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { colors, gradients } from '../../constants/colors'
import { fonts } from '../../constants/typography'

type Props = {
  step: 1 | 2 | 3 | 4
  title: string
  onClose: () => void
  onNext?: () => void
  nextLabel?: string
  nextDisabled?: boolean
  showNext?: boolean
}

function StepDot({ dotIndex, currentStep }: { dotIndex: number; currentStep: number }) {
  const isActive = dotIndex === currentStep - 1
  const isDone = dotIndex < currentStep - 1

  if (isActive) return <View style={styles.dotActive} />
  if (isDone) return <View style={styles.dotDone} />
  return <View style={styles.dotPending} />
}

export function WizardHeader({
  step,
  title,
  onClose,
  onNext,
  nextLabel = 'Next',
  nextDisabled = false,
  showNext = true,
}: Props) {
  const { width } = useWindowDimensions()
  const progressWidth = useSharedValue((step / 4) * width)

  useEffect(() => {
    progressWidth.value = withTiming((step / 4) * width, { duration: 350 })
  }, [step, width])

  const progressStyle = useAnimatedStyle(() => ({
    width: progressWidth.value,
  }))

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
          <Text style={styles.closeIcon}>✕</Text>
        </Pressable>

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {showNext && onNext ? (
          <Pressable
            onPress={nextDisabled ? undefined : onNext}
            style={styles.nextBtn}
            hitSlop={12}
          >
            <Text style={[styles.nextLabel, nextDisabled && styles.nextDisabled]}>
              {nextLabel} →
            </Text>
          </Pressable>
        ) : (
          <View style={styles.nextBtn} />
        )}
      </View>

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, progressStyle]}>
          <LinearGradient
            colors={gradients.coral}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </Animated.View>
      </View>

      <View style={styles.dotsRow}>
        {[0, 1, 2, 3].map((i) => (
          <StepDot key={i} dotIndex={i} currentStep={step} />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${colors.ghost}40`,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 52,
  },
  closeBtn: {
    width: 44,
    alignItems: 'flex-start',
  },
  closeIcon: {
    ...(fonts.titleMd as object),
    color: colors.ink,
  },
  title: {
    ...(fonts.titleMd as object),
    color: colors.ink,
    flex: 1,
    textAlign: 'center',
  },
  nextBtn: {
    width: 56,
    alignItems: 'flex-end',
  },
  nextLabel: {
    ...(fonts.titleSm as object),
    color: colors.coral,
  },
  nextDisabled: {
    opacity: 0.4,
  },
  progressTrack: {
    height: 3,
    backgroundColor: `${colors.ghost}30`,
  },
  progressFill: {
    height: 3,
    overflow: 'hidden',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  dotActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.coral,
  },
  dotDone: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.green,
  },
  dotPending: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: `${colors.ghost}80`,
  },
})
