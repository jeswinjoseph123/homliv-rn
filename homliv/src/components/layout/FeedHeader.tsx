import { useMemo } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../hooks/useTheme'
import { fonts } from '../../constants/typography'

type Props = {
  hasUnread?: boolean
  onBellPress?: () => void
  onSearchPress?: () => void
}

export function FeedHeader({ hasUnread = false, onBellPress, onSearchPress }: Props) {
  const { colors } = useTheme()
  const styles = useStyles()
  return (
    <View style={styles.wrapper}>
      <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.inner}>
        <Text style={styles.logo}>
          <Text style={styles.logoHom}>Hom</Text>
          <Text style={styles.logoLiv}>Liv</Text>
        </Text>
        <View style={styles.actions}>
          <Pressable onPress={onBellPress} style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={20} color={colors.jet} />
            {hasUnread && <View style={styles.redDot} />}
          </Pressable>
          <Pressable onPress={onSearchPress} style={styles.iconBtn}>
            <Ionicons name="search-outline" size={20} color={colors.jet} />
          </Pressable>
        </View>
      </View>
    </View>
  )
}

function useStyles() {
  const { colors } = useTheme()
  return useMemo(() => StyleSheet.create({
    wrapper: { height: 56, overflow: 'hidden' },
    inner: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
    },
    logo: { ...(fonts.titleLg as object) },
    logoHom: { color: colors.ink },
    logoLiv: { color: colors.coral },
    actions: { flexDirection: 'row', gap: 8 },
    iconBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.surfaceLow,
      alignItems: 'center',
      justifyContent: 'center',
    },
    redDot: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.red,
      borderWidth: 1.5,
      borderColor: colors.surface,
    },
  }), [colors])
}
