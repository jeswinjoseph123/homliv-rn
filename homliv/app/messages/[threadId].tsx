import { View, Text, StyleSheet } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'

export default function ChatThreadScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.placeholder}>
        <Text style={styles.label}>Chat {threadId} — Session 4</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceLow },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { ...(fonts.bodyMd as object), color: colors.slateBrand },
})
