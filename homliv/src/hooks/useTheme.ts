import { useColorScheme } from 'react-native'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { lightColors, darkColors, type ColorTokens } from '../constants/colors'

export type ThemeMode = 'light' | 'dark' | 'auto'

type ThemeStore = {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'auto',
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'homliv-theme',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)

export function useTheme(): { colors: ColorTokens; isDark: boolean; mode: ThemeMode; setMode: (m: ThemeMode) => void } {
  const systemScheme = useColorScheme()
  const mode = useThemeStore((s) => s.mode)
  const setMode = useThemeStore((s) => s.setMode)

  const isDark = mode === 'dark' || (mode === 'auto' && systemScheme === 'dark')
  const colors = isDark ? darkColors : lightColors

  return { colors, isDark, mode, setMode }
}
