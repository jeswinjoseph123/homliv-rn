import { useCallback, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  useWindowDimensions,
} from 'react-native'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { colors } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'
import { shadows } from '../../src/constants/shadows'
import { usePostDraft } from '../../src/hooks/usePostDraft'
import { WizardHeader } from '../../src/components/post/WizardHeader'
import { track } from '../../src/lib/analytics'

const MAX_PHOTOS = 6
const GAP = 8

function PhotoCell({
  photo,
  index,
  isFirst,
  isSelected,
  cellWidth,
  onPress,
  onDelete,
  onLongPress,
}: {
  photo: string | null
  index: number
  isFirst: boolean
  isSelected: boolean
  cellWidth: number
  onPress: () => void
  onDelete: () => void
  onLongPress: () => void
}) {
  const height = isFirst ? cellWidth * (9 / 16) : cellWidth

  if (photo) {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={[
          styles.filledCell,
          { width: cellWidth, height },
          isSelected && styles.filledCellSelected,
        ]}
      >
        <Image
          source={{ uri: photo }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
        {isFirst && (
          <View style={styles.coverBadge}>
            <Text style={styles.coverBadgeText}>Cover photo</Text>
          </View>
        )}
        {isSelected && (
          <View style={styles.moveOverlay}>
            <Text style={styles.moveText}>Tap another to swap</Text>
          </View>
        )}
        <Pressable onPress={onDelete} style={styles.deleteBtn} hitSlop={4}>
          <Text style={styles.deleteBtnText}>✕</Text>
        </Pressable>
      </Pressable>
    )
  }

  return (
    <Pressable
      onPress={onPress}
      style={[styles.emptyCell, { width: cellWidth, height }]}
    >
      <Text style={styles.emptyCellIcon}>📷</Text>
      <Text style={styles.emptyCellLabel}>Add photo</Text>
    </Pressable>
  )
}

export default function PostStep2Screen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { width: screenWidth } = useWindowDimensions()
  const { photos, setPhotos, reset } = usePostDraft()
  const [selectedForMove, setSelectedForMove] = useState<number | null>(null)

  const contentPadding = 20
  const gridWidth = screenWidth - contentPadding * 2
  const cellWidth = (gridWidth - GAP) / 2

  const handleClose = useCallback(() => {
    Alert.alert('Discard listing?', '', [
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          track('post_abandoned')
          reset()
          router.back()
        },
      },
      { text: 'Save draft', onPress: () => router.back() },
      { text: 'Keep editing', style: 'cancel' },
    ])
  }, [reset, router])

  const handleNext = useCallback(() => {
    if (photos.length === 0) return
    router.push('/post/details')
  }, [photos.length, router])

  const pickPhoto = useCallback(
    async (index: number) => {
      if (selectedForMove !== null) {
        if (selectedForMove !== index && photos[index]) {
          const next = [...photos]
          const temp = next[selectedForMove]
          next[selectedForMove] = next[index]
          next[index] = temp
          setPhotos(next)
        }
        setSelectedForMove(null)
        return
      }

      if (photos[index]) return

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsEditing: false,
      })

      if (!result.canceled && result.assets[0]) {
        const next = [...photos]
        next.splice(index, 0, result.assets[0].uri)
        setPhotos(next.slice(0, MAX_PHOTOS))
      }
    },
    [photos, selectedForMove, setPhotos],
  )

  const deletePhoto = useCallback(
    (index: number) => {
      const next = photos.filter((_, i) => i !== index)
      setPhotos(next)
      if (selectedForMove === index) setSelectedForMove(null)
    },
    [photos, selectedForMove, setPhotos],
  )

  const handleLongPress = useCallback(
    (index: number) => {
      if (photos[index]) setSelectedForMove(index)
    },
    [photos],
  )

  const slots: (string | null)[] = [
    ...photos,
    ...(photos.length < MAX_PHOTOS ? [null] : []),
  ]

  const firstSlot = slots[0] ?? null
  const restSlots = slots.slice(1)

  const rows: (string | null)[][] = []
  for (let i = 0; i < restSlots.length; i += 2) {
    rows.push(restSlots.slice(i, i + 2))
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <WizardHeader
        step={2}
        title="Photos"
        onClose={handleClose}
        onNext={handleNext}
        nextLabel="Next"
        nextDisabled={photos.length === 0}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Add photos</Text>
        <Text style={styles.subheading}>First photo is your cover. Add up to 6.</Text>

        <View style={styles.grid}>
          <PhotoCell
            photo={firstSlot}
            index={0}
            isFirst
            isSelected={selectedForMove === 0}
            cellWidth={gridWidth}
            onPress={() => {
              if (firstSlot) {
                if (selectedForMove !== null && selectedForMove !== 0) {
                  const next = [...photos]
                  const temp = next[selectedForMove]
                  next[selectedForMove] = next[0]
                  next[0] = temp
                  setPhotos(next)
                  setSelectedForMove(null)
                } else {
                  setSelectedForMove(null)
                }
              } else {
                void pickPhoto(0)
              }
            }}
            onDelete={() => deletePhoto(0)}
            onLongPress={() => handleLongPress(0)}
          />

          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={[styles.row, { gap: GAP }]}>
              {row.map((photo, colIndex) => {
                const slotIndex = 1 + rowIndex * 2 + colIndex
                return (
                  <PhotoCell
                    key={slotIndex}
                    photo={photo}
                    index={slotIndex}
                    isFirst={false}
                    isSelected={selectedForMove === slotIndex}
                    cellWidth={cellWidth}
                    onPress={() => void pickPhoto(slotIndex)}
                    onDelete={() => deletePhoto(slotIndex)}
                    onLongPress={() => handleLongPress(slotIndex)}
                  />
                )
              })}
            </View>
          ))}
        </View>

        {photos.length === 0 && (
          <Text style={styles.hint}>At least 1 photo required to continue.</Text>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
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
    marginBottom: 4,
  },
  grid: { gap: GAP },
  row: { flexDirection: 'row' },
  filledCell: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surfaceLow,
    ...shadows.card,
  },
  filledCellSelected: {
    opacity: 0.7,
  },
  coverBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  coverBadgeText: {
    ...(fonts.labelSm as object),
    color: '#ffffff',
  },
  moveOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: `${colors.coral}33`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moveText: {
    ...(fonts.labelMd as object),
    color: '#ffffff',
  },
  deleteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    ...(fonts.labelSm as object),
    color: '#ffffff',
    fontSize: 12,
  },
  emptyCell: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: `${colors.ghost}80`,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surfaceLow,
  },
  emptyCellIcon: { fontSize: 24 },
  emptyCellLabel: {
    ...(fonts.bodySm as object),
    color: colors.slateBrand,
  },
  hint: {
    ...(fonts.bodySm as object),
    color: colors.slateBrand,
    textAlign: 'center',
    marginTop: 8,
  },
})
