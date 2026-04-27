import { Stack } from 'expo-router'

export default function MeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="listings" />
      <Stack.Screen name="saved" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="settings/notifications" />
      <Stack.Screen name="settings/blocked" />
    </Stack>
  )
}
