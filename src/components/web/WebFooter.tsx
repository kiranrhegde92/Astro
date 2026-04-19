import React from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { COLORS, FONTS } from '../../constants/theme';

const SUPPORT_EMAIL = 'admin@cosmicself.app';

export function WebFooter() {
  const { width } = useWindowDimensions();
  const isWide = width >= 720;

  if (Platform.OS !== 'web') return null;

  const year = new Date().getFullYear();

  return (
    <View style={styles.outer}>
      <View style={styles.trustStrip}>
        <Text style={styles.trustText}>
          Your birth data is yours. We never sell it, and you can export or delete it from Settings at any time.
        </Text>
      </View>

      <View style={[styles.footer, isWide && styles.footerWide]}>
        <View style={styles.brandColumn}>
          <Text style={styles.brand}>CosmicSelf</Text>
          <Text style={styles.tagline}>
            A calm astrology ritual — Western, Vedic, Chinese, and KP, in one mobile app.
          </Text>
        </View>

        <View style={[styles.linkGroups, isWide && styles.linkGroupsWide]}>
          <FooterColumn heading="Navigate">
            <FooterLink href="/" label="Home" />
            <FooterLink href="/legal/privacy" label="Privacy" />
            <FooterLink href="/legal/terms" label="Terms" />
          </FooterColumn>
          <FooterColumn heading="Support">
            <Pressable onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}>
              <Text style={styles.link}>{SUPPORT_EMAIL}</Text>
            </Pressable>
            <Text style={styles.muted}>We reply within 2 business days.</Text>
          </FooterColumn>
        </View>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.copyright}>© {year} CosmicSelf. All rights reserved.</Text>
        <Text style={styles.muted}>cosmicself.app</Text>
      </View>
    </View>
  );
}

function FooterColumn({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <View style={styles.column}>
      <Text style={styles.columnHeading}>{heading}</Text>
      <View style={styles.columnLinks}>{children}</View>
    </View>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href as any} style={styles.link as any}>
      {label}
    </Link>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingTop: 52,
    paddingBottom: 32,
    gap: 40,
  },
  trustStrip: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,248,242,0.16)',
    paddingTop: 32,
  },
  trustText: {
    color: 'rgba(255,248,242,0.74)',
    fontFamily: FONTS.heading,
    fontSize: 17,
    lineHeight: 26,
    maxWidth: 720,
  },
  footer: {
    gap: 32,
  },
  footerWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 64,
  },
  brandColumn: {
    flex: 1,
    maxWidth: 420,
    gap: 10,
  },
  brand: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 26,
    letterSpacing: -0.6,
  },
  tagline: {
    color: 'rgba(255,248,242,0.62)',
    fontSize: 14,
    lineHeight: 22,
  },
  linkGroups: {
    gap: 28,
  },
  linkGroupsWide: {
    flexDirection: 'row',
    gap: 64,
  },
  column: {
    gap: 12,
    minWidth: 160,
  },
  columnHeading: {
    color: COLORS.starGold,
    fontFamily: FONTS.accent,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  columnLinks: {
    gap: 8,
  },
  link: {
    color: 'rgba(255,248,242,0.88)',
    fontFamily: FONTS.heading,
    fontSize: 15,
    lineHeight: 22,
    textDecorationLine: 'none',
  },
  muted: {
    color: 'rgba(255,248,242,0.54)',
    fontSize: 13,
    lineHeight: 20,
  },
  bottom: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,248,242,0.14)',
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  copyright: {
    color: 'rgba(255,248,242,0.56)',
    fontSize: 13,
  },
});
