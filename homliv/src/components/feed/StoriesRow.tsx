import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { colors, gradients } from '../../constants/colors'
import { fonts } from '../../constants/typography'
import { track } from '../../lib/analytics'
import { mockListings } from '../../data/listings'
import type { Listing } from '../../types'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'

const recentListings = [...mockListings]
  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  .slice(0, 7)

function StoryItem({ listing }: { listing: Listing }) {
  const router = useRouter()
  const seenProgress = useSharedValue(0)

  const gradientStyle = useAnimatedStyle(() => ({
    opacity: interpolate(seenProgress.value, [0, 1], [1, 0]),
  }))

  const ghostStyle = useAnimatedStyle(() => ({
    opacity: interpolate(seenProgress.value, [0, 1], [0, 0.4]),
  }))

  const handlePress = () => {
    seenProgress.value = withTiming(1, { duration: 300 })
    router.push(`/listing/${listing.id}`)
    track('story_tapped', { listingId: listing.id })
  }

  const photo = listing.photos[0] ?? PLACEHOLDER

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85} style={styles.storyWrapper}>
      <View style={styles.ringContainer}>
        {/* Gradient ring — unseen state */}
        <Animated.View style={[StyleSheet.absoluteFill, gradientStyle]}>
          <LinearGradient
            colors={gradients.ring}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
          />
        </Animated.View>
        {/* Ghost border — seen state */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: 20, borderWidth: 2, borderColor: colors.ghost },
            ghostStyle,
          ]}
        />
        {/* Image with white inner border */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: photo }}
            contentFit="cover"
            cachePolicy="memory-disk"
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.priceChip}>
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <Text style={styles.priceText}>€{listing.price}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.storyName} numberOfLines={1}>
        {listing.title.split(' ').slice(0, 2).join(' ')}
      </Text>
    </TouchableOpacity>
  )
}

export function StoriesRow() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>🔥 Last 24 hours near you</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {recentListings.map((listing) => (
          <StoryItem key={listing.id} listing={listing} />
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  section: { marginTop: 8 },
  sectionLabel: {
    ...(fonts.labelMd as object),
    color: colors.slateBrand,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  storyWrapper: {
    alignItems: 'center',
    width: 68,
  },
  ringContainer: {
    width: 68,
    height: 68,
    borderRadius: 20,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: 3,
    bottom: 3,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: 'white',
  },
  priceChip: {
    position: 'absolute',
    bottom: 3,
    left: 3,
    right: 3,
    height: 16,
    borderRadius: 5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceText: {
    fontSize: 9,
    fontWeight: '700',
    color: 'white',
    zIndex: 1,
  },
  storyName: {
    ...(fonts.bodySm as object),
    fontSize: 10,
    color: colors.slateBrand,
    marginTop: 6,
    maxWidth: 68,
    textAlign: 'center',
  },
})
