import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'

export default function SearchScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.placeholder}>
        <Text style={styles.label}>Search — Session 5</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { ...(fonts.bodyMd as object), color: colors.slateBrand },
})
