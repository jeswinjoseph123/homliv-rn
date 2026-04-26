import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'

export default function LandlordScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.placeholder}>
        <Text style={styles.label}>Landlord Dashboard — Session 7</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceLow },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { ...(fonts.bodyMd as object), color: colors.slateBrand },
})
