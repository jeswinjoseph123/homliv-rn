import { TextStyle } from 'react-native'

export const fonts: Record<string, TextStyle> = {
  displayLg:  { fontSize: 40, fontWeight: '700', letterSpacing: -1.6, lineHeight: 44 },
  displayMd:  { fontSize: 28, fontWeight: '700', letterSpacing: -0.84, lineHeight: 32 },
  titleLg:    { fontSize: 20, fontWeight: '700', letterSpacing: -0.4, lineHeight: 24 },
  titleMd:    { fontSize: 17, fontWeight: '600', letterSpacing: -0.34, lineHeight: 22 },
  titleSm:    { fontSize: 15, fontWeight: '600', letterSpacing: -0.3, lineHeight: 20 },
  bodyLg:     { fontSize: 17, fontWeight: '400', lineHeight: 26 },
  bodyMd:     { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodySm:     { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  labelMd:    { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, lineHeight: 16 },
  labelSm:    { fontSize: 11, fontWeight: '600', letterSpacing: 0.4, lineHeight: 14 },
  price:      { fontSize: 20, fontWeight: '700', letterSpacing: -0.4 },
  priceLg:    { fontSize: 28, fontWeight: '800', letterSpacing: -0.6 },
}
