import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { AnimatedCard } from '../../src/components/ui/AnimatedScreen';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { OrbIcon } from '../../src/components/ui/OrbIcon';
import { StarField } from '../../src/components/ui/StarField';
import { BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING } from '../../src/constants/theme';

const SYSTEMS = [
  {
    title: 'Western astrology',
    body: 'Best for personality, emotional wiring, and the shape of a day when you need language for what you are feeling.',
    use: 'Open when you want self-understanding and emotional context.',
    source: "Ptolemy's Tetrabiblos",
    accent: COLORS.western,
    secondary: '#ece6ff',
    icon: 'sunny' as const,
    route: '/reading/western',
  },
  {
    title: 'Vedic astrology',
    body: 'Best for timing, karmic periods, and the sense that one chapter of life is giving way to another.',
    use: 'Open when you are asking why this season feels so loaded.',
    source: 'Brihat Parashara Hora Shastra',
    accent: COLORS.vedic,
    secondary: '#ffe6d8',
    icon: 'moon' as const,
    route: '/reading/vedic',
  },
  {
    title: 'Chinese astrology',
    body: 'Best for long cycles, temperament, compatibility, and the element you bring into relationships and routine.',
    use: 'Open when you want the bigger rhythm rather than the daily weather.',
    source: 'The Handbook of Chinese Horoscopes',
    accent: COLORS.chinese,
    secondary: '#ffe7db',
    icon: 'leaf' as const,
    route: '/reading/chinese',
  },
  {
    title: 'KP system',
    body: 'Best for event timing and sharper prediction when you want a more exact answer than broad symbolism can give.',
    use: 'Open when the question is practical and the timing matters.',
    source: 'Krishnamurti Paddhati Reader',
    accent: COLORS.kp,
    secondary: '#e1f5ef',
    icon: 'sparkles' as const,
    route: '/reading/kp',
  },
];

export default function ExploreScreen() {
  const router = useRouter();

  return (
    <StarField>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Guide</Text>

        <AnimatedCard index={0}>
          <View style={styles.posterWrap}>
            <LinearGradient colors={COLORS.gradientInk} style={styles.poster}>
              <Text style={styles.posterLabel}>The reading room</Text>
              <Text style={styles.headline}>Find the right lens before you read deeper.</Text>
              <Text style={styles.copy}>
                Each tradition is useful for a different question. Open the one that matches what you need today.
              </Text>
            </LinearGradient>
            <View style={styles.posterOrb}>
              <OrbIcon icon="book" size={92} accentColor={COLORS.gold} secondaryColor="#fff4cf" active />
            </View>
          </View>
        </AnimatedCard>

        <View style={styles.systemList}>
          {SYSTEMS.map((system, index) => (
            <AnimatedCard key={system.title} index={index + 1}>
              <AnimatedPressable
                onPress={() => router.push(system.route as never)}
                haptic
                style={styles.systemCardShell}
              >
                <LinearGradient colors={COLORS.gradientInkSoft} style={[styles.systemCard, { borderColor: system.accent }]}>
                  <View style={[styles.cardAccent, { backgroundColor: system.accent }]} />

                  <View style={styles.cardTop}>
                    <View style={styles.cardHeading}>
                      <OrbIcon icon={system.icon} size={44} accentColor={system.accent} secondaryColor={system.secondary} />
                      <Text style={styles.cardTitle}>{system.title}</Text>
                    </View>
                    <Text style={styles.openText}>Read now</Text>
                  </View>

                  <Text style={styles.cardBody}>{system.body}</Text>

                  <View style={styles.cardRule} />

                  <Text style={styles.useLabel}>Use when</Text>
                  <Text style={styles.useText}>{system.use}</Text>
                  <Text style={styles.sourceText}>Source - {system.source}</Text>
                </LinearGradient>
              </AnimatedPressable>
            </AnimatedCard>
          ))}
        </View>

        <AnimatedCard index={5}>
          <GradientCard accentColor={COLORS.gold} colors={COLORS.gradientDawn}>
            <Text style={styles.sectionLabel}>How to use the blend</Text>
            <Text style={styles.panelBody}>
              Start with Today for the shared mood. Open one system when a single line in the reading asks for more depth.
            </Text>
          </GradientCard>
        </AnimatedCard>
      </ScrollView>
    </StarField>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 40,
    paddingBottom: 120,
    gap: SPACING.lg,
  },
  kicker: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
  },
  posterWrap: {
    position: 'relative',
    minHeight: 252,
  },
  poster: {
    minHeight: 226,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  posterOrb: {
    position: 'absolute',
    right: 24,
    top: 22,
  },
  posterLabel: {
    color: 'rgba(255,250,241,0.72)',
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
  },
  headline: {
    color: '#fffaf1',
    fontSize: 38,
    lineHeight: 44,
    fontFamily: FONTS.display,
    letterSpacing: -0.8,
    maxWidth: 240,
    marginTop: SPACING.md,
  },
  copy: {
    color: 'rgba(255,250,241,0.82)',
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 240,
    marginTop: SPACING.md,
  },
  sectionLabel: {
    color: COLORS.inkSoft,
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 1.1,
  },
  panelBody: {
    color: COLORS.ink,
    fontSize: 20,
    lineHeight: 28,
    fontFamily: FONTS.heading,
  },
  systemList: {
    gap: SPACING.md,
  },
  systemCardShell: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  systemCard: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    gap: SPACING.sm,
    overflow: 'hidden',
    ...SHADOWS.deep,
  },
  cardAccent: {
    position: 'absolute',
    top: 16,
    bottom: 16,
    left: 0,
    width: 4,
    borderRadius: 4,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  cardHeading: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  cardTitle: {
    flex: 1,
    color: '#fffaf1',
    fontSize: 24,
    lineHeight: 30,
    fontFamily: FONTS.heading,
  },
  openText: {
    color: 'rgba(255,250,241,0.66)',
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
  },
  cardBody: {
    color: 'rgba(255,250,241,0.82)',
    fontSize: 15,
    lineHeight: 23,
  },
  cardRule: {
    height: 1,
    backgroundColor: COLORS.ruleLight,
  },
  useLabel: {
    color: 'rgba(255,250,241,0.62)',
    fontSize: 11,
    fontFamily: FONTS.accent,
    letterSpacing: 0.8,
  },
  useText: {
    color: '#fffaf1',
    fontSize: 16,
    lineHeight: 23,
    fontFamily: FONTS.heading,
  },
  sourceText: {
    color: 'rgba(255,250,241,0.56)',
    fontSize: 12,
    lineHeight: 18,
  },
});
