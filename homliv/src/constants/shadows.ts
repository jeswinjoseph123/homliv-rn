import { ViewStyle } from 'react-native'

export const shadows: Record<string, ViewStyle> = {
  card:      { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  cardHover: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 8 },
  dashboard: { shadowColor: '#17172b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.09, shadowRadius: 20, elevation: 5 },
  coral:     { shadowColor: '#b45028', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.30, shadowRadius: 16, elevation: 6 },
  navbar:    { shadowColor: '#12141f', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.50, shadowRadius: 24, elevation: 12 },
}
