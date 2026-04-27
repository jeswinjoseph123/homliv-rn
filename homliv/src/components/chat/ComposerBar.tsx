import { useState, useRef, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import { colors, gradients } from '../../constants/colors'
import { fonts } from '../../constants/typography'

const IRISH_PHONE = /(\+353|0)\s?[1-9]\d{1,2}\s?\d{3}\s?\d{3,4}/
const IRISH_IBAN = /IE\d{2}[A-Z]{4}\d{14}/

type Props = {
  disabled?: boolean
  disabledMessage?: string
  onSend: (text: string) => void
  onAttachPress: () => void
  onScamWarning: (text: string, onProceed: () => void) => void
  paddingBottom?: number
}

export function ComposerBar({
  disabled = false,
  disabledMessage,
  onSend,
  onAttachPress,
  onScamWarning,
  paddingBottom = 0,
}: Props) {
  const [text, setText] = useState('')
  const inputRef = useRef<TextInput>(null)

  const canSend = text.trim().length > 0 && !disabled

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return

    const hasScamContent = IRISH_PHONE.test(trimmed) || IRISH_IBAN.test(trimmed)
    if (hasScamContent) {
      onScamWarning(trimmed, () => {
        onSend(trimmed)
        setText('')
      })
      return
    }

    onSend(trimmed)
    setText('')
  }, [text, disabled, onSend, onScamWarning])

  if (disabled && disabledMessage) {
    return (
      <View style={[styles.disabledContainer, { paddingBottom }]}>
        <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        <Text style={styles.disabledText}>{disabledMessage}</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { paddingBottom }]}>
      <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.row}>
        <Pressable
          onPress={onAttachPress}
          style={styles.attachBtn}
          hitSlop={8}
          accessibilityLabel="Add attachment"
          accessibilityRole="button"
        >
          <Text style={styles.attachIcon}>+</Text>
        </Pressable>

        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={setText}
          placeholder="Message…"
          placeholderTextColor={colors.slateBrand}
          multiline
          maxLength={1000}
          style={styles.input}
          returnKeyType="default"
          blurOnSubmit={false}
        />

        <Pressable
          onPress={handleSend}
          style={styles.sendBtn}
          accessibilityLabel="Send message"
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSend }}
        >
          {canSend ? (
            <LinearGradient
              colors={gradients.coral}
              style={styles.sendGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="arrow-up" size={18} color="#ffffff" />
            </LinearGradient>
          ) : (
            <View style={styles.sendDisabled}>
              <Ionicons name="arrow-up" size={18} color={colors.ghost} />
            </View>
          )}
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: `${colors.ghost}30`,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  attachBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachIcon: {
    ...(fonts.titleLg as object),
    color: colors.slateBrand,
    lineHeight: 28,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceLow,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 11 : 8,
    fontSize: 15,
    color: colors.ink,
    maxHeight: 120,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    overflow: 'hidden',
  },
  sendGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    flex: 1,
    backgroundColor: `${colors.ghost}40`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: `${colors.ghost}30`,
    overflow: 'hidden',
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  disabledText: {
    ...(fonts.bodySm as object),
    color: colors.slateBrand,
    textAlign: 'center',
  },
})
