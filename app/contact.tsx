import React from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { WebShell } from '../src/components/web/WebShell';
import { SEOHead } from '../src/components/web/SEOHead';
import { COLORS, FONTS, SHADOWS, SPACING } from '../src/constants/theme';

const CHANNELS = [
  {
    kicker: 'GENERAL',
    title: 'Support & questions',
    body: 'Anything about the app, your reading, your account, or a phrasing that feels off. We read every email personally.',
    value: 'admin@cosmicself.app',
    href: 'mailto:admin@cosmicself.app',
    accentColor: COLORS.tide,
    gradientImage:
      'radial-gradient(140% 100% at 0% 0%, rgba(18,200,178,0.14) 0%, rgba(23,24,45,0.6) 45%, rgba(18,16,38,0.76) 100%)',
  },
  {
    kicker: 'PRIVACY & LEGAL',
    title: 'Data requests',
    body: 'Deletion, export, privacy questions, and anything about how your birth data is stored. We respond within 7 days.',
    value: 'admin@cosmicself.app',
    href: 'mailto:admin@cosmicself.app?subject=Privacy%20request',
    accentColor: COLORS.starGold,
    gradientImage:
      'radial-gradient(140% 100% at 100% 0%, rgba(241,183,79,0.14) 0%, rgba(23,24,45,0.6) 45%, rgba(18,16,38,0.76) 100%)',
  },
  {
    kicker: 'BUGS & FEEDBACK',
    title: 'Something not right?',
    body: 'A chart calculation looks off, a reading phrasing feels wrong, an accessibility issue you hit. Tell us what you saw — we will actually fix it.',
    value: 'admin@cosmicself.app',
    href: 'mailto:admin@cosmicself.app?subject=Bug%20report',
    accentColor: COLORS.tide,
    gradientImage:
      'radial-gradient(140% 100% at 0% 0%, rgba(18,200,178,0.14) 0%, rgba(23,24,45,0.6) 45%, rgba(18,16,38,0.76) 100%)',
  },
];

export default function ContactPage() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  return (
    <WebShell>
      <SEOHead
        title="Contact — CosmicSelf"
        description="Get in touch with CosmicSelf support, submit privacy requests, or send feedback on readings. A human reads every email."
        canonical="https://cosmicself.app/contact"
      />

      <View style={[styles.hero, isWide && styles.heroWide]}>
        <Text style={styles.eyebrow}>CONTACT</Text>
        <Text style={[styles.heroTitle, !isWide && styles.heroTitleCompact]}>
          Write to us. A human will read it.
        </Text>
        <Text style={[styles.heroBody, isWide && styles.heroBodyWide]}>
          We keep support simple: one inbox, one small team. No ticket numbers, no chatbot gate.
          Pick the channel that fits your question and expect a reply in a few days.
        </Text>
      </View>

      <View style={[styles.channels, isWide && styles.channelsWide]}>
        {CHANNELS.map((c, i) => (
          <ChannelCard key={c.title} {...c} isWide={isWide} index={i} />
        ))}
      </View>

      <View style={[styles.footNote, isWide && styles.footNoteWide]}>
        <Text style={styles.footKicker}>RESPONSE TIME</Text>
        <Text style={styles.footBody}>
          Typical reply is 2 to 4 days. Privacy and data-deletion requests are handled within 7
          days. If you have not heard back in a week, reply to your own email — it probably
          landed in spam.
        </Text>
      </View>
    </WebShell>
  );
}

