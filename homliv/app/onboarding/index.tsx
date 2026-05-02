import { useMemo, useRef, useState } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet, Dimensions } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { gradients } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'
import { useTheme } from '../../src/hooks/useTheme'

const { width: W, height: H } = Dimensions.get('window')

const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80',
    label: '01',
    heading: 'Find your\nhome in Ireland',
    body: 'Thousands of verified listings — apartments, rooms, and houses. No middlemen.',
    feature: '✓ BER rated · ✓ No agency fees · ✓ Verified landlords',
  },
  {
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80',
    label: '02',
    heading: 'Direct.\nNo agents.',
    body: 'Message landlords instantly. Real people, real responses. Viewings in one tap.',
    feature: '✓ Instant chat · ✓ Viewing requests · ✓ Read receipts',
  },
  {
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&q=80',
    label: '03',
    heading: 'Own a\nproperty?',
    body: 'Manage rentals from your phone. RTB-compliant, maintenance tracking, rent ledger.',
    feature: '✓ RTB compliant · ✓ Maintenance tracker · ✓ Rent ledger',
  },
]

function Dots({ active }: { active: number }) {
  const styles = useStyles()
  return (
    <View style={styles.dots} accessibilityLabel={`Page ${active + 1} of ${SLIDES.length}`}>
      {SLIDES.map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i === active && styles.dotActive]}
        />
      ))}
    </View>
  )
}

export default function OnboardingScreen() {
  const styles = useStyles()
  const router = useRouter()
  const scrollRef = useRef<ScrollView>(null)
  const [page, setPage] = useState(0)

  const goTo = (idx: number) => {
    scrollRef.current?.scrollTo({ x: idx * W, animated: true })
    setPage(idx)
  }

  const goToAuth = () => router.replace('/auth/login')

  const isLast = page === SLIDES.length - 1

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / W)
          if (idx !== page) setPage(idx)
        }}
        scrollEventThrottle={16}
        decelerationRate="fast"
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={styles.slide}>
            <Image
              source={{ uri: slide.image }}
              contentFit="cover"
              cachePolicy="memory-disk"
              style={StyleSheet.absoluteFill}
            />

            <LinearGradient
              colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.88)']}
              locations={[0, 0.45, 1]}
              style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
              <View style={styles.topBar}>
                <Text style={styles.brand}>
                  <Text style={styles.brandHom}>Hom</Text>
                  <Text style={styles.brandLiv}>Liv</Text>
                </Text>
                <Pressable
                  onPress={goToAuth}
                  hitSlop={12}
                  accessibilityLabel="Skip onboarding"
                  accessibilityRole="button"
                >
                  <Text style={styles.skip}>Skip</Text>
                </Pressable>
              </View>

              <View style={styles.content}>
                <Text style={styles.slideNum}>{slide.label}</Text>
                <Text style={styles.heading}>{slide.heading}</Text>
                <Text style={styles.body}>{slide.body}</Text>
                <View style={styles.featureTag}>
                  <Text style={styles.featureText}>{slide.feature}</Text>
                </View>

                <Dots active={page} />

                {isLast ? (
                  <View style={styles.ctaGroup}>
                    <LinearGradient
                      colors={gradients.coral}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.ctaGrad}
                    >
                      <Pressable
                        onPress={goToAuth}
                        style={styles.ctaBtn}
                        accessibilityLabel="Get started with HomLiv"
                        accessibilityRole="button"
                      >
                        <Text style={styles.ctaBtnText}>Get started</Text>
                      </Pressable>
                    </LinearGradient>
                    <Pressable
                      onPress={goToAuth}
                      style={styles.signInBtn}
                      accessibilityLabel="Sign in to HomLiv"
                      accessibilityRole="button"
                    >
                      <Text style={styles.signInText}>Already have an account? Sign in</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => goTo(i + 1)}
                    style={styles.nextBtn}
                    accessibilityLabel="Next slide"
                    accessibilityRole="button"
                  >
                    <Text style={styles.nextBtnText}>Next  →</Text>
                  </Pressable>
                )}
              </View>
            </SafeAreaView>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

function useStyles() {
  const { colors } = useTheme()
  return useMemo(() => StyleSheet.create({
    root: { flex: 1 },
    slide: { width: W, height: H },
    safeArea: { flex: 1, justifyContent: 'space-between' },

    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 8,
    },
    brand: { ...(fonts.titleLg as object) },
    brandHom: { color: '#ffffff' },
    brandLiv: { color: colors.coral },
    skip: { ...(fonts.labelMd as object), color: colors.whiteMid },

    content: {
      paddingHorizontal: 24,
      paddingBottom: 16,
      gap: 12,
    },
    slideNum: {
      ...(fonts.labelSm as object),
      color: colors.coral,
      letterSpacing: 2,
    },
    heading: {
      ...(fonts.displayMd as object),
      color: '#ffffff',
      lineHeight: 44,
    },
    body: {
      ...(fonts.bodyLg as object),
      color: colors.whiteHigh,
      lineHeight: 24,
    },
    featureTag: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255,255,255,0.12)',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.18)',
    },
    featureText: { ...(fonts.labelSm as object), color: colors.whiteHigh },

    dots: { flexDirection: 'row', gap: 6, paddingVertical: 4 },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(255,255,255,0.35)',
    },
    dotActive: {
      backgroundColor: colors.coral,
      width: 20,
    },

    ctaGroup: { gap: 12 },
    ctaGrad: { borderRadius: 16 },
    ctaBtn: {
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ctaBtnText: { ...(fonts.titleMd as object), color: '#ffffff' },

    signInBtn: { alignItems: 'center', paddingVertical: 8 },
    signInText: { ...(fonts.bodyMd as object), color: colors.whiteMid },

    nextBtn: {
      height: 56,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.30)',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.10)',
    },
    nextBtnText: { ...(fonts.titleSm as object), color: '#ffffff' },
  }), [colors])
}
