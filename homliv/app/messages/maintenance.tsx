import { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated'
import * as ImagePicker from 'expo-image-picker'
import { colors } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'
import { useChatStore } from '../../src/hooks/useChatStore'
import { track } from '../../src/lib/analytics'

const CATEGORIES = ['Plumbing', 'Electrical', 'Heating', 'Appliance', 'Lock & Security', 'Other']

type Priority = 'low' | 'medium' | 'high'

const PRIORITY_CONFIG: Record<Priority, { label: string; dot: string; bg: string; border: string; desc: string }> = {
  low:    { label: 'Low',    dot: colors.green,  bg: colors.greenBg,  border: `${colors.green}40`,  desc: 'Not urgent' },
  medium: { label: 'Medium', dot: colors.amber,  bg: colors.amberBg,  border: `${colors.amber}40`,  desc: 'Needs attention' },
  high:   { label: 'High',   dot: colors.red,    bg: colors.redBg,    border: `${colors.red}40`,    desc: 'Fix ASAP' },
}

const MIN_DESC = 50
const MAX_PHOTOS = 3

function AnimatedDescInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const focus = useSharedValue(0)
  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focus.value, [0, 1], [colors.ghost, colors.coral]),
    borderWidth: withTiming(focus.value ? 1.5 : 1, { duration: 150 }),
  }))

  return (
    <Animated.View style={[styles.descWrapper, borderStyle]}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Describe the issue in detail…"
        placeholderTextColor={colors.slateBrand}
        multiline
        style={styles.descInput}
        onFocus={() => { focus.value = 1 }}
        onBlur={() => { focus.value = 0 }}
      />
    </Animated.View>
  )
}

export default function MaintenanceScreen() {
  const { convId } = useLocalSearchParams<{ convId: string }>()
  const [category, setCategory] = useState<string | null>(null)
  const [priority, setPriority] = useState<Priority>('medium')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<string[]>([])

  const canSend = !!category && description.trim().length >= MIN_DESC

  const pickPhoto = useCallback(async () => {
    if (photos.length >= MAX_PHOTOS) return
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    })
    if (!result.canceled && result.assets[0]) {
      setPhotos((prev) => [...prev, result.assets[0].uri].slice(0, MAX_PHOTOS))
    }
  }, [photos.length])

  const handleSend = useCallback(() => {
    if (!canSend || !convId || !category) return
    useChatStore.getState().sendMessage(convId, {
      type: 'maintenance',
      maintenanceData: {
        category,
        priority,
        description: description.trim(),
        photos,
        status: 'open',
      },
    })
    track('maintenance_raised')
    router.back()
  }, [canSend, convId, category, priority, description, photos])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
        <Text style={styles.title}>Report maintenance</Text>
        <Pressable onPress={handleSend} disabled={!canSend} hitSlop={8}>
          <Text style={[styles.send, !canSend && styles.sendDisabled]}>Send</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.chipsRow}>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c}
              onPress={() => setCategory(c)}
              style={[styles.chip, category === c && styles.chipActive]}
            >
              <Text style={[styles.chipLabel, category === c && styles.chipLabelActive]}>{c}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Priority</Text>
        <View style={styles.priorityRow}>
          {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => {
            const cfg = PRIORITY_CONFIG[p]
            const isActive = priority === p
            return (
              <Pressable
                key={p}
                onPress={() => setPriority(p)}
                style={[
                  styles.priorityCard,
                  isActive && { backgroundColor: cfg.bg, borderColor: cfg.border },
                ]}
              >
                <View style={[styles.priorityDot, { backgroundColor: cfg.dot }]} />
                <Text style={styles.priorityLabel}>{cfg.label}</Text>
                <Text style={styles.priorityDesc}>{cfg.desc}</Text>
              </Pressable>
            )
          })}
        </View>

        <View style={styles.descHeader}>
          <Text style={styles.sectionLabel}>Description *</Text>
          <Text style={styles.charCount}>{description.length}/{MIN_DESC} min</Text>
        </View>
        <AnimatedDescInput value={description} onChange={setDescription} />

        <Text style={styles.sectionLabel}>Photos (optional)</Text>
        <View style={styles.photoRow}>
          {Array.from({ length: MAX_PHOTOS }).map((_, i) => {
            const uri = photos[i]
            if (uri) {
              return (
                <View key={i} style={styles.photoSlot}>
                  <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="memory-disk" />
                  <Pressable
                    onPress={() => setPhotos(photos.filter((_, j) => j !== i))}
                    style={styles.photoDelete}
                    hitSlop={4}
                  >
                    <Text style={styles.photoDeleteIcon}>✕</Text>
                  </Pressable>
                </View>
              )
            }
            return (
              <Pressable key={i} onPress={() => void pickPhoto()} style={styles.photoEmpty}>
                <Text style={styles.photoEmptyIcon}>📷</Text>
              </Pressable>
            )
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.ghost,
  },
  close: { ...(fonts.bodyMd as object), color: colors.slateBrand },
  title: { ...(fonts.titleMd as object), color: colors.ink },
  send: { ...(fonts.titleSm as object), color: colors.coral },
  sendDisabled: { opacity: 0.35 },
  content: { padding: 20, gap: 8 },
  sectionLabel: { ...(fonts.labelMd as object), color: colors.slateBrand, marginTop: 8 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.ghost,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.jet, borderColor: colors.jet },
  chipLabel: { ...(fonts.bodySm as object), color: colors.slateBrand },
  chipLabelActive: { color: colors.surface },
  priorityRow: { flexDirection: 'row', gap: 8 },
  priorityCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.ghost,
    backgroundColor: colors.surfaceLow,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  priorityLabel: { ...(fonts.labelMd as object), color: colors.ink },
  priorityDesc: { ...(fonts.labelSm as object), color: colors.slateBrand, textAlign: 'center' },
  descHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 },
  charCount: { ...(fonts.labelSm as object), color: colors.slateBrand },
  descWrapper: {
    backgroundColor: colors.surfaceLow,
    borderRadius: 14,
    overflow: 'hidden',
  },
  descInput: {
    ...(fonts.bodyMd as object),
    color: colors.ink,
    paddingHorizontal: 16,
    paddingVertical: 13,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  photoRow: { flexDirection: 'row', gap: 12 },
  photoSlot: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surfaceLow,
  },
  photoDelete: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoDeleteIcon: { ...(fonts.labelSm as object), color: '#ffffff', fontSize: 10 },
  photoEmpty: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: `${colors.ghost}80`,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLow,
  },
  photoEmptyIcon: { fontSize: 24 },
})
