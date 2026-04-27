import { View, Text, Pressable, Alert, StyleSheet } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { colors } from '../../../src/constants/colors'
import { fonts } from '../../../src/constants/typography'
import { useBlocked } from '../../../src/hooks/useBlocked'
import { mockUsers } from '../../../src/data/users'
import { getInitials } from '../../../src/lib/utils'

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>🚫</Text>
      <Text style={styles.emptyTitle}>No blocked users</Text>
      <Text style={styles.emptySub}>Blocked users won't be able to message you.</Text>
    </View>
  )
}

export default function BlockedUsersScreen() {
  const { blockedIds, unblock } = useBlocked()
  const blockedUsers = mockUsers.filter((u) => blockedIds.includes(u.id))

  const handleUnblock = (userId: string, name: string) => {
    Alert.alert(
      `Unblock ${name}?`,
      'They will be able to send you messages again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: () => unblock(userId),
        },
      ],
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/me/settings')} hitSlop={8}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>Blocked Users</Text>
        <View style={{ width: 48 }} />
      </View>

      <FlashList
        data={blockedUsers}
        keyExtractor={(u) => u.id}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={styles.listContent}
        renderItem={({ item: user }) => (
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
            </View>
            <Text style={styles.name}>{user.name}</Text>
            <Pressable
              onPress={() => handleUnblock(user.id, user.name)}
              style={styles.unblockBtn}
            >
              <Text style={styles.unblockLabel}>Unblock</Text>
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
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
  listContent: { padding: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${colors.ghost}30`,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.slateBrand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...(fonts.titleSm as object), color: '#fff' },
  name: { ...(fonts.titleSm as object), color: colors.jet, flex: 1 },
  unblockBtn: {
    borderWidth: 1.5,
    borderColor: `${colors.ghost}80`,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  unblockLabel: { ...(fonts.labelMd as object), color: colors.coral },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { ...(fonts.titleMd as object), color: colors.jet },
  emptySub: { ...(fonts.bodySm as object), color: colors.slateBrand, textAlign: 'center', marginTop: 4 },
})
