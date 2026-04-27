import { useEffect } from 'react'
import { Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useSession } from './useSession'

export function useRequireAuth(opts?: { requireLandlord?: boolean }) {
  const router = useRouter()
  const user = useSession((s) => s.user)
  const hasHydrated = useSession((s) => s.hasHydrated)

  useEffect(() => {
    if (!hasHydrated) return
    if (!user) {
      router.replace('/auth/login')
      return
    }
    if (opts?.requireLandlord && !user.roles.includes('landlord')) {
      Alert.alert('Landlord account required', 'You need a landlord account to access this area.')
      router.replace('/me')
    }
  }, [user, hasHydrated, opts?.requireLandlord])
}
