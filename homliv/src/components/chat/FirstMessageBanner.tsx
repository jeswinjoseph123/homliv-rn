import { useMemo } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useTheme } from '../../hooks/useTheme'
import { fonts } from '../../constants/typography'

type Props = { onDismiss: () => void }

export function FirstMessageBanner({ onDismiss }: Props) {
  const styles = useStyles()
  return (
    <View style={styles.container}>
      <Text style={styles.shield}>🛡️</Text>
      <Text style={styles.text}>
        Never send a deposit before viewing the property in person.
      </Text>
      <Pressable onPress={onDismiss} hitSlop={8} style={styles.dismiss}>
        <Text style={styles.dismissIcon}>×</Text>
      </Pressable>
    </View>
  )
}

function useStyles() {
  const { colors } = useTheme()
  return useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      backgroundColor: colors.amberBg,
      borderRadius: 12,
      padding: 12,
      marginHorizontal: 16,
      marginVertical: 8,
    },
    shield: { fontSize: 16, lineHeight: 20 },
    text: { ...(fonts.bodySm as object), color: colors.amber, flex: 1 },
    dismiss: { paddingLeft: 4 },
    dismissIcon: { ...(fonts.titleMd as object), color: colors.slateBrand, lineHeight: 20 },
  }), [colors])
}
