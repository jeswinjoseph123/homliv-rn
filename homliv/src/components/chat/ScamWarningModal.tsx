import { Modal, View, Text, Pressable, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, gradients } from '../../constants/colors'
import { fonts } from '../../constants/typography'

type Props = {
  visible: boolean
  onCancel: () => void
  onProceed: () => void
}

export function ScamWarningModal({ visible, onCancel, onProceed }: Props) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>⚠️ Sharing contact details</Text>
          <Text style={styles.body}>
            Sharing phone numbers or bank details outside HomLiv removes scam protection.
            Scammers often ask for deposits without viewings.
          </Text>
          <Pressable onPress={onCancel} style={styles.cancelBtn}>
            <LinearGradient
              colors={gradients.coral}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.cancelLabel}>Cancel</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={onProceed} style={styles.proceedBtn}>
            <Text style={styles.proceedLabel}>Send anyway</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 24,
    gap: 16,
    width: '100%',
    maxWidth: 360,
  },
  title: {
    ...(fonts.titleLg as object),
    color: colors.jet,
  },
  body: {
    ...(fonts.bodyMd as object),
    color: colors.slateBrand,
  },
  cancelBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  btnGradient: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLabel: {
    ...(fonts.titleSm as object),
    color: '#ffffff',
  },
  proceedBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.redBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proceedLabel: {
    ...(fonts.titleSm as object),
    color: colors.red,
  },
})
