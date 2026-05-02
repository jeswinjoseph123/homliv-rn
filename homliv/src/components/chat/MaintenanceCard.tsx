import { memo, useMemo } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { useTheme } from '../../hooks/useTheme'
import { fonts } from '../../constants/typography'
import type { Message } from '../../types'

type Props = {
  message: Message
  isLandlord: boolean
  onAcknowledge: () => void
}

type Status = 'open' | 'in_progress' | 'resolved'

function StatusBadge({ status }: { status: Status }) {
  const { colors } = useTheme()
  const styles = useStyles()
  const label = status === 'open' ? 'OPEN' : status === 'in_progress' ? 'IN PROGRESS' : 'RESOLVED'
  const bg = status === 'resolved' ? colors.greenBg : colors.amberBg
  const textColor = status === 'resolved' ? colors.green : colors.amber

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
    </View>
  )
}

export const MaintenanceCard = memo(function MaintenanceCard({ message, isLandlord, onAcknowledge }: Props) {
  const styles = useStyles()
  const data = message.maintenanceData
  if (!data) return null

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>🔧</Text>
        <Text style={styles.category} numberOfLines={1}>{data.category}</Text>
        <StatusBadge status={data.status} />
      </View>

      <Text style={styles.description}>{data.description}</Text>

      {data.photos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photos}
        >
          {data.photos.map((uri, i) => (
            <Image
              key={i}
              source={{ uri }}
              style={styles.photo}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ))}
        </ScrollView>
      )}

      {isLandlord && data.status !== 'resolved' && (
        <View style={styles.footer}>
          <Pressable style={styles.acknowledgeBtn} onPress={onAcknowledge}>
            <Text style={styles.acknowledgeBtnText}>✓ Acknowledge</Text>
          </Pressable>
          <Pressable style={styles.photosBtn}>
            <Text style={styles.photosBtnText}>View photos</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
})

function useStyles() {
  const { colors } = useTheme()
  return useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.amberBg,
      borderWidth: 1.5,
      borderColor: `${colors.amber}40`,
      borderRadius: 16,
      padding: 14,
      marginVertical: 4,
      maxWidth: '90%',
      alignSelf: 'center',
      gap: 10,
    },
    header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    icon: { fontSize: 16 },
    category: { ...(fonts.titleSm as object), color: colors.jet, flex: 1 },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    badgeText: { ...(fonts.labelSm as object) },
    description: { ...(fonts.bodySm as object), color: colors.ink },
    photos: { gap: 6 },
    photo: { width: 56, height: 56, borderRadius: 10 },
    footer: { flexDirection: 'row', gap: 8 },
    acknowledgeBtn: {
      flex: 1,
      backgroundColor: colors.greenBg,
      borderRadius: 10,
      padding: 10,
      alignItems: 'center',
    },
    acknowledgeBtnText: { ...(fonts.labelMd as object), color: colors.green },
    photosBtn: {
      flex: 1,
      backgroundColor: colors.surfaceLow,
      borderRadius: 10,
      padding: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: `${colors.ghost}40`,
    },
    photosBtnText: { ...(fonts.labelMd as object), color: colors.jet },
  }), [colors])
}
