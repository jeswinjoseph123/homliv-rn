import { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../../constants/colors'
import { fonts } from '../../constants/typography'
import type { Message } from '../../types'

type Props = {
  message: Message
  isOwn: boolean
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })
}

export const MessageBubble = memo(function MessageBubble({ message, isOwn }: Props) {
  if (!message.text) return null

  return (
    <View style={isOwn ? styles.ownWrapper : styles.otherWrapper}>
      <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        <Text style={isOwn ? styles.ownText : styles.otherText}>{message.text}</Text>
        <Text style={isOwn ? styles.ownTimestamp : styles.otherTimestamp}>
          {formatTime(message.createdAt)}
        </Text>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  ownWrapper: {
    alignItems: 'flex-end',
    marginVertical: 2,
  },
  otherWrapper: {
    alignItems: 'flex-start',
    marginVertical: 2,
  },
  bubble: {
    maxWidth: '72%',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  ownBubble: {
    backgroundColor: colors.jet,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  otherBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: `${colors.ghost}15`,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
  },
  ownText: {
    ...(fonts.bodyMd as object),
    color: 'white',
  },
  otherText: {
    ...(fonts.bodyMd as object),
    color: colors.ink,
  },
  ownTimestamp: {
    ...(fonts.labelSm as object),
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'right',
    marginTop: 4,
  },
  otherTimestamp: {
    ...(fonts.labelSm as object),
    color: colors.slateBrand,
    marginTop: 4,
  },
})
