import { useState, useCallback } from 'react'
import { View, Text, TextInput, Pressable, ScrollView, Alert, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, router } from 'expo-router'
import { colors } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'
import { useSession } from '../../src/hooks/useSession'
import { mockSessionUser } from '../../src/data/users'
import { VerificationBadge } from '../../src/components/shared/VerificationBadge'

type SettingsRowProps = {
  label: string
  onPress: () => void
  labelColor?: string
  detail?: string
}

function SettingsRow({ label, onPress, labelColor, detail }: SettingsRowProps) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Text style={[styles.rowLabel, labelColor ? { color: labelColor } : undefined]}>{label}</Text>
      <View style={styles.rowRight}>
        {detail ? <Text style={styles.rowDetail}>{detail}</Text> : null}
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  )
}

function SectionHeader({ title, first }: { title: string; first?: boolean }) {
  return (
    <Text style={[styles.sectionLabel, !first && { marginTop: 28 }]}>{title}</Text>
  )
}

export default function SettingsScreen() {
  const routerHook = useRouter()
  const sessionUser = useSession((s) => s.user) ?? mockSessionUser
  const [name, setName] = useState(sessionUser.name)
  const [email, setEmail] = useState(sessionUser.email)
  const [phone, setPhone] = useState(sessionUser.phone)
  const level = sessionUser.verificationLevel

  const handleSave = useCallback(() => {
    Alert.alert('Changes saved', 'Your profile has been updated.')
  }, [])

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete account?',
      'All your data will be permanently deleted. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete account',
          style: 'destructive',
          onPress: () =>
            Alert.alert('Account deletion requested', 'Our team will process your request within 48 hours.'),
        },
      ],
    )
  }, [])

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/')} hitSlop={8}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <Pressable onPress={handleSave} hitSlop={8}>
          <Text style={styles.saveBtn}>Save</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Account */}
        <SectionHeader title="Account" first />
        <View style={styles.card}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.fieldInput}
              placeholderTextColor={colors.slateBrand}
            />
          </View>
          <View style={[styles.fieldRow, styles.fieldRowBorder]}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.fieldInput}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.slateBrand}
            />
          </View>
          <View style={[styles.fieldRow, styles.fieldRowBorder]}>
            <Text style={styles.fieldLabel}>Phone</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              style={styles.fieldInput}
              keyboardType="phone-pad"
              placeholderTextColor={colors.slateBrand}
            />
          </View>
        </View>
        <View style={styles.card}>
          <SettingsRow
            label="Change password"
            onPress={() => Alert.alert('Change password', 'A reset link will be sent to your email.')}
          />
        </View>

        {/* Verification */}
        <SectionHeader title="Verification" />
        <View style={styles.card}>
          <View style={styles.verifyRow}>
            <Text style={styles.rowLabel}>Current level</Text>
            <VerificationBadge level={level} />
          </View>
          {level === 'none' || level === 'contact' ? (
            <>
              <View style={[styles.row, styles.fieldRowBorder]}>
                <Text style={styles.rowLabel}>Upgrade to Verified Homeowner</Text>
                <Text style={styles.chevron}>›</Text>
              </View>
              <View style={[styles.row, styles.fieldRowBorder]}>
                <Text style={styles.rowLabel}>Upgrade to Verified Landlord</Text>
                <Text style={styles.chevron}>›</Text>
              </View>
            </>
          ) : null}
        </View>

        {/* Preferences */}
        <SectionHeader title="Preferences" />
        <View style={styles.card}>
          <SettingsRow
            label="Notifications"
            onPress={() => routerHook.push('/me/settings/notifications')}
          />
          <View style={styles.fieldRowBorder}>
            <SettingsRow
              label="Privacy & Blocked"
              onPress={() => routerHook.push('/me/settings/blocked')}
            />
          </View>
        </View>

        {/* App */}
        <SectionHeader title="App" />
        <View style={styles.card}>
          <SettingsRow
            label="Rate HomLiv"
            onPress={() => Alert.alert('Rate HomLiv', 'Thank you! Redirecting to the App Store.')}
          />
          <View style={styles.fieldRowBorder}>
            <SettingsRow
              label="Send feedback"
              onPress={() => Alert.alert('Send feedback', 'Email us at hello@homliv.ie')}
            />
          </View>
          <View style={styles.fieldRowBorder}>
            <SettingsRow
              label="About"
              onPress={() => Alert.alert('HomLiv', 'Version 1.0.0\nMade with ❤️ in Ireland')}
              detail="1.0.0"
            />
          </View>
        </View>

        {/* Danger zone */}
        <SectionHeader title="Danger zone" />
        <View style={[styles.card, styles.dangerCard]}>
          <Pressable onPress={handleDeleteAccount} style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.red }]}>Delete account</Text>
          </Pressable>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceLow },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${colors.ghost}40`,
  },
  back: { ...(fonts.bodyMd as object), color: colors.coral },
  title: { ...(fonts.titleMd as object), color: colors.jet },
  saveBtn: { ...(fonts.titleSm as object), color: colors.coral },
  content: { paddingHorizontal: 20, paddingTop: 16 },
  sectionLabel: {
    ...(fonts.labelMd as object),
    color: colors.slateBrand,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${colors.ghost}30`,
  },
  dangerCard: {
    backgroundColor: colors.redBg,
    borderColor: `${colors.red}20`,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  fieldRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: `${colors.ghost}30`,
  },
  fieldLabel: {
    ...(fonts.labelMd as object),
    color: colors.slateBrand,
    width: 54,
  },
  fieldInput: {
    ...(fonts.bodyMd as object),
    color: colors.jet,
    flex: 1,
  },
  verifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLabel: { ...(fonts.bodyMd as object), color: colors.jet, flex: 1 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowDetail: { ...(fonts.bodySm as object), color: colors.slateBrand },
  chevron: { ...(fonts.titleMd as object), color: colors.slateBrand },
})
