import { Tabs } from 'expo-router'
import { useTheme } from '../../src/hooks/useTheme'
import { useRequireAuth } from '../../src/hooks/useRequireAuth'

export default function LandlordLayout() {
  useRequireAuth({ requireLandlord: true })
  const { colors } = useTheme()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.coral,
        tabBarInactiveTintColor: colors.slateBrand,
        tabBarStyle: { backgroundColor: colors.surface },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Overview' }} />
      <Tabs.Screen name="properties" options={{ title: 'Properties' }} />
      <Tabs.Screen name="tenants" options={{ title: 'Tenants' }} />
      <Tabs.Screen name="maintenance" options={{ title: 'Maintenance' }} />
      <Tabs.Screen name="payments" options={{ title: 'Payments' }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages' }} />
    </Tabs>
  )
}
