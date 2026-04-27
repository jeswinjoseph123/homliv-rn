import { useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { colors, gradients } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'
import { shadows } from '../../src/constants/shadows'
import { usePostDraft } from '../../src/hooks/usePostDraft'
import { useSession } from '../../src/hooks/useSession'
import { WizardHeader } from '../../src/components/post/WizardHeader'
import { track } from '../../src/lib/analytics'

const LISTING_TYPE_LABEL: Record<string, string> = {
  owner_occupier: 'Owner-occupier',
  housemate: 'Housemate wanted',
  landlord: 'Landlord / agent',
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  )
}

function VerificationGate({
  listingType,
  verificationLevel,
  onPublish,
}: {
  listingType: string
  verificationLevel: string
  onPublish: () => void
}) {
  const router = useRouter()
  const isLandlord = listingType === 'landlord'
  const isBasicVerified = verificationLevel !== 'none'
  const isLandlordVerified = verificationLevel === 'landlord'

  if (isLandlord) {
    if (!isLandlordVerified) {
      return (
        <View style={styles.gateCard}>
          <Text style={styles.gateTitle}>Complete landlord verification to publish</Text>
          <Text style={styles.gateSub}>
            Required for RTB compliance. Your listing saves as a draft.
          </Text>
          <Pressable
            onPress={() => router.push('/auth/verify/landlord')}
            style={styles.gateBtn}
          >
            <Text style={styles.gateBtnLabel}>Verify as landlord →</Text>
          </Pressable>
        </View>
      )
    }
  } else {
    if (!isBasicVerified) {
      return (
        <View style={styles.gateCard}>
          <Text style={styles.gateTitle}>Verify your contact details to publish</Text>
          <Pressable
            onPress={() => router.push('/auth/verify/phone')}
            style={styles.gateBtn}
          >
            <Text style={styles.gateBtnLabel}>Verify phone →</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/auth/verify/email')}
            style={[styles.gateBtn, { marginTop: 8 }]}
          >
            <Text style={styles.gateBtnLabel}>Verify email →</Text>
          </Pressable>
        </View>
      )
    }
  }

  return (
    <Pressable onPress={onPublish} style={styles.publishBtn}>
      <LinearGradient
        colors={gradients.coral}
        style={styles.publishGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.publishLabel}>Publish listing</Text>
      </LinearGradient>
    </Pressable>
  )
}

export default function PostStep4Screen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { listingType, photos, details, preferences, reset } = usePostDraft()
  const sessionUser = useSession((s) => s.user)
  if (!sessionUser) return null

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

  const handlePublish = useCallback(() => {
    track('listing_posted')
    reset()
    router.replace('/')
  }, [reset, router])

  const billsLabel =
    details.billsIncluded === 'included'
      ? 'Included'
      : details.billsIncluded === 'excluded'
        ? 'Excluded'
        : 'To discuss'

  const moveLabel = details.moveImmediate
    ? 'Immediately'
    : details.moveInDate || 'Not set'

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <WizardHeader
        step={4}
        title="Review"
        onClose={handleClose}
        showNext={false}
      />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {photos.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photoStrip}
          >
            {photos.map((p, i) => (
              <Image
                key={i}
                source={{ uri: p }}
                style={styles.photoThumb}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            ))}
          </ScrollView>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Listing details</Text>
          <Row label="Type" value={LISTING_TYPE_LABEL[listingType ?? ''] ?? '-'} />
          <Row label="Title" value={details.title || '-'} />
          <Row label="Rent" value={details.price ? `€${details.price}/mo` : '-'} />
          <Row label="Bills" value={billsLabel} />
          <Row label="Location" value={details.location || '-'} />
          <Row label="Move-in" value={moveLabel} />
        </View>

        {details.description.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descText}>{details.description}</Text>
          </View>
        )}

        {listingType === 'owner_occupier' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Home preferences</Text>
            {preferences.languages.length > 0 && (
              <Row label="Languages" value={preferences.languages.join(', ')} />
            )}
            {preferences.diet && <Row label="Diet" value={preferences.diet} />}
            {preferences.householdVibe && (
              <Row label="Vibe" value={preferences.householdVibe} />
            )}
            {preferences.workPattern && (
              <Row label="Work" value={preferences.workPattern} />
            )}
            {preferences.pets && <Row label="Pets" value={preferences.pets} />}
            {preferences.smoking && <Row label="Smoking" value={preferences.smoking} />}
            {preferences.gender && <Row label="Gender" value={preferences.gender} />}
          </View>
        )}

        <VerificationGate
          listingType={listingType ?? ''}
          verificationLevel={sessionUser.verificationLevel}
          onPublish={handlePublish}
        />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 20, gap: 16 },
  photoStrip: { gap: 8, paddingRight: 20 },
  photoThumb: {
    width: 100,
    height: 70,
    borderRadius: 10,
  },
  section: {
    backgroundColor: colors.surfaceLow,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    ...shadows.card,
  },
  sectionTitle: {
    ...(fonts.titleSm as object),
    color: colors.jet,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  rowLabel: {
    ...(fonts.bodySm as object),
    color: colors.slateBrand,
    flex: 0.4,
  },
  rowValue: {
    ...(fonts.bodySm as object),
    color: colors.ink,
    flex: 0.6,
    textAlign: 'right',
  },
  descText: {
    ...(fonts.bodyMd as object),
    color: colors.ink,
  },
  gateCard: {
    backgroundColor: colors.amberBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: `${colors.amber}30`,
    gap: 8,
  },
  gateTitle: {
    ...(fonts.titleSm as object),
    color: colors.jet,
  },
  gateSub: {
    ...(fonts.bodySm as object),
    color: colors.slateBrand,
  },
  gateBtn: {
    backgroundColor: colors.amberBg,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: colors.amber,
    alignItems: 'center',
  },
  gateBtnLabel: {
    ...(fonts.titleSm as object),
    color: colors.amber,
  },
  publishBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    ...shadows.coral,
  },
  publishGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishLabel: {
    ...(fonts.titleMd as object),
    color: '#ffffff',
    fontSize: 15,
  },
})
