import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

export function WebFooter() {
  return (
    <View style={styles.wrap}>
      <View style={styles.inner}>
        <View style={styles.col}>
          <Text style={styles.heading}>CosmicSelf</Text>
          <Text style={styles.muted}>Daily readings, charts, and the wisdom of the stars.</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.heading}>Product</Text>
          <Link href="/features" style={styles.link}><Text style={styles.linkText}>Features</Text></Link>
          <Link href="/pricing" style={styles.link}><Text style={styles.linkText}>Pricing</Text></Link>
          <Link href="/changelog" style={styles.link}><Text style={styles.linkText}>Changelog</Text></Link>
        </View>
        <View style={styles.col}>
          <Text style={styles.heading}>Company</Text>
          <Link href="/about" style={styles.link}><Text style={styles.linkText}>About</Text></Link>
          <Link href="/contact" style={styles.link}><Text style={styles.linkText}>Contact</Text></Link>
          <Link href="/blog" style={styles.link}><Text style={styles.linkText}>Blog</Text></Link>
        </View>
        <View style={styles.col}>
          <Text style={styles.heading}>Legal</Text>
          <Link href="/legal/privacy" style={styles.link}><Text style={styles.linkText}>Privacy</Text></Link>
          <Link href="/legal/terms" style={styles.link}><Text style={styles.linkText}>Terms</Text></Link>
        </View>
      </View>
      <Text style={styles.copy}>© {new Date().getFullYear()} CosmicSelf. All rights reserved.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,248,242,0.08)',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    gap: SPACING.lg,
  },
  inner: {
    maxWidth: 1200,
    width: '100%',
    marginHorizontal: 'auto' as any,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xl,
  },
  col: { gap: 8, minWidth: 160 },
  heading: { color: COLORS.textPrimary, fontSize: 14, fontFamily: FONTS.accent, letterSpacing: 1.2 },
  muted: { color: COLORS.textMuted, fontSize: 13, maxWidth: 280 },
  link: { textDecorationLine: 'none' as any },
  linkText: { color: COLORS.textSecondary, fontSize: 13 },
  copy: { textAlign: 'center', color: COLORS.textMuted, fontSize: 12 },
});
