import { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/typography'
import { getInitials } from '../../lib/utils'
import type { User } from '../../types'

type Props = {
  otherUser: User
  onBack: () => void
  onBlock: () => void
  onReport: () => void
}

function formatLastSeen(lastSeen: Date): string {
  const diffMs = Date.now() - lastSeen.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `Last seen ${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `Last seen ${diffHours}h ago`
  return `Last seen ${Math.floor(diffHours / 24)}d ago`
}

export function ChatHeader({ otherUser, onBack, onBlock, onReport }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const translateY = useSharedValue(300)
  const opacity = useSharedValue(0)

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const openMenu = () => {
    setMenuOpen(true)
    translateY.value = withTiming(0, { duration: 250 })
    opacity.value = withTiming(1, { duration: 200 })
  }

  const closeMenu = () => {
    translateY.value = withTiming(300, { duration: 200 })
    opacity.value = withTiming(0, { duration: 150 })
    setTimeout(() => setMenuOpen(false), 220)
  }

  const handleBlock = () => {
    closeMenu()
    setTimeout(onBlock, 250)
  }

  const handleReport = () => {
    closeMenu()
    setTimeout(onReport, 250)
  }

  return (
    <>
      <BlurView intensity={80} tint="light" style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={24} color={colors.jet} />
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            {otherUser.avatar ? null : (
              <Text style={styles.avatarText}>{getInitials(otherUser.name)}</Text>
            )}
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.name} numberOfLines={1}>{otherUser.name}</Text>
            {otherUser.isOnline ? (
              <Text style={styles.online}>Online</Text>
            ) : (
              <Text style={styles.lastSeen}>{formatLastSeen(otherUser.lastSeen)}</Text>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="call-outline" size={22} color={colors.jet} />
          </TouchableOpacity>
          <TouchableOpacity onPress={openMenu} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="ellipsis-horizontal" size={22} color={colors.jet} />
          </TouchableOpacity>
        </View>
      </BlurView>

      {menuOpen && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {/* Dim backdrop */}
          <Animated.View style={[styles.backdrop, overlayStyle]} pointerEvents="auto">
            <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu} />
          </Animated.View>

          {/* Action sheet panel */}
          <Animated.View style={[styles.panel, panelStyle]} pointerEvents="auto">
            <View style={styles.handle} />

            {[
              { label: 'View profile', icon: 'person-outline', onPress: closeMenu },
              { label: 'Mute', icon: 'notifications-off-outline', onPress: closeMenu },
              { label: 'Block user', icon: 'ban-outline', onPress: handleBlock },
              { label: 'Report user', icon: 'flag-outline', onPress: handleReport },
            ].map((item) => (
              <Pressable key={item.label} style={styles.menuItem} onPress={item.onPress}>
                <Ionicons name={item.icon as never} size={20} color={colors.jet} />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </Animated.View>
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${colors.ghost}40`,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.slateBrand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...(fonts.labelMd as object),
    color: 'white',
  },
  nameBlock: {
    flex: 1,
  },
  name: {
    ...(fonts.titleSm as object),
    color: colors.jet,
  },
  online: {
    ...(fonts.labelSm as object),
    color: colors.green,
  },
  lastSeen: {
    ...(fonts.labelSm as object),
    color: colors.slateBrand,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: `${colors.ghost}99`,
    alignSelf: 'center',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${colors.ghost}30`,
  },
  menuLabel: {
    ...(fonts.bodyMd as object),
    color: colors.ink,
  },
})
