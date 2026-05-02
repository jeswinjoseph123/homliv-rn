import { useMemo } from 'react'
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native'
import * as Haptics from 'expo-haptics'
import { useTheme } from '../../hooks/useTheme'
import { fonts } from '../../constants/typography'

export type FilterKey =
  | 'All'
  | 'Rooms'
  | 'Apartments'
  | 'Houses'
  | 'South Asian'
  | 'Female only'
  | 'Veg-friendly'
  | 'Students'
  | 'Pets OK'
  | 'Quiet home'

const CHIPS: { key: FilterKey; label: string }[] = [
  { key: 'All',          label: 'All'             },
  { key: 'Rooms',        label: 'Rooms 🛏️'        },
  { key: 'Apartments',   label: 'Apartments 🏢'   },
  { key: 'Houses',       label: 'Houses 🏡'       },
  { key: 'South Asian',  label: 'South Asian 🌶️' },
  { key: 'Female only',  label: 'Female only 👩'  },
  { key: 'Veg-friendly', label: 'Veg-friendly 🥦' },
  { key: 'Students',     label: 'Students 🎓'     },
  { key: 'Pets OK',      label: 'Pets OK 🐾'      },
  { key: 'Quiet home',   label: 'Quiet home 🤫'   },
]

type Props = {
  active: FilterKey
  onChange: (key: FilterKey) => void
}

export function FilterChips({ active, onChange }: Props) {
  const styles = useStyles()
  const handlePress = (key: FilterKey) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onChange(key)
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scroll}
    >
      {CHIPS.map(({ key, label }) => {
        const isActive = key === active
        return (
          <Pressable
            key={key}
            onPress={() => handlePress(key)}
            style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
          >
            <Text style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}>
              {label}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

function useStyles() {
  const { colors } = useTheme()
  return useMemo(() => StyleSheet.create({
    scroll: { marginVertical: 12 },
    container: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
    chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
    chipActive: { backgroundColor: colors.ink },
    chipInactive: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.ghost },
    label: { ...(fonts.bodySm as object), fontWeight: '500' },
    labelActive: { color: colors.surface },
    labelInactive: { color: colors.ink },
  }), [colors])
}
