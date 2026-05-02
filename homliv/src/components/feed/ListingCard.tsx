import { memo, useMemo } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { gradients } from '../../constants/colors'
import { useTheme } from '../../hooks/useTheme'
import { fonts } from '../../constants/typography'
import { shadows } from '../../constants/shadows'
import { VerificationBadge } from '../shared/VerificationBadge'
import { useSaved } from '../../hooks/useSaved'
import { track } from '../../lib/analytics'
import { formatPrice, timeAgo, getInitials } from '../../lib/utils'
import { mockUsers } from '../../data/users'
import type { Listing } from '../../types'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
const AMBER_TAGS = new Set(['Bills included', 'RPZ', 'Expiring soon'])

type Props = {
  listing: Listing
  onMessage?: () => void
}

export const ListingCard = memo(function ListingCard({ listing, onMessage }: Props) {
  const { colors } = useTheme()
  const styles = useStyles()
  const router = useRouter()
  const saved = useSaved((s) => s.savedIds.has(listing.id))
  const toggle = useSaved((s) => s.toggle)
  const poster = mockUsers.find((u) => u.id === listing.posterId) ?? mockUsers[0]

  const scale = useSharedValue(1)
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const onPressIn = () => { scale.value = withSpring(0.98, { damping: 15 }) }
  const onPressOut = () => { scale.value = withSpring(1, { damping: 15 }) }
  const onCardPress = () => {
    router.push(`/listing/${listing.id}`)
    track('listing_viewed', { listingId: listing.id })
  }

  const onSavePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    toggle(listing.id)
    if (!saved) track('listing_saved', { listingId: listing.id })
  }

  const onMessagePress = () => {
    if (onMessage) { onMessage() } else { router.push(`/listing/${listing.id}`) }
  }

  const photo = listing.photos[0] ?? PLACEHOLDER

  return (
    <Pressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onCardPress}
      accessibilityLabel={`${listing.title}, ${formatPrice(listing.price)} per month, ${listing.location}`}
      accessibilityRole="button"
      accessibilityHint="Opens listing details"
    >
      <Animated.View style={[styles.card, cardStyle]}>
        <View style={styles.imageArea}>
          <Image
            source={{ uri: photo }}
            contentFit="cover"
            cachePolicy="memory-disk"
            style={StyleSheet.absoluteFill}
            accessibilityLabel={listing.title}
          />
          <View style={styles.topLeft}>
            <VerificationBadge level={poster.verificationLevel} />
            <View style={styles.timeChip}>
              <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
              <Text style={styles.timeText}>{timeAgo(listing.createdAt)}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={onSavePress}
            style={styles.saveBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={saved ? 'Remove from saved' : 'Save listing'}
            accessibilityRole="button"
            accessibilityState={{ selected: saved }}
          >
            <Ionicons
              name={saved ? 'heart' : 'heart-outline'}
              size={18}
              color={saved ? colors.coral : colors.ink}
            />
          </TouchableOpacity>
          <Text style={styles.price}>{formatPrice(listing.price)}</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.posterRow}>
            <View style={styles.avatar} accessibilityElementsHidden>
              <Text style={styles.avatarText}>{getInitials(poster.name)}</Text>
            </View>
            <View style={styles.posterInfo}>
              <Text style={styles.posterName} numberOfLines={1}>{poster.name}</Text>
              <Text style={styles.posterTime}>{timeAgo(listing.createdAt)}</Text>
            </View>
            <TouchableOpacity
              onPress={onMessagePress}
              style={styles.messageBtn}
              accessibilityLabel={`Message ${poster.name}`}
              accessibilityRole="button"
            >
              <LinearGradient
                colors={gradients.coral}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
              />
              <Text style={styles.messageBtnText}>Message</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title} numberOfLines={2}>{listing.title}</Text>
          <Text style={styles.location}>📍 {listing.location}</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsContent}
            accessibilityElementsHidden
          >
            {listing.tags.map((tag) => {
              const isAmber = AMBER_TAGS.has(tag)
              return (
                <View
                  key={tag}
                  style={[styles.tag, { backgroundColor: isAmber ? colors.amberBg : colors.greenBg }]}
                >
                  <Text style={[styles.tagText, { color: isAmber ? colors.amber : colors.green }]}>
                    {tag}
                  </Text>
                </View>
              )
            })}
          </ScrollView>

          <View style={styles.divider} />

          <View style={styles.actionRow}>
            <View style={styles.stats}>
              <View style={styles.stat} accessibilityElementsHidden>
                <Ionicons name="heart-outline" size={14} color={colors.slateBrand} />
                <Text style={styles.statText}>{listing.likes}</Text>
              </View>
              <View style={styles.stat} accessibilityElementsHidden>
                <Ionicons name="eye-outline" size={14} color={colors.slateBrand} />
                <Text style={styles.statText}>{listing.views}</Text>
              </View>
              <TouchableOpacity
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Share listing"
                accessibilityRole="button"
              >
                <Ionicons name="share-outline" size={16} color={colors.slateBrand} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={onCardPress} accessibilityLabel="View listing details" accessibilityRole="button">
              <Text style={styles.viewDetailsText}>View details →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  )
})

function useStyles() {
  const { colors } = useTheme()
  return useMemo(() => StyleSheet.create({
    card: { backgroundColor: colors.surface, borderRadius: 24, ...(shadows.card as object), overflow: 'hidden' },
    imageArea: { height: 220, margin: 10, borderRadius: 20, overflow: 'hidden' },
    topLeft: { position: 'absolute', top: 10, left: 10, gap: 6 },
    timeChip: {
      borderRadius: 10,
      overflow: 'hidden',
      paddingHorizontal: 8,
      paddingVertical: 4,
      alignSelf: 'flex-start',
    },
    timeText: { fontSize: 11, fontWeight: '600', color: 'white', zIndex: 1 },
    saveBtn: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      ...(shadows.card as object),
    },
    price: {
      position: 'absolute',
      bottom: 12,
      left: 12,
      ...(fonts.priceLg as object),
      color: 'white',
      textShadowColor: 'rgba(0,0,0,0.6)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    body: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16, gap: 10 },
    posterRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: colors.slateBrand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { ...(fonts.labelSm as object), color: 'white' },
    posterInfo: { flex: 1 },
    posterName: { ...(fonts.labelMd as object), color: colors.jet },
    posterTime: { fontSize: 11, fontWeight: '400', color: colors.slateBrand, lineHeight: 14 },
    messageBtn: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 14,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },
    messageBtnText: { fontSize: 12, fontWeight: '700', color: 'white', zIndex: 1 },
    title: { ...(fonts.titleSm as object), color: colors.jet },
    location: { ...(fonts.bodySm as object), color: colors.slateBrand },
    tagsContent: { gap: 6, paddingVertical: 2 },
    tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    tagText: { ...(fonts.labelSm as object), fontWeight: '500' },
    divider: { height: 1, backgroundColor: colors.ghost, opacity: 0.4 },
    actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    stats: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statText: { ...(fonts.labelSm as object), color: colors.slateBrand },
    viewDetailsText: { ...(fonts.bodySm as object), color: colors.coral, fontWeight: '600' },
  }), [colors])
}
