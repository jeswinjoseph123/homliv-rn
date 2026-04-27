import { useEffect } from 'react'
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/typography'

type Props = {
  visible: boolean
  hasListingContext: boolean
  hasTenancyContext: boolean
  onClose: () => void
  onPhoto: () => void
  onViewingRequest: () => void
  onMaintenanceReport: () => void
  onLocation: () => void
  onDocument: () => void
}

type Option = {
  icon: string
  label: string
  onPress: () => void
  show: boolean
}

export function AttachmentSheet({
  visible,
  hasListingContext,
  hasTenancyContext,
  onClose,
  onPhoto,
  onViewingRequest,
  onMaintenanceReport,
  onLocation,
  onDocument,
}: Props) {
  const translateY = useSharedValue(400)
  const opacity = useSharedValue(0)

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 })
      translateY.value = withSpring(0, { damping: 22, stiffness: 300 })
    } else {
      opacity.value = withTiming(0, { duration: 150 })
      translateY.value = withTiming(400, { duration: 200 })
    }
  }, [visible])

  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))
  const panelStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }))

  const options: Option[] = [
    { icon: '📷', label: 'Photo', onPress: onPhoto, show: true },
    { icon: '📅', label: 'Request a viewing', onPress: onViewingRequest, show: hasListingContext },
    { icon: '🔧', label: 'Report maintenance', onPress: onMaintenanceReport, show: hasTenancyContext },
    { icon: '📍', label: 'Share location', onPress: onLocation, show: true },
    { icon: '📄', label: 'Send document', onPress: onDocument, show: true },
  ].filter((o) => o.show)

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.panel, panelStyle]}>
          <View style={styles.handle} />
          {options.map((opt) => (
            <Pressable
              key={opt.label}
              onPress={opt.onPress}
              style={styles.optionRow}
            >
              <View style={styles.optionIcon}>
                <Text style={styles.optionEmoji}>{opt.icon}</Text>
              </View>
              <Text style={styles.optionLabel}>{opt.label}</Text>
            </Pressable>
          ))}
          <View style={styles.bottomPad} />
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: `${colors.ghost}80`,
    alignSelf: 'center',
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    height: 56,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionEmoji: { fontSize: 20 },
  optionLabel: {
    ...(fonts.bodyMd as object),
    color: colors.ink,
  },
  bottomPad: { height: 32 },
})
