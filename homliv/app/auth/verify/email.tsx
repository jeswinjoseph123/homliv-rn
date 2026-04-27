import { useState, useRef, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { colors } from '../../../src/constants/colors'
import { fonts } from '../../../src/constants/typography'
import { useSession } from '../../../src/hooks/useSession'
import { track } from '../../../src/lib/analytics'

const CODE_LENGTH = 6

export default function VerifyEmailScreen() {
  const router = useRouter()
  const { user, setUser } = useSession()
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [secondsLeft, setSecondsLeft] = useState(60)
  const inputRefs = useRef<(TextInput | null)[]>(Array(CODE_LENGTH).fill(null))

  useEffect(() => {
    if (secondsLeft <= 0) return
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secondsLeft])

  const handleConfirm = useCallback(() => {
    if (!user) return
    setUser({ ...user, verificationLevel: 'contact' })
    track('email_verified')
    router.canGoBack() ? router.back() : router.replace('/')
  }, [user, setUser, router])

  const handleChange = useCallback(
    (text: string, index: number) => {
      const digit = text.replace(/[^0-9]/g, '').slice(-1)
      const next = [...digits]
      next[index] = digit
      setDigits(next)

      if (digit && index < CODE_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus()
      }
      if (digit && index === CODE_LENGTH - 1 && next.every((d) => d !== '')) {
        handleConfirm()
      }
    },
    [digits, handleConfirm],
  )

  const handleKeyPress = useCallback(
    (key: string, index: number) => {
      if (key === 'Backspace' && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    },
    [digits],
  )

  const maskedEmail = user?.email
    ? user.email.replace(/^(.{2})(.+)(@.+)$/, (_, a, _b, c) => `${a}***${c}`)
    : 'your email'

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
          hitSlop={8}
        >
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.icon}>✉️</Text>
        <Text style={styles.heading}>Check your inbox</Text>
        <Text style={styles.sub}>We sent a 6-digit code to {maskedEmail}</Text>

        <View style={styles.otpRow}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={(r) => { inputRefs.current[i] = r }}
              style={[styles.otpBox, d ? styles.otpBoxFilled : null]}
              value={d}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <Pressable
          onPress={() => {
            if (secondsLeft > 0) return
            setSecondsLeft(60)
            Alert.alert('Code resent', 'A new code has been sent to your inbox.')
          }}
          style={styles.resendBtn}
        >
          <Text style={[styles.resendText, secondsLeft > 0 && styles.resendDisabled]}>
            {secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : 'Resend code'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: 20, paddingVertical: 12 },
  back: { ...(fonts.titleSm as object), color: colors.coral },

  body: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
    gap: 16,
  },
  icon: { fontSize: 64 },
  heading: { ...(fonts.displayMd as object), color: colors.jet, textAlign: 'center' },
  sub: { ...(fonts.bodyMd as object), color: colors.slateBrand, textAlign: 'center' },

  otpRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: `${colors.ghost}80`,
    backgroundColor: colors.surfaceLow,
    textAlign: 'center',
    ...(fonts.titleLg as object),
    color: colors.ink,
  },
  otpBoxFilled: {
    borderColor: colors.coral,
    backgroundColor: colors.surface,
  },

  resendBtn: { marginTop: 8 },
  resendText: { ...(fonts.labelMd as object), color: colors.coral },
  resendDisabled: { color: colors.slateBrand },
})
