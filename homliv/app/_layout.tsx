import { useEffect, useRef } from 'react'
import { Text, StyleSheet } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated'
import { track } from '../src/lib/analytics'
import { useTheme, useThemeStore } from '../src/hooks/useTheme'

;(Text as unknown as { defaultProps?: Record<string, unknown> }).defaultProps = { allowFontScaling: true }

function ThemeCrossfade() {
  const { isDark } = useTheme()
  const overlayOpacity = useSharedValue(0)
  const prevIsDark = useRef(isDark)

  useEffect(() => {
    if (prevIsDark.current === isDark) return
    prevIsDark.current = isDark
    overlayOpacity.value = withTiming(1, { duration: 150 }, () => {
      overlayOpacity.value = withTiming(0, { duration: 150 })
    })
  }, [isDark, overlayOpacity])

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }))

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.overlay, overlayStyle]}
    />
  )
}

export default function RootLayout() {
  const { isDark } = useTheme()
  // Subscribe to mode for crossfade trigger
  useThemeStore()

  useEffect(() => {
    track('app_opened')
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
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
        <ThemeCrossfade />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: '#000',
    zIndex: 9999,
  },
})
