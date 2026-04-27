import { useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import * as DocumentPicker from 'expo-document-picker'
import { colors, gradients } from '../../../src/constants/colors'
import { fonts } from '../../../src/constants/typography'
import { shadows } from '../../../src/constants/shadows'
import { useSession } from '../../../src/hooks/useSession'
import { WizardHeader } from '../../../src/components/post/WizardHeader'
import { track } from '../../../src/lib/analytics'

type Step = 1 | 2 | 3 | 4

type FormData = {
  fullName: string
  dob: string
  address: string
  docName: string | null
  iban: string
  accountHolder: string
}

const STEP_TITLES: Record<Step, string> = {
  1: 'Personal Info',
  2: 'Property Ownership',
  3: 'Bank Details',
  4: 'Confirmation',
}

export default function VerifyLandlordScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { user, setUser } = useSession()

  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormData>({
    fullName: user?.name ?? '',
    dob: '',
    address: '',
    docName: null,
    iban: '',
    accountHolder: user?.name ?? '',
  })

  const patch = useCallback((fields: Partial<FormData>) => {
    setForm((f) => ({ ...f, ...fields }))
  }, [])

  const canProceed: Record<Step, boolean> = {
    1: form.fullName.trim().length > 0 && form.dob.trim().length > 0 && form.address.trim().length > 0,
    2: form.docName !== null,
    3: form.iban.trim().length >= 22 && form.accountHolder.trim().length > 0,
    4: true,
  }

  const handleClose = useCallback(() => {
    Alert.alert('Cancel verification?', 'Your progress will not be saved.', [
      { text: 'Keep going', style: 'cancel' },
      {
        text: 'Cancel',
        style: 'destructive',
        onPress: () => router.canGoBack() ? router.back() : router.replace('/me'),
      },
    ])
  }, [router])

  const handleNext = useCallback(() => {
    if (step < 4) setStep((s) => (s + 1) as Step)
  }, [step])

  const handlePickDocument = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: false,
    })
    if (!result.canceled && result.assets.length > 0) {
      patch({ docName: result.assets[0].name })
    }
  }, [patch])

  const handleSubmit = useCallback(() => {
    if (!user) return
    setUser({
      ...user,
      verificationLevel: 'landlord',
      roles: user.roles.includes('landlord') ? user.roles : [...user.roles, 'landlord'],
    })
    track('landlord_verification_completed')
  }, [user, setUser])

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <WizardHeader
        step={step}
        title={STEP_TITLES[step]}
        onClose={handleClose}
        onNext={step < 4 ? handleNext : undefined}
        nextDisabled={!canProceed[step]}
        showNext={step < 4}
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 && (
          <View style={styles.stepBody}>
            <Text style={styles.stepHeading}>Personal information</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Full legal name</Text>
              <TextInput
                style={styles.input}
                placeholder="As it appears on your ID"
                placeholderTextColor={colors.slateBrand}
                value={form.fullName}
                onChangeText={(t) => patch({ fullName: t })}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Date of birth</Text>
              <TextInput
                style={styles.input}
                placeholder="DD / MM / YYYY"
                placeholderTextColor={colors.slateBrand}
                value={form.dob}
                onChangeText={(t) => patch({ dob: t })}
                keyboardType="numbers-and-punctuation"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Current address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Street, Town, County, Eircode"
                placeholderTextColor={colors.slateBrand}
                value={form.address}
                onChangeText={(t) => patch({ address: t })}
                multiline
                numberOfLines={3}
                autoCapitalize="words"
              />
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepBody}>
            <Text style={styles.stepHeading}>Proof of property ownership</Text>
            <Text style={styles.stepSub}>
              Upload a utility bill or title deed showing your name and the property address.
            </Text>

            {form.docName ? (
              <View style={styles.docCard}>
                <Text style={styles.docIcon}>📄</Text>
                <View style={styles.docInfo}>
                  <Text style={styles.docName} numberOfLines={1}>{form.docName}</Text>
                  <Text style={styles.docSubText}>Document uploaded</Text>
                </View>
                <Pressable onPress={() => patch({ docName: null })} hitSlop={8}>
                  <Text style={styles.docRemove}>✕</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.uploadBtn} onPress={handlePickDocument}>
                <Text style={styles.uploadIcon}>📎</Text>
                <Text style={styles.uploadLabel}>Upload document</Text>
                <Text style={styles.uploadSub}>PDF, JPG or PNG</Text>
              </Pressable>
            )}
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepBody}>
            <Text style={styles.stepHeading}>Bank details</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>IBAN</Text>
              <TextInput
                style={styles.input}
                placeholder="IE29 AIBK 9311 5212 3456 78"
                placeholderTextColor={colors.slateBrand}
                value={form.iban}
                onChangeText={(t) => patch({ iban: t.toUpperCase() })}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Account holder name</Text>
              <TextInput
                style={styles.input}
                placeholder="Name on bank account"
                placeholderTextColor={colors.slateBrand}
                value={form.accountHolder}
                onChangeText={(t) => patch({ accountHolder: t })}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.bankNote}>
              <Text style={styles.bankNoteText}>
                Your bank details are used to set up rent payments. No charges until you activate rent collection.
              </Text>
            </View>
          </View>
        )}

        {step === 4 && (
          <View style={styles.stepBody}>
            {user?.verificationLevel === 'landlord' ? (
              <View style={styles.successBlock}>
                <Text style={styles.successIcon}>✅</Text>
                <Text style={styles.successHeading}>Under review</Text>
                <Text style={styles.successSub}>
                  Usually within 24 hours. You'll receive a notification once verified.
                </Text>
                <Pressable
                  style={styles.doneBtn}
                  onPress={() => router.replace('/')}
                >
                  <LinearGradient
                    colors={gradients.coral}
                    style={styles.doneBtnGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.doneBtnText}>Go to home</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            ) : (
              <>
                <Text style={styles.stepHeading}>Review & submit</Text>

                <View style={styles.summaryCard}>
                  <SummaryRow label="Name" value={form.fullName} />
                  <SummaryRow label="Date of birth" value={form.dob} />
                  <SummaryRow label="Address" value={form.address} />
                  <SummaryRow label="Document" value={form.docName ?? '—'} />
                  <SummaryRow label="IBAN" value={form.iban || '—'} />
                  <SummaryRow label="Account holder" value={form.accountHolder} />
                </View>

                <Pressable style={styles.submitBtn} onPress={handleSubmit}>
                  <LinearGradient
                    colors={gradients.coral}
                    style={styles.submitGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.submitText}>Submit for review</Text>
                  </LinearGradient>
                </Pressable>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue} numberOfLines={1}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },

  scroll: { padding: 20, gap: 16 },
  stepBody: { gap: 20 },
  stepHeading: { ...(fonts.titleLg as object), color: colors.jet },
  stepSub: { ...(fonts.bodyMd as object), color: colors.slateBrand, marginTop: -8 },

  fieldGroup: { gap: 8 },
  label: { ...(fonts.labelMd as object), color: colors.slateBrand },
  input: {
    borderWidth: 1,
    borderColor: `${colors.ghost}60`,
    borderRadius: 14,
    backgroundColor: colors.surfaceLow,
    paddingHorizontal: 16,
    paddingVertical: 16,
    ...(fonts.bodyMd as object),
    color: colors.ink,
  },
  textArea: { height: 88, textAlignVertical: 'top' },

  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.greenBg,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: `${colors.green}30`,
    ...(shadows.card as object),
  },
  docIcon: { fontSize: 28 },
  docInfo: { flex: 1, gap: 2 },
  docName: { ...(fonts.titleSm as object), color: colors.jet },
  docSubText: { ...(fonts.bodySm as object), color: colors.green },
  docRemove: { ...(fonts.titleMd as object), color: colors.slateBrand },

  uploadBtn: {
    borderWidth: 1.5,
    borderColor: `${colors.ghost}60`,
    borderRadius: 14,
    borderStyle: 'dashed',
    backgroundColor: colors.surfaceLow,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
  },
  uploadIcon: { fontSize: 32 },
  uploadLabel: { ...(fonts.titleSm as object), color: colors.jet },
  uploadSub: { ...(fonts.bodySm as object), color: colors.slateBrand },

  bankNote: {
    backgroundColor: colors.amberBg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: `${colors.amber}30`,
  },
  bankNoteText: { ...(fonts.bodySm as object), color: colors.slateBrand },

  summaryCard: {
    backgroundColor: colors.surfaceLow,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    ...(shadows.card as object),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  summaryLabel: { ...(fonts.bodySm as object), color: colors.slateBrand, flex: 0.4 },
  summaryValue: { ...(fonts.bodySm as object), color: colors.ink, flex: 0.6, textAlign: 'right' },

  submitBtn: { borderRadius: 18, overflow: 'hidden', ...shadows.coral },
  submitGradient: { height: 56, alignItems: 'center', justifyContent: 'center' },
  submitText: { ...(fonts.titleMd as object), color: '#ffffff' },

  successBlock: { alignItems: 'center', paddingTop: 40, gap: 16 },
  successIcon: { fontSize: 64 },
  successHeading: { ...(fonts.displayMd as object), color: colors.jet },
  successSub: { ...(fonts.bodyMd as object), color: colors.slateBrand, textAlign: 'center' },
  doneBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginTop: 8, ...shadows.coral },
  doneBtnGradient: { height: 56, alignItems: 'center', justifyContent: 'center' },
  doneBtnText: { ...(fonts.titleMd as object), color: '#ffffff' },
})
