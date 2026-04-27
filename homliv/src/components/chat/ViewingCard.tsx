import { memo } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/typography'
import { useChatStore } from '../../hooks/useChatStore'
import type { Message } from '../../types'

type Props = {
  message: Message
  isLandlord: boolean
  convId: string
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatSlot(date: Date): string {
  const day = DAYS[date.getDay()]
  const d = date.getDate()
  const month = MONTHS[date.getMonth()]
  const time = date.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })
  return `${day} ${d} ${month} · ${time}`
}

function formatConfirmedSlot(date: Date): string {
  const day = DAYS[date.getDay()]
  const d = date.getDate()
  const month = MONTHS[date.getMonth()]
  const time = date.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })
  return `${day} ${d} ${month} at ${time}`
}

export const ViewingCard = memo(function ViewingCard({ message, isLandlord, convId }: Props) {
  const confirmViewingSlot = useChatStore((s) => s.confirmViewingSlot)

  if (message.type === 'viewing_confirmed') {
    const confirmed = message.viewingData?.confirmedSlot
    return (
      <View style={styles.confirmedContainer}>
        <Text style={styles.confirmedTitle}>Viewing confirmed</Text>
        {confirmed && (
          <Text style={styles.confirmedSlot}>{formatConfirmedSlot(confirmed)}</Text>
        )}
        {message.viewingData?.note && (
          <Text style={styles.address}>{message.viewingData.note}</Text>
        )}
      </View>
    )
  }

  if (message.type !== 'viewing_request') return null

  const data = message.viewingData
  if (!data) return null

  const confirmedSlot = data.confirmedSlot

  return (
    <View style={styles.requestContainer}>
      <View style={styles.header}>
        <Text style={styles.calIcon}>📅</Text>
        <Text style={styles.requestTitle}>Viewing request</Text>
      </View>

      {data.note && <Text style={styles.note}>{data.note}</Text>}

      <View style={styles.slots}>
        {data.slots.map((slot, i) => {
          const isConfirmed =
            confirmedSlot !== undefined &&
            slot.getTime() === confirmedSlot.getTime()

          if (isConfirmed) {
            return (
              <View key={i} style={[styles.slot, styles.confirmedSlotItem]}>
                <Text style={styles.confirmedSlotText}>{formatSlot(slot)}</Text>
              </View>
            )
          }

          if (isLandlord) {
            return (
              <Pressable
                key={i}
                style={styles.slot}
                onPress={() => confirmViewingSlot(convId, slot)}
              >
                <Text style={styles.slotText}>{formatSlot(slot)}</Text>
              </Pressable>
            )
          }

          return (
            <View key={i} style={styles.slot}>
              <Text style={styles.slotText}>{formatSlot(slot)}</Text>
            </View>
          )
        })}
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  requestContainer: {
    backgroundColor: colors.surfaceLow,
    borderWidth: 1,
    borderColor: `${colors.ghost}40`,
    borderRadius: 16,
    padding: 14,
    maxWidth: '90%',
    alignSelf: 'center',
    gap: 10,
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calIcon: {
    fontSize: 16,
  },
  requestTitle: {
    ...(fonts.titleSm as object),
    color: colors.jet,
  },
  note: {
    ...(fonts.bodySm as object),
    color: colors.slateBrand,
  },
  slots: {
    gap: 8,
  },
  slot: {
    borderWidth: 1.5,
    borderColor: `${colors.ghost}40`,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  slotText: {
    ...(fonts.bodySm as object),
    color: colors.jet,
  },
  confirmedSlotItem: {
    backgroundColor: colors.greenBg,
    borderColor: `${colors.green}30`,
  },
  confirmedSlotText: {
    ...(fonts.bodySm as object),
    color: colors.green,
    fontWeight: '700',
  },
  confirmedContainer: {
    backgroundColor: colors.greenBg,
    borderColor: `${colors.green}30`,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    maxWidth: '90%',
    alignSelf: 'center',
    gap: 8,
    marginVertical: 4,
  },
  confirmedTitle: {
    ...(fonts.titleSm as object),
    color: colors.green,
  },
  confirmedSlot: {
    ...(fonts.bodySm as object),
    color: colors.ink,
  },
  address: {
    ...(fonts.labelSm as object),
    color: colors.slateBrand,
  },
})
