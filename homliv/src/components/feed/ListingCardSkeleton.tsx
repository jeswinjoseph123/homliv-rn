import { useEffect, useMemo } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { useTheme } from '../../hooks/useTheme'

function SkeletonBox({ style }: { style: object }) {
  const styles = useStyles()
  const opacity = useSharedValue(0.3)

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.8, { duration: 800 }), -1, true)
  }, [opacity])

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return <Animated.View style={[styles.base, style, animStyle]} />
}

export function ListingCardSkeleton() {
  const styles = useStyles()
  return (
    <View style={styles.card}>
      <SkeletonBox style={styles.image} />
      <View style={styles.body}>
        <View style={styles.posterRow}>
          <SkeletonBox style={styles.avatar} />
          <View style={styles.nameBlock}>
            <SkeletonBox style={styles.nameLine} />
            <SkeletonBox style={styles.timeLine} />
          </View>
        </View>
        <SkeletonBox style={styles.titleLine} />
        <SkeletonBox style={styles.locationLine} />
        <View style={styles.tagsRow}>
          <SkeletonBox style={styles.tag} />
          <SkeletonBox style={styles.tag} />
          <SkeletonBox style={styles.tag} />
        </View>
      </View>
    </View>
  )
}

function useStyles() {
  const { colors } = useTheme()
  return useMemo(() => StyleSheet.create({
    card: { backgroundColor: colors.surface, borderRadius: 24, overflow: 'hidden' },
    image: { height: 220, margin: 10, borderRadius: 20 },
    body: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
    posterRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    avatar: { width: 32, height: 32, borderRadius: 10 },
    nameBlock: { flex: 1, gap: 6 },
    nameLine: { height: 12, width: '60%', borderRadius: 6 },
    timeLine: { height: 10, width: '40%', borderRadius: 5 },
    titleLine: { height: 14, width: '80%', borderRadius: 7 },
    locationLine: { height: 12, width: '55%', borderRadius: 6 },
    tagsRow: { flexDirection: 'row', gap: 8 },
    tag: { height: 24, width: 80, borderRadius: 8 },
    base: { backgroundColor: colors.surfaceLow },
  }), [colors])
}
