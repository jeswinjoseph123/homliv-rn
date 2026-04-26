import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/typography'

type Props = { onClearFilters: () => void }

export function FeedEmptyState({ onClearFilters }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="home-outline" size={72} color={colors.slateBrand} style={styles.icon} />
      <Text style={styles.heading}>No listings here yet</Text>
      <Text style={styles.body}>
        Try adjusting your filters or check back tomorrow for new listings.
      </Text>
      <Pressable onPress={onClearFilters} style={styles.cta}>
        <Text style={styles.ctaText}>Clear filters</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 64,
  },
  icon: { opacity: 0.3, marginBottom: 24 },
  heading: {
    ...(fonts.titleMd as object),
    color: colors.jet,
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    ...(fonts.bodyMd as object),
    color: colors.slateBrand,
    textAlign: 'center',
    marginBottom: 24,
  },
  cta: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.ghost,
  },
  ctaText: {
    ...(fonts.bodySm as object),
    color: colors.coral,
    fontWeight: '600',
  },
})
