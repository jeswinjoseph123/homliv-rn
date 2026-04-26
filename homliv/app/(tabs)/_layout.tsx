import { Tabs } from 'expo-router'
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, gradients } from '../../src/constants/colors'
import { shadows } from '../../src/constants/shadows'
import { fonts } from '../../src/constants/typography'

type TabBarIconProps = {
  name: React.ComponentProps<typeof Ionicons>['name']
  color: string
}

function TabIcon({ name, color }: TabBarIconProps) {
  return <Ionicons name={name} size={24} color={color} />
}

function PostButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.postButtonWrapper} activeOpacity={0.9}>
      <LinearGradient
        colors={gradients.coral}
        style={styles.postButton}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <Text style={styles.postIcon}>+</Text>
      </LinearGradient>
    </TouchableOpacity>
  )
}

export default function TabLayout() {
  const insets = useSafeAreaInsets()
  const tabBarHeight = 56 + insets.bottom

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          height: tabBarHeight,
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          elevation: 0,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint="light"
            style={[StyleSheet.absoluteFill, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: `${colors.ghost}40` }]}
          />
        ),
        tabBarActiveTintColor: colors.coral,
        tabBarInactiveTintColor: colors.slateBrand,
        tabBarLabelStyle: { ...(fonts.labelSm as object), marginBottom: 4 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'search' : 'search-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: '',
          tabBarButton: (props) => (
            <PostButton onPress={() => props.onPress?.({} as never)} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'chatbubble' : 'chatbubble-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: 'Me',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  postButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    marginTop: -8,
  },
  postButton: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.coral,
  },
  postIcon: {
    color: colors.surface,
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
})
