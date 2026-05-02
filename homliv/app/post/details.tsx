import { useState, useCallback, useMemo, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated'
import { useTheme } from '../../src/hooks/useTheme'
import { fonts } from '../../src/constants/typography'
import { usePostDraft } from '../../src/hooks/usePostDraft'
import { WizardHeader } from '../../src/components/post/WizardHeader'
import { track } from '../../src/lib/analytics'
import type { BillsOption } from '../../src/hooks/usePostDraft'

const LANGUAGES = [
  'Malayalam', 'Hindi', 'Polish', 'Portuguese', 'Spanish', 'Mandarin',
  'Arabic', 'English', 'Tamil', 'Telugu', 'Bengali', 'Urdu',
  'Romanian', 'Lithuanian', 'French', 'Italian',
]

const BILLS_OPTIONS: { value: BillsOption; label: string }[] = [
  { value: 'included', label: 'Included' },
  { value: 'excluded', label: 'Excluded' },
  { value: 'discuss', label: 'To discuss' },
]

const MIN_DESC = 100

function AnimatedInput({
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  prefix,
  style,
}: {
  value: string
  onChangeText: (t: string) => void
  placeholder?: string
  multiline?: boolean
  keyboardType?: 'default' | 'numeric'
  prefix?: string
  style?: object
}) {
  const { colors } = useTheme()
  const styles = useStyles()
  const focused = useSharedValue(0)

  const borderStyle = useAnimatedStyle(() => ({
    borderWidth: withTiming(focused.value ? 1.5 : 0, { duration: 150 }),
    borderColor: interpolateColor(focused.value, [0, 1], [colors.ghost, colors.coral]),
  }))

  return (
    <Animated.View style={[styles.inputWrapper, borderStyle, style]}>
      {prefix && <Text style={styles.inputPrefix}>{prefix}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.slateBrand}
        multiline={multiline}
        keyboardType={keyboardType ?? 'default'}
        onFocus={() => { focused.value = 1 }}
        onBlur={() => { focused.value = 0 }}
        style={[styles.input, prefix ? styles.inputWithPrefix : null, multiline ? styles.inputMulti : null]}
      />
    </Animated.View>
  )
}

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: { value: BillsOption; label: string }[]
  value: BillsOption
  onChange: (v: BillsOption) => void
}) {
  const styles = useStyles()
  return (
    <View style={styles.segmented}>
      {options.map((opt) => (
        <Pressable
          key={opt.value}
          onPress={() => onChange(opt.value)}
          style={[styles.segment, value === opt.value && styles.segmentActive]}
        >
          <Text
            style={[styles.segmentLabel, value === opt.value && styles.segmentLabelActive]}
          >
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}

function TagGrid({
  options,
  selected,
  onToggle,
}: {
  options: string[]
  selected: string[]
  onToggle: (v: string) => void
}) {
  const styles = useStyles()
  return (
    <View style={styles.tagGrid}>
      {options.map((opt) => {
        const isActive = selected.includes(opt)
        return (
          <Pressable
            key={opt}
            onPress={() => onToggle(opt)}
            style={[styles.tag, isActive && styles.tagActive]}
          >
            <Text style={[styles.tagLabel, isActive && styles.tagLabelActive]}>
              {opt}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

function SingleSelect({
  options,
  value,
  onChange,
}: {
  options: string[]
  value: string | null
  onChange: (v: string) => void
}) {
  const styles = useStyles()
  return (
    <View style={styles.tagGrid}>
      {options.map((opt) => {
        const isActive = value === opt
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(isActive ? '' : opt)}
            style={[styles.tag, isActive && styles.tagActive]}
          >
            <Text style={[styles.tagLabel, isActive && styles.tagLabelActive]}>
              {opt}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

function SectionLabel({ label }: { label: string }) {
  const styles = useStyles()
  return <Text style={styles.sectionLabel}>{label}</Text>
}

export default function PostStep3Screen() {
  const styles = useStyles()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { listingType, details, preferences, setDetails, setPreferences, reset } = usePostDraft()

  const isOwnerOccupier = listingType === 'owner_occupier'

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

  const canProceed =
    details.title.trim().length > 0 &&
    details.price.trim().length > 0 &&
    details.location.trim().length > 0 &&
    details.description.trim().length >= MIN_DESC

  const handleNext = useCallback(() => {
    if (!canProceed) return
    router.push('/post/review')
  }, [canProceed, router])

  const toggleLanguage = useCallback(
    (lang: string) => {
      const next = preferences.languages.includes(lang)
        ? preferences.languages.filter((l) => l !== lang)
        : [...preferences.languages, lang]
      setPreferences({ languages: next })
    },
    [preferences.languages, setPreferences],
  )

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <WizardHeader
          step={3}
          title="Details"
          onClose={handleClose}
          onNext={handleNext}
          nextLabel="Next"
          nextDisabled={!canProceed}
        />
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <SectionLabel label="Title *" />
          <AnimatedInput
            value={details.title}
            onChangeText={(t) => setDetails({ title: t })}
            placeholder="e.g. Double room in Ranelagh home"
          />

          <SectionLabel label="Rent per month *" />
          <AnimatedInput
            value={details.price}
            onChangeText={(t) => setDetails({ price: t })}
            placeholder="0"
            keyboardType="numeric"
            prefix="€"
          />

          <SectionLabel label="Bills" />
          <SegmentedControl
            options={BILLS_OPTIONS}
            value={details.billsIncluded}
            onChange={(v) => setDetails({ billsIncluded: v })}
          />

          <SectionLabel label="Eircode or area *" />
          <AnimatedInput
            value={details.location}
            onChangeText={(t) => setDetails({ location: t })}
            placeholder="e.g. D06 A1B2 or Ranelagh"
          />

          <SectionLabel label="Move-in date" />
          <Pressable
            onPress={() => setDetails({ moveImmediate: !details.moveImmediate })}
            style={styles.toggleRow}
          >
            <View style={[styles.checkbox, details.moveImmediate && styles.checkboxActive]}>
              {details.moveImmediate && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.toggleLabel}>Available immediately</Text>
          </Pressable>
          {!details.moveImmediate && (
            <AnimatedInput
              value={details.moveInDate}
              onChangeText={(t) => setDetails({ moveInDate: t })}
              placeholder="YYYY-MM-DD"
            />
          )}

          <View style={styles.descHeader}>
            <SectionLabel label="Description *" />
            <Text style={styles.charCount}>
              {details.description.length}/{MIN_DESC} min
            </Text>
          </View>
          <AnimatedInput
            value={details.description}
            onChangeText={(t) => setDetails({ description: t })}
            placeholder="Describe the room, house, location, what you're looking for…"
            multiline
          />

          {isOwnerOccupier && (
            <View style={styles.prefsContainer}>
              <View style={styles.prefsHeader}>
                <Text style={styles.prefsTitle}>🏠 Home preferences</Text>
                <View style={styles.prefsBadge}>
                  <Text style={styles.prefsBadgeLabel}>Owner-occupier only</Text>
                </View>
              </View>
              <Text style={styles.prefsSub}>
                These are legally allowed because you live here. Help the right housemate find you.
              </Text>

              <SectionLabel label="Languages spoken" />
              <TagGrid
                options={LANGUAGES}
                selected={preferences.languages}
                onToggle={toggleLanguage}
              />

              <SectionLabel label="Diet" />
              <SingleSelect
                options={['Vegetarian-friendly', 'Vegan-friendly', 'Halal kitchen', 'No restriction']}
                value={preferences.diet}
                onChange={(v) => setPreferences({ diet: v || null })}
              />

              <SectionLabel label="Household vibe" />
              <SingleSelect
                options={['Quiet/professional', 'Social', 'Mixed']}
                value={preferences.householdVibe}
                onChange={(v) => setPreferences({ householdVibe: v || null })}
              />

              <SectionLabel label="Work pattern" />
              <SingleSelect
                options={['Standard hours', 'Night shifts welcome', 'Remote-friendly']}
                value={preferences.workPattern}
                onChange={(v) => setPreferences({ workPattern: v || null })}
              />

              <SectionLabel label="Pets" />
              <SingleSelect
                options={['Cats', 'Dogs', 'No pets', 'Pets welcome']}
                value={preferences.pets}
                onChange={(v) => setPreferences({ pets: v || null })}
              />

              <SectionLabel label="Smoking" />
              <SingleSelect
                options={['Inside', 'Outside only', 'None']}
                value={preferences.smoking}
                onChange={(v) => setPreferences({ smoking: v || null })}
              />

              <View style={styles.genderHeader}>
                <SectionLabel label="Gender preference (optional)" />
                <Text style={styles.genderInfo}>ℹ️</Text>
              </View>
              <Text style={styles.genderHint}>
                Legal under Equal Status Acts for owner-occupiers sharing their home.
              </Text>
              <SingleSelect
                options={['Female only', 'Male only', 'No preference']}
                value={preferences.gender}
                onChange={(v) => setPreferences({ gender: v || null })}
              />
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  )
}

function useStyles() {
  const { colors } = useTheme()
  return useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    content: { padding: 20, gap: 8, paddingBottom: 40 },
    sectionLabel: {
      ...(fonts.labelMd as object),
      color: colors.slateBrand,
      marginTop: 8,
      marginBottom: 4,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceLow,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 13,
    },
    input: {
      ...(fonts.bodyMd as object),
      color: colors.ink,
      flex: 1,
      padding: 0,
    },
    inputWithPrefix: { marginLeft: 4 },
    inputMulti: { minHeight: 100, textAlignVertical: 'top' },
    inputPrefix: {
      ...(fonts.bodyMd as object),
      color: colors.slateBrand,
    },
    segmented: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceLow,
      borderRadius: 14,
      padding: 4,
      gap: 4,
    },
    segment: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: 'center',
    },
    segmentActive: {
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    segmentLabel: {
      ...(fonts.bodySm as object),
      color: colors.slateBrand,
    },
    segmentLabelActive: {
      ...(fonts.labelMd as object),
      color: colors.ink,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 4,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.ghost,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxActive: {
      backgroundColor: colors.coral,
      borderColor: colors.coral,
    },
    checkmark: {
      ...(fonts.labelSm as object),
      color: colors.surface,
    },
    toggleLabel: {
      ...(fonts.bodyMd as object),
      color: colors.ink,
    },
    descHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginTop: 8,
      marginBottom: 4,
    },
    charCount: {
      ...(fonts.labelSm as object),
      color: colors.slateBrand,
    },
    prefsContainer: {
      backgroundColor: colors.greenBg,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: `${colors.green}30`,
      padding: 16,
      marginTop: 8,
      gap: 8,
    },
    prefsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    prefsTitle: {
      ...(fonts.titleMd as object),
      color: colors.jet,
    },
    prefsBadge: {
      backgroundColor: `${colors.green}20`,
      borderRadius: 20,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    prefsBadgeLabel: {
      ...(fonts.labelSm as object),
      color: colors.green,
    },
    prefsSub: {
      ...(fonts.bodySm as object),
      color: colors.slateBrand,
    },
    tagGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tag: {
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.ghost,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: colors.surface,
    },
    tagActive: {
      backgroundColor: colors.jet,
      borderColor: colors.jet,
    },
    tagLabel: {
      ...(fonts.bodySm as object),
      color: colors.slateBrand,
    },
    tagLabelActive: {
      color: colors.surface,
    },
    genderHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
    },
    genderInfo: { fontSize: 16 },
    genderHint: {
      ...(fonts.bodySm as object),
      color: colors.slateBrand,
      fontStyle: 'italic',
      marginBottom: 4,
    },
  }), [colors])
}
