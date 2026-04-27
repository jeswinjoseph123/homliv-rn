import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, gradients } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'
import { shadows } from '../../src/constants/shadows'
import { useChatStore } from '../../src/hooks/useChatStore'
import { track } from '../../src/lib/analytics'

const DAYS = Array.from({ length: 7 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() + i + 1)
  return d
})

const TIME_OPTIONS = [
  { label: '10:00 AM', hour: 10 },
  { label: '2:00 PM', hour: 14 },
  { label: '6:00 PM', hour: 18 },
  { label: '8:00 PM', hour: 20 },
]

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatSlot(date: Date): string {
  const day = DAY_LABELS[date.getDay()]
  const num = date.getDate()
  const month = MONTH_LABELS[date.getMonth()]
  const h = date.getHours()
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  const mins = date.getMinutes().toString().padStart(2, '0')
  return `${day} ${num} ${month} · ${hour12}:${mins} ${ampm}`
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)

function NoteInput({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const focus = useSharedValue(0)

  const animStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focus.value, [0, 1], [colors.ghost, colors.coral]),
    borderWidth: withTiming(focus.value === 1 ? 1.5 : 1, { duration: 150 }),
  }))

  return (
    <AnimatedTextInput
      style={[styles.noteInput, animStyle]}
      placeholder="Any notes for the landlord?"
      placeholderTextColor={colors.ghost}
      multiline
      value={value}
      onChangeText={onChange}
      onFocus={() => { focus.value = withTiming(1, { duration: 150 }) }}
      onBlur={() => { focus.value = withTiming(0, { duration: 150 }) }}
    />
  )
}

export default function ViewingScreen() {
  const { convId } = useLocalSearchParams<{ convId: string }>()
  const [selectedDay, setSelectedDay] = useState<number>(0)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [slots, setSlots] = useState<Date[]>([])
  const [note, setNote] = useState('')

  const canSend = slots.length >= 1
  const canAdd =
    selectedTime !== null && slots.length < 3

  function addSlot() {
    if (selectedTime === null) return
    const day = DAYS[selectedDay]
    const timeOpt = TIME_OPTIONS.find((t) => t.label === selectedTime)
    if (!timeOpt) return
    const d = new Date(day)
    d.setHours(timeOpt.hour, 0, 0, 0)
    const exists = slots.some((s) => s.getTime() === d.getTime())
    if (!exists && slots.length < 3) {
      setSlots([...slots, d])
      setSelectedTime(null)
    }
  }

  function removeSlot(index: number) {
    setSlots(slots.filter((_, i) => i !== index))
  }

  function handleSend() {
    if (!canSend || !convId) return
    useChatStore.getState().sendMessage(convId, {
      type: 'viewing_request',
      viewingData: { slots, note: note.trim() || undefined },
    })
    track('viewing_requested')
    router.back()
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn} hitSlop={8}>
          <Text style={styles.headerClose}>✕</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Request a viewing</Text>
        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          style={styles.headerBtn}
          hitSlop={8}
        >
          <Text style={[styles.headerSend, !canSend && styles.headerSendDisabled]}>
            Send
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionHint}>Select up to 3 time slots</Text>

        {/* Day pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysRow}
        >
          {DAYS.map((d, i) => {
            const active = i === selectedDay
            return (
              <Pressable
                key={i}
                onPress={() => setSelectedDay(i)}
                style={[styles.dayPill, active && styles.dayPillActive]}
              >
                <Text style={[styles.dayPillTop, active && styles.dayPillTextActive]}>
                  {DAY_LABELS[d.getDay()]}
                </Text>
                <Text style={[styles.dayPillBottom, active && styles.dayPillTextActive]}>
                  {d.getDate()}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>

        {/* Time grid */}
        <View style={styles.timeGrid}>
          {TIME_OPTIONS.map((t) => {
            const active = selectedTime === t.label
            return (
              <Pressable
                key={t.label}
                onPress={() => setSelectedTime(active ? null : t.label)}
                style={[styles.timeCell, active && styles.timeCellActive]}
              >
                <Text style={[styles.timeCellText, active && styles.timeCellTextActive]}>
                  {t.label}
                </Text>
              </Pressable>
            )
          })}
        </View>

        {/* Add slot button */}
        {canAdd && (
          <TouchableOpacity onPress={addSlot} activeOpacity={0.85} style={styles.addSlotWrap}>
            <LinearGradient
              colors={gradients.coral}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.addSlotBtn, shadows.coral]}
            >
              <Text style={styles.addSlotLabel}>Add slot</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Selected slots preview */}
        {slots.length > 0 && (
          <View style={styles.slotsPreview}>
            {slots.map((s, i) => (
              <View key={i} style={styles.slotRow}>
                <Text style={styles.slotText}>{formatSlot(s)}</Text>
                <Pressable onPress={() => removeSlot(i)} hitSlop={8}>
                  <Text style={styles.slotRemove}>✕</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Note input */}
        <View style={styles.noteSection}>
          <NoteInput value={note} onChange={setNote} />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.ghost,
  },
  headerBtn: {
    minWidth: 48,
  },
  headerClose: {
    ...(fonts.bodyMd as object),
    color: colors.slateBrand,
  },
  headerTitle: {
    ...(fonts.titleMd as object),
    color: colors.ink,
  },
  headerSend: {
    ...(fonts.titleSm as object),
    color: colors.coral,
    textAlign: 'right',
  },
  headerSendDisabled: {
    opacity: 0.35,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionHint: {
    ...(fonts.bodyMd as object),
    color: colors.slateBrand,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  daysRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  dayPill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.surfaceLow,
    borderWidth: 1,
    borderColor: colors.ghost,
    minWidth: 52,
  },
  dayPillActive: {
    backgroundColor: colors.jet,
    borderColor: colors.jet,
  },
  dayPillTop: {
    ...(fonts.labelMd as object),
    color: colors.slateBrand,
  },
  dayPillBottom: {
    ...(fonts.labelSm as object),
    color: colors.slateBrand,
    marginTop: 2,
  },
  dayPillTextActive: {
    color: colors.surface,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  timeCell: {
    width: '47%',
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surfaceLow,
    borderWidth: 1,
    borderColor: colors.ghost,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeCellActive: {
    backgroundColor: colors.jet,
    borderColor: colors.jet,
  },
  timeCellText: {
    ...(fonts.titleSm as object),
    color: colors.slateBrand,
  },
  timeCellTextActive: {
    color: colors.surface,
  },
  addSlotWrap: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  addSlotBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSlotLabel: {
    ...(fonts.titleSm as object),
    color: colors.surface,
  },
  slotsPreview: {
    marginHorizontal: 20,
    marginTop: 16,
    gap: 8,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceLow,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.ghost,
  },
  slotText: {
    ...(fonts.bodyMd as object),
    color: colors.ink,
  },
  slotRemove: {
    ...(fonts.labelMd as object),
    color: colors.slateBrand,
  },
  noteSection: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  noteInput: {
    backgroundColor: colors.surfaceLow,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 88,
    textAlignVertical: 'top',
    ...(fonts.bodyMd as object),
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.ghost,
  },
})
