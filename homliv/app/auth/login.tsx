import { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { gradients } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'
import { shadows } from '../../src/constants/shadows'
import { useTheme } from '../../src/hooks/useTheme'
import { useSession } from '../../src/hooks/useSession'
import { mockUsers } from '../../src/data/users'
import { track } from '../../src/lib/analytics'
import type { User } from '../../src/types'

type Tab = 'signin' | 'signup'

const BULLETS = [
  'Real listings, real people',
  'Verified landlords and homeowners',
  "Built for Ireland's rental generation",
]

export default function LoginScreen() {
  const { colors } = useTheme()
  const styles = useStyles()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { user, hasHydrated, setUser } = useSession()

  const [tab, setTab] = useState<Tab>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (hasHydrated && user) {
      router.replace('/')
    }
  }, [user, hasHydrated])

  const handleSignIn = () => {
    if (!email.trim()) {
      Alert.alert('Enter your email')
      return
    }
    const found = mockUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    const sessionUser = found ?? mockUsers[2]
    setUser(sessionUser)
    track('signin_completed')
    router.replace('/')
  }

  const handleSignUp = () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Enter your name and email')
      return
    }
    const newUser: User = {
      id: `u${Date.now()}`,
      name: name.trim(),
      avatar: null,
      roles: ['user'],
      verificationLevel: 'none',
      phone: phone.trim() ? `+353 ${phone.trim()}` : '',
      email: email.trim(),
      joinedAt: new Date(),
      isOnline: true,
      lastSeen: new Date(),
    }
    setUser(newUser)
    track('signup_completed')
    router.replace('/')
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.darkPanel, { paddingTop: insets.top + 24, height: 280 + insets.top }]}>
        <LinearGradient
          colors={gradients.dark}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <Text style={styles.logo}>HomLiv</Text>
        <View style={styles.bullets}>
          {BULLETS.map((b) => (
            <Text key={b} style={styles.bullet}>
              ✓ {b}
            </Text>
          ))}
        </View>
        <Text style={styles.tagline}>{"For Ireland's rental generation"}</Text>
      </View>

      <ScrollView
        style={styles.formScroll}
        contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabRow}>
          <Pressable style={styles.tabBtn} onPress={() => setTab('signin')}>
            {tab === 'signin' ? (
              <LinearGradient
                colors={gradients.coral}
                style={styles.tabActive}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.tabActiveText}>Sign In</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.tabInactiveText}>Sign In</Text>
            )}
          </Pressable>
          <Pressable style={styles.tabBtn} onPress={() => setTab('signup')}>
            {tab === 'signup' ? (
              <LinearGradient
                colors={gradients.coral}
                style={styles.tabActive}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.tabActiveText}>Sign Up</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.tabInactiveText}>Sign Up</Text>
            )}
          </Pressable>
        </View>

        {tab === 'signup' && (
          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor={colors.slateBrand}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor={colors.slateBrand}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        {tab === 'signup' && (
          <View style={styles.phoneRow}>
            <View style={styles.phonePrefix}>
              <Text style={styles.phonePrefixText}>+353</Text>
            </View>
            <TextInput
              style={[styles.input, styles.phoneInput]}
              placeholder="89 123 4567"
              placeholderTextColor={colors.slateBrand}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        )}

        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Password"
            placeholderTextColor={colors.slateBrand}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
          />
          <Pressable
            style={styles.eyeBtn}
            onPress={() => setShowPassword((v) => !v)}
            hitSlop={8}
          >
            <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
          </Pressable>
        </View>

        {tab === 'signin' && (
          <Pressable
            onPress={() => Alert.alert('Password reset', 'A reset link has been sent to your email.')}
            style={styles.forgotRow}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>
        )}

        <Pressable
          style={styles.ctaBtn}
          onPress={tab === 'signin' ? handleSignIn : handleSignUp}
        >
          <LinearGradient
            colors={gradients.coral}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.ctaText}>{tab === 'signin' ? 'Sign In' : 'Create account'}</Text>
          </LinearGradient>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable
          style={[styles.socialBtn, { ...(shadows.card as object) }]}
          onPress={() => Alert.alert('Coming soon', 'Apple Sign In is coming soon.')}
        >
          <Ionicons name="logo-apple" size={22} color={colors.ink} />
          <Text style={styles.socialText}>Continue with Apple</Text>
        </Pressable>

        <Pressable
          style={[styles.socialBtn, { ...(shadows.card as object) }]}
          onPress={() => Alert.alert('Coming soon', 'Google Sign In is coming soon.')}
        >
          <Ionicons name="logo-google" size={20} color={colors.ink} />
          <Text style={styles.socialText}>Continue with Google</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function useStyles() {
  const { colors } = useTheme()
  return useMemo(() => StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.surface },

    darkPanel: {
      height: 280,
      backgroundColor: colors.jet,
      paddingHorizontal: 24,
      paddingBottom: 24,
      justifyContent: 'space-between',
    },
    logo: {
      ...(fonts.displayMd as object),
      color: '#ffffff',
    },
    bullets: { gap: 8 },
    bullet: {
      ...(fonts.bodyMd as object),
      color: colors.whiteHigh,
    },
    tagline: {
      ...(fonts.labelMd as object),
      color: colors.whiteLow,
    },

    formScroll: { flex: 1 },
    formContent: { padding: 24, gap: 12 },

    tabRow: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceLow,
      borderRadius: 14,
      padding: 4,
      marginBottom: 8,
    },
    tabBtn: { flex: 1, borderRadius: 11, overflow: 'hidden' },
    tabActive: {
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 11,
    },
    tabActiveText: { ...(fonts.titleSm as object), color: '#ffffff' },
    tabInactiveText: {
      ...(fonts.titleSm as object),
      color: colors.slateBrand,
      textAlign: 'center',
      lineHeight: 40,
    },

    input: {
      borderWidth: 1,
      borderColor: `${colors.ghost}60`,
      borderRadius: 14,
      backgroundColor: colors.surfaceLow,
      paddingHorizontal: 16,
      paddingVertical: 16,
      ...(fonts.bodyMd as object),
      color: colors.ink,
    },
    phoneRow: { flexDirection: 'row', gap: 8 },
    phonePrefix: {
      borderWidth: 1,
      borderColor: `${colors.ghost}60`,
      borderRadius: 14,
      backgroundColor: colors.surfaceLow,
      paddingHorizontal: 14,
      justifyContent: 'center',
    },
    phonePrefixText: { ...(fonts.bodyMd as object), color: colors.slateBrand },
    phoneInput: { flex: 1 },

    passwordRow: { position: 'relative' },
    passwordInput: { paddingRight: 52 },
    eyeBtn: {
      position: 'absolute',
      right: 16,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
    },
    eyeText: { fontSize: 18 },

    forgotRow: { alignItems: 'flex-end', marginTop: -4 },
    forgotText: { ...(fonts.labelMd as object), color: colors.coral },

    ctaBtn: { borderRadius: 16, overflow: 'hidden', ...shadows.coral },
    ctaGradient: {
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ctaText: { ...(fonts.titleMd as object), color: '#ffffff' },

    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginVertical: 4,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: `${colors.ghost}50` },
    dividerText: { ...(fonts.bodySm as object), color: colors.slateBrand },

    socialBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: colors.surface,
      borderRadius: 14,
      height: 52,
      borderWidth: 1,
      borderColor: `${colors.ghost}40`,
    },
    socialText: { ...(fonts.titleSm as object), color: colors.ink },
  }), [colors])
}
