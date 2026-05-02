import { memo, useMemo } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../hooks/useTheme'
import { fonts } from '../../constants/typography'
import { formatPrice } from '../../lib/utils'
import type { Listing } from '../../types'

type Props = {
  listing: Listing
  onPress: () => void
}

export const ListingPin = memo(function ListingPin({ listing, onPress }: Props) {
  const { colors } = useTheme()
  const styles = useStyles()
  const photo = listing.photos[0] ?? undefined

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Image
        source={{ uri: photo }}
        style={styles.thumb}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
        <Text style={styles.price}>{formatPrice(listing.price)}</Text>
        <Text style={styles.location} numberOfLines={1}>📍 {listing.location}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.slateBrand} />
    </Pressable>
  )
})

function useStyles() {
  const { colors } = useTheme()
  return useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: `${colors.ghost}20`,
    },
    thumb: { width: 56, height: 56, borderRadius: 12 },
    info: { flex: 1, gap: 2 },
    title: { ...(fonts.titleSm as object), color: colors.jet },
    price: { ...(fonts.bodySm as object), color: colors.coral, fontWeight: '700' },
    location: { ...(fonts.labelSm as object), color: colors.slateBrand },
  }), [colors])
}
