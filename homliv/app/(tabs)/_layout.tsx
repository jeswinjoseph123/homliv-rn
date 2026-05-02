import { Redirect } from 'expo-router'
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs'
import { View } from 'react-native'
import { useSession } from '../../src/hooks/useSession'
import { useTheme } from '../../src/hooks/useTheme'

export default function TabLayout() {
  const user = useSession((s) => s.user)
  const hasHydrated = useSession((s) => s.hasHydrated)
  const { colors } = useTheme()

  if (!hasHydrated) return <View style={{ flex: 1, backgroundColor: colors.surface }} />

  if (!user) return <Redirect href="/onboarding" />

  return (
    <NativeTabs tintColor={colors.coral}>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'house', selected: 'house.fill' }} />
        <Label>Feed</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search">
        <Icon sf={{ default: 'magnifyingglass', selected: 'magnifyingglass.circle.fill' }} />
        <Label>Search</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="post">
        <Icon sf={{ default: 'plus.circle', selected: 'plus.circle.fill' }} />
        <Label>Post</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="messages">
        <Icon sf={{ default: 'message', selected: 'message.fill' }} />
        <Label>Messages</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="me">
        <Icon sf={{ default: 'person', selected: 'person.fill' }} />
        <Label>Me</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
