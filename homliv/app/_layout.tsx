import { useEffect } from 'react'
import { Text } from 'react-native'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { track } from '../src/lib/analytics'
import { useSession } from '../src/hooks/useSession'

;(Text as unknown as { defaultProps?: Record<string, unknown> }).defaultProps = { allowFontScaling: true }

export default function RootLayout() {
  const router = useRouter()
  const segments = useSegments()
  const user = useSession((s) => s.user)
  const hasHydrated = useSession((s) => s.hasHydrated)

  useEffect(() => {
    track('app_opened')
  }, [])

  useEffect(() => {
    if (!hasHydrated) return
    const inAuthFlow = segments[0] === 'onboarding' || segments[0] === 'auth'
    if (!user && !inAuthFlow) {
      router.replace('/onboarding')
    }
  }, [user, hasHydrated, segments])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="listing/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="messages" options={{ presentation: 'card' }} />
          <Stack.Screen name="post" options={{ presentation: 'modal' }} />
          <Stack.Screen name="auth" options={{ presentation: 'modal' }} />
          <Stack.Screen name="me" options={{ presentation: 'card' }} />
          <Stack.Screen name="landlord" options={{ presentation: 'card' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
