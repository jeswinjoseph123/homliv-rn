import { useMemo } from 'react'
import { View, Text, Switch, ScrollView, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '../../../src/hooks/useTheme'
import { fonts } from '../../../src/constants/typography'
import { useNotifSettings } from '../../../src/hooks/useNotifSettings'

type Medium = 'push' | 'email' | 'sms'
type Channel = 'messages' | 'listings' | 'viewings' | 'payments' | 'maintenance' | 'marketing'

const CHANNELS: { id: Channel; label: string }[] = [
  { id: 'messages',    label: 'New messages' },
  { id: 'listings',   label: 'New listings matching saved searches' },
  { id: 'viewings',   label: 'Viewing reminders' },
  { id: 'payments',   label: 'Payment reminders' },
  { id: 'maintenance',label: 'Maintenance updates' },
  { id: 'marketing',  label: 'Marketing & promotions' },
]

const MEDIUMS: { id: Medium; label: string }[] = [
  { id: 'push',  label: 'Push' },
  { id: 'email', label: 'Email' },
  { id: 'sms',   label: 'SMS' },
]

function MediumSection({ medium, label }: { medium: Medium; label: string }) {
  const { colors } = useTheme()
  const settings = useNotifSettings((s) => s[medium])
  const setToggle = useNotifSettings((s) => s.setToggle)
  const styles = useStyles()

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {CHANNELS.map((ch, i) => (
        <View
          key={ch.id}
          style={[
            styles.row,
            i === CHANNELS.length - 1 && styles.rowLast,
          ]}
        >
          <Text style={styles.rowLabel}>{ch.label}</Text>
          <Switch
            value={settings[ch.id]}
            onValueChange={(v) => setToggle(medium, ch.id, v)}
            trackColor={{ false: `${colors.ghost}80`, true: colors.coral }}
            thumbColor={colors.surface}
          />
        </View>
      ))}
    </View>
  )
}

export default function NotificationsSettingsScreen() {
  const styles = useStyles()
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/me/settings')} hitSlop={8}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {MEDIUMS.map((m) => (
          <MediumSection key={m.id} medium={m.id} label={m.label} />
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

function useStyles() {
  const { colors } = useTheme()
  return useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: `${colors.ghost}40`,
    },
    back: { ...(fonts.bodyMd as object), color: colors.coral },
    title: { ...(fonts.titleMd as object), color: colors.jet },
    content: { padding: 20, gap: 24 },
    section: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: `${colors.ghost}40`,
      overflow: 'hidden',
    },
    sectionLabel: {
      ...(fonts.labelMd as object),
      color: colors.slateBrand,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: `${colors.ghost}30`,
    },
    rowLast: {},
    rowLabel: { ...(fonts.bodyMd as object), color: colors.jet, flex: 1, marginRight: 12 },
  }), [colors])
}
