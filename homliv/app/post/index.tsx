import { useEffect, useMemo, useRef, useCallback } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { useTheme } from '../../src/hooks/useTheme'
import { fonts } from '../../src/constants/typography'
import { shadows } from '../../src/constants/shadows'
import { usePostDraft } from '../../src/hooks/usePostDraft'
import { useRequireAuth } from '../../src/hooks/useRequireAuth'
import { WizardHeader } from '../../src/components/post/WizardHeader'
import { track } from '../../src/lib/analytics'
import type { ListingType } from '../../src/types'

type CardConfig = {
  type: ListingType
  icon: string
  name: string
  description: string
  legalNote: string
  legalIcon: string
}

const CARDS: CardConfig[] = [
  {
    type: 'owner_occupier',
    icon: '🏠',
    name: 'Owner-occupier',
    description: "You own and live in this property. You're renting a room or rooms.",
    legalNote:
      'You can set gender and lifestyle preferences — protected under Equal Status Acts Section 6(2)(d) for owner-occupiers sharing their home.',
    legalIcon: '✅',
  },
  {
    type: 'housemate',
    icon: '🤝',
    name: 'Housemate wanted',
    description: 'You rent and are looking for someone to share your space.',
    legalNote:
      'Basic lifestyle preferences may apply. Discrimination based on protected characteristics is not allowed.',
    legalIcon: 'ℹ️',
  },
  {
    type: 'landlord',
    icon: '🏢',
    name: 'Landlord / agent',
    description: "You're renting a room or property as a landlord or letting agent.",
    legalNote:
      'Preferences based on gender, nationality, or religion cannot be applied — Equal Status Acts apply in full.',
    legalIcon: '⚠️',
  },
]

function TypeCard({
  config,
  selected,
  onSelect,
}: {
  config: CardConfig
  selected: boolean
  onSelect: () => void
}) {
  const styles = useStyles()
  const radioScale = useSharedValue(selected ? 1 : 0)

  useEffect(() => {
    radioScale.value = withSpring(selected ? 1 : 0, { damping: 14, stiffness: 200 })
  }, [selected])

  const radioDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: radioScale.value }],
  }))

  return (
    <Pressable
      onPress={onSelect}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={styles.cardTopRow}>
        <Text style={styles.cardIcon}>{config.icon}</Text>
        <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
          <Animated.View style={[styles.radioInner, radioDotStyle]} />
        </View>
      </View>
      <Text style={styles.cardName}>{config.name}</Text>
      <Text style={styles.cardDescription}>{config.description}</Text>
      {selected && (
        <View style={styles.legalNote}>
          <Text style={styles.legalText}>
            {config.legalIcon} {config.legalNote}
          </Text>
        </View>
      )}
    </Pressable>
  )
}

export default function PostStep1Screen() {
  const styles = useStyles()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { listingType, setListingType, reset } = usePostDraft()
  useRequireAuth()
  const hasTrackedStart = useRef(false)

  useEffect(() => {
    if (!hasTrackedStart.current) {
      track('post_started')
      hasTrackedStart.current = true
    }
  }, [])

  const handleClose = useCallback(() => {
    Alert.alert('Discard listing?', '', [
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          track('post_abandoned')
          reset()
          router.canGoBack() ? router.back() : router.replace('/')
        },
      },
      { text: 'Save draft', onPress: () => router.canGoBack() ? router.back() : router.replace('/') },
      { text: 'Keep editing', style: 'cancel' },
    ])
  }, [reset, router])

  const handleNext = useCallback(() => {
    if (!listingType) return
    track('post_listing_type_chosen', { listingType })
    router.push('/post/photos')
  }, [listingType, router])

  const handleSelect = useCallback(
    (type: ListingType) => {
      setListingType(type)
    },
    [setListingType],
  )

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <WizardHeader
        step={1}
        title="Listing type"
        onClose={handleClose}
        onNext={handleNext}
        nextLabel="Next"
        nextDisabled={!listingType}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>What are you listing?</Text>
        <Text style={styles.subheading}>
          This keeps listings legally correct for Ireland.
        </Text>
        {CARDS.map((card) => (
          <TypeCard
            key={card.type}
            config={card}
            selected={listingType === card.type}
            onSelect={() => handleSelect(card.type)}
          />
        ))}
      </ScrollView>
    </View>
  )
}

function useStyles() {
  const { colors } = useTheme()
  return useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    content: { padding: 20, gap: 12, paddingBottom: 40 },
    heading: {
      ...(fonts.displayMd as object),
      color: colors.ink,
      marginBottom: 4,
    },
    subheading: {
      ...(fonts.bodyMd as object),
      color: colors.slateBrand,
      marginBottom: 8,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: `${colors.ghost}50`,
      padding: 18,
      ...shadows.card,
    },
    cardSelected: {
      borderColor: colors.coral,
      backgroundColor: `${colors.coral}0A`,
    },
    cardTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    cardIcon: { fontSize: 28 },
    radioOuter: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.ghost,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioOuterSelected: {
      borderColor: colors.coral,
      backgroundColor: colors.coral,
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.surface,
    },
    cardName: {
      ...(fonts.titleMd as object),
      color: colors.jet,
      marginBottom: 4,
    },
    cardDescription: {
      ...(fonts.bodySm as object),
      color: colors.slateBrand,
    },
    legalNote: {
      backgroundColor: colors.greenBg,
      borderRadius: 10,
      padding: 10,
      marginTop: 12,
    },
    legalText: {
      ...(fonts.bodySm as object),
      color: colors.green,
    },
  }), [colors])
}
