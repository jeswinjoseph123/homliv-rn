import { Stack } from 'expo-router'

export default function MessagesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[threadId]" />
      <Stack.Screen name="viewing" options={{ presentation: 'modal' }} />
      <Stack.Screen name="maintenance" options={{ presentation: 'modal' }} />
    </Stack>
  )
}
