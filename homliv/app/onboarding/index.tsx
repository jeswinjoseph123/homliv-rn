import { useRef, useState } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { colors, gradients } from '../../src/constants/colors'
import { fonts } from '../../src/constants/typography'

const { width: W } = Dimensions.get('window')
const SCREENS = 3

function FeatureRow({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <View style={styles.featureRow} accessible accessibilityLabel={`${title}: ${body}`}>
      <View style={styles.featureIcon}>
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureBody}>{body}</Text>
      </View>
    </View>
  )
}

function Dots({ active, dark }: { active: number; dark?: boolean }) {
  return (
    <View
      style={styles.dots}
      accessibilityLabel={`Page ${active + 1} of ${SCREENS}`}
      accessibilityRole="none"
    >
      {Array.from({ length: SCREENS }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            dark ? styles.dotDark : styles.dotLight,
            i === active && (dark ? styles.dotActiveDark : styles.dotActiveLight),
          ]}
        />
      ))}
    </View>
  )
}

export default function OnboardingScreen() {
  const router = useRouter()
  const scrollRef = useRef<ScrollView>(null)
  const [page, setPage] = useState(0)

  const goTo = (idx: number) => {
    scrollRef.current?.scrollTo({ x: idx * W, animated: true })
    setPage(idx)
  }

  const goToAuth = () => router.replace('/auth/login')

  const handleScrollEnd = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / W)
    if (idx !== page) setPage(idx)
  }

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        decelerationRate="fast"
      >
        {/* Screen 1: Welcome */}
        <LinearGradient
          colors={gradients.dark}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.screen}
        >
          <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <Pressable
              onPress={goToAuth}
              style={styles.skipBtn}
              accessibilityLabel="Skip onboarding"
              accessibilityRole="button"
              hitSlop={12}
            >
              <Text style={styles.skipDark}>Skip</Text>
            </Pressable>

            <View style={styles.welcomeMain}>
              <View style={styles.logoWrap}>
                <Text style={styles.logoEmoji}>🏠</Text>
              </View>
              <Text style={styles.logoName}>HomLiv</Text>
              <Text style={styles.tagline}>Ireland's honest{'\n'}rental platform</Text>

              <View style={styles.previewCard}>
                <LinearGradient
                  colors={gradients.slate}
                  style={styles.previewImg}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <View style={styles.previewBody}>
                  <Text style={styles.previewTitle} numberOfLines={1}>2-bed apartment, Grand Canal Dock</Text>
                  <Text style={styles.previewPrice}>€2,200/mo</Text>
                  <Text style={styles.previewMeta}>📍 Dublin 2  ·  BER A2  ·  ✅ Verified</Text>
                </View>
              </View>
            </View>

            <View style={styles.bottomActions}>
              <LinearGradient
                colors={gradients.coral}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.coralGrad}
              >
                <Pressable
                  onPress={goToAuth}
                  style={styles.fullBtn}
                  accessibilityLabel="Get started with HomLiv"
                  accessibilityRole="button"
                >
                  <Text style={styles.fullBtnText}>Get started</Text>
                </Pressable>
              </LinearGradient>
              <Pressable
                onPress={goToAuth}
                style={styles.outlineBtn}
                accessibilityLabel="Sign in to HomLiv"
                accessibilityRole="button"
              >
                <Text style={styles.outlineBtnText}>Sign in</Text>
              </Pressable>
              <Dots active={page} dark />
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Screen 2: Find your room */}
        <View style={[styles.screen, styles.lightBg]}>
          <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <Pressable
              onPress={goToAuth}
              style={styles.skipBtn}
              accessibilityLabel="Skip onboarding"
              accessibilityRole="button"
              hitSlop={12}
            >
              <Text style={styles.skipLight}>Skip</Text>
            </Pressable>

            <View style={styles.lightMain}>
              <Text style={styles.lightHeading}>Find your room{'\n'}in Ireland</Text>
              <Text style={styles.lightSub}>Thousands of verified listings. No middlemen.</Text>
              <View style={styles.features}>
                <FeatureRow icon="🔍" title="Verified listings" body="Every landlord is identity-checked before listing." />
                <FeatureRow icon="💬" title="Direct chat" body="Message landlords directly. No agents or fees." />
                <FeatureRow icon="❤️" title="Save and search" body="Set alerts for your perfect room and get notified." />
              </View>
            </View>

            <View style={styles.bottomActions}>
              <Pressable
                onPress={() => goTo(2)}
                style={styles.nextBtn}
                accessibilityLabel="Next screen"
                accessibilityRole="button"
              >
                <Text style={styles.nextBtnText}>Next →</Text>
              </Pressable>
              <Dots active={page} />
            </View>
          </SafeAreaView>
        </View>

        {/* Screen 3: Own a property */}
        <View style={[styles.screen, styles.lightBg]}>
          <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <Pressable
              onPress={goToAuth}
              style={styles.skipBtn}
              accessibilityLabel="Skip onboarding"
              accessibilityRole="button"
              hitSlop={12}
            >
              <Text style={styles.skipLight}>Skip</Text>
            </Pressable>

            <View style={styles.lightMain}>
              <Text style={styles.lightHeading}>Own a{'\n'}property?</Text>
              <Text style={styles.lightSub}>Manage your rentals simply, from your phone.</Text>
              <View style={styles.features}>
                <FeatureRow icon="📋" title="RTB-compliant" body="Listings follow Irish rental law by default." />
                <FeatureRow icon="🔧" title="Maintenance tracking" body="Log and resolve maintenance requests instantly." />
                <FeatureRow icon="💳" title="Rent ledger" body="Track payments and keep records in one place." />
              </View>
            </View>

            <View style={styles.bottomActions}>
              <LinearGradient
                colors={gradients.coral}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.coralGrad}
              >
                <Pressable
                  onPress={goToAuth}
                  style={styles.fullBtn}
                  accessibilityLabel="Start browsing HomLiv"
                  accessibilityRole="button"
                >
                  <Text style={styles.fullBtnText}>Start browsing</Text>
                </Pressable>
              </LinearGradient>
              <Pressable
                onPress={goToAuth}
                accessibilityLabel="Already have an account? Sign in"
                accessibilityRole="button"
                hitSlop={8}
              >
                <Text style={styles.signInLink}>Already have an account? Sign in</Text>
              </Pressable>
              <Dots active={page} />
            </View>
          </SafeAreaView>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: { width: W, flex: 1 },
  lightBg: { backgroundColor: colors.surfaceLow },
  safeArea: { flex: 1 },

  skipBtn: {
    position: 'absolute',
    top: 0,
    right: 20,
    zIndex: 10,
    paddingVertical: 8,
  },
  skipDark: { ...(fonts.labelMd as object), color: colors.whiteMid },
  skipLight: { ...(fonts.labelMd as object), color: colors.slateBrand },

  // Screen 1
  welcomeMain: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.whiteLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 36 },
  logoName: {
    ...(fonts.displayLg as object),
    color: colors.coral,
    letterSpacing: -1,
  },
  tagline: {
    ...(fonts.titleLg as object),
    color: colors.whiteHigh,
    textAlign: 'center',
    lineHeight: 32,
  },
  previewCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 8,
  },
  previewImg: { height: 120, width: '100%' },
  previewBody: { padding: 12, gap: 3 },
  previewTitle: { ...(fonts.titleSm as object), color: colors.jet },
  previewPrice: { ...(fonts.price as object), color: colors.coral, fontSize: 16 },
  previewMeta: { ...(fonts.labelSm as object), color: colors.slateBrand },

  // Bottom actions
  bottomActions: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 12,
    alignItems: 'center',
  },
  coralGrad: { width: '100%', borderRadius: 16 },
  fullBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  fullBtnText: { ...(fonts.titleSm as object), color: '#ffffff' },
  outlineBtn: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.whiteLow,
    minHeight: 52,
    justifyContent: 'center',
  },
  outlineBtnText: { ...(fonts.titleSm as object), color: colors.whiteHigh },
  signInLink: { ...(fonts.bodyMd as object), color: colors.slateBrand },

  // Screen 2 & 3
  lightMain: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 64,
    gap: 8,
  },
  lightHeading: {
    ...(fonts.displayMd as object),
    color: colors.jet,
    lineHeight: 44,
    marginBottom: 4,
  },
  lightSub: {
    ...(fonts.bodyLg as object),
    color: colors.slateBrand,
    marginBottom: 16,
  },
  features: { gap: 16 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1, gap: 2 },
  featureTitle: { ...(fonts.titleSm as object), color: colors.jet },
  featureBody: { ...(fonts.bodySm as object), color: colors.slateBrand },

  nextBtn: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: colors.jet,
    minHeight: 52,
    justifyContent: 'center',
  },
  nextBtnText: { ...(fonts.titleSm as object), color: '#ffffff' },

  // Dots
  dots: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotDark: { backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActiveDark: { backgroundColor: '#ffffff', width: 20 },
  dotLight: { backgroundColor: `${colors.slateBrand}40` },
  dotActiveLight: { backgroundColor: colors.coral, width: 20 },
})