function ChannelCard(props: {
  kicker: string;
  title: string;
  body: string;
  value: string;
  href: string;
  accentColor: string;
  gradientImage: string;
  isWide: boolean;
  index: number;
}) {
  const { kicker, title, body, value, href, accentColor, gradientImage, isWide, index } = props;
  return (
    <View
      style={[
        styles.card,
        {
          borderColor:
            index % 2 === 0 ? 'rgba(62,224,200,0.26)' : 'rgba(241,183,79,0.26)',
        },
        Platform.OS === 'web' && ({ backgroundImage: gradientImage } as any),
      ]}
    >
      <Text style={[styles.kicker, { color: accentColor }]}>{kicker}</Text>
      <Text style={[styles.title, !isWide && styles.titleCompact]}>{title}</Text>
      <Text style={styles.body}>{body}</Text>

      <Pressable
        onPress={() => Linking.openURL(href)}
        style={(state) => {
          const { pressed } = state;
          const hovered = (state as { hovered?: boolean }).hovered;
          return [
            styles.mailBtn,
            { borderColor: accentColor },
            hovered && styles.mailBtnHovered,
            pressed && styles.mailBtnPressed,
          ];
        }}
        accessibilityRole="link"
        accessibilityLabel={`Email ${value}`}
      >
        <Text style={[styles.mailLabel, { color: accentColor }]}>EMAIL</Text>
        <Text style={styles.mailValue}>{value}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: 72,
    paddingBottom: 48,
    paddingHorizontal: SPACING.lg,
  },
  heroWide: { paddingTop: 86, paddingBottom: 60, paddingHorizontal: SPACING.xl },
  eyebrow: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 18,
  },
  heroTitle: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 52,
    lineHeight: 56,
    letterSpacing: -1.8,
    maxWidth: 780,
    marginBottom: 22,
    ...(Platform.OS === 'web'
      ? {
          backgroundImage:
            'linear-gradient(120deg, #fff8f2 0%, #ffd9b8 42%, #12c8b2 78%, #a78bfa 100%)' as any,
          backgroundClip: 'text' as any,
          WebkitBackgroundClip: 'text' as any,
          WebkitTextFillColor: 'transparent' as any,
        }
      : {}),
  },
  heroTitleCompact: { fontSize: 38, lineHeight: 42, letterSpacing: -1.2 },
  heroBody: {
    color: 'rgba(255,248,242,0.72)',
    fontFamily: FONTS.body,
    fontSize: 17,
    lineHeight: 28,
    maxWidth: 720,
  },
  heroBodyWide: { fontSize: 19, lineHeight: 32 },

  channels: {
    gap: 20,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 72,
  },
  channelsWide: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 86,
  },

  card: {
    borderRadius: 22,
    borderWidth: 1,
    backgroundColor: 'rgba(23,24,45,0.58)',
    padding: 28,
    gap: 10,
    ...SHADOWS.deep,
  },
  kicker: {
    fontFamily: FONTS.accent,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  title: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1.1,
  },
  titleCompact: { fontSize: 26, lineHeight: 30, letterSpacing: -0.8 },
  body: {
    color: 'rgba(255,248,242,0.72)',
    fontFamily: FONTS.body,
    fontSize: 16,
    lineHeight: 26,
    marginTop: 4,
    maxWidth: 620,
  },

  mailBtn: {
    marginTop: 18,
    alignSelf: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(255,248,242,0.04)',
    gap: 4,
    ...(Platform.OS === 'web'
      ? ({
          transitionProperty: 'transform, box-shadow, background-color' as any,
          transitionDuration: '180ms' as any,
        } as any)
      : {}),
  },
  mailBtnHovered: {
    backgroundColor: 'rgba(255,248,242,0.08)',
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 18px 36px -20px rgba(0,0,0,0.55)' as any, transform: [{ translateY: -1 }] } as any)
      : {}),
  },
  mailBtnPressed: { transform: [{ translateY: 0 }] },
  mailLabel: {
    fontFamily: FONTS.accent,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  mailValue: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 16,
    letterSpacing: -0.2,
  },

  footNote: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 16,
    paddingBottom: 100,
  },
  footNoteWide: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 120,
  },
  footKicker: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  footBody: {
    color: 'rgba(255,248,242,0.72)',
    fontFamily: FONTS.body,
    fontSize: 16,
    lineHeight: 26,
    maxWidth: 680,
  },
});
