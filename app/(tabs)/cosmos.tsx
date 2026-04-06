import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StarField } from '../../src/components/ui/StarField';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { CosmicOrb } from '../../src/components/ui/CosmicOrb';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';

const FEATURES = [
  { icon: 'chatbubble-outline' as const,  text: 'Share daily readings & cosmic insights' },
  { icon: 'people-outline' as const,      text: 'Join sign-based discussion groups' },
  { icon: 'star-outline' as const,        text: 'Weekly cosmic events & challenges' },
  { icon: 'heart-outline' as const,       text: 'Find your cosmic tribe' },
  { icon: 'image-outline' as const,       text: 'Post & discover shareable cosmic cards' },
];

export default function CosmosScreen() {
  return (
    <StarField>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <CosmicOrb size={120} primaryColor={COLORS.kp} secondaryColor={COLORS.western} />
          <Text style={styles.title}>COSMOS</Text>
          <Text style={styles.subtitle}>Connect with fellow cosmic explorers</Text>
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.28)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.divider}
          />
        </View>

        {/* Coming Soon */}
        <GradientCard
          colors={['rgba(0,229,209,0.16)', 'rgba(124,109,255,0.08)'] as readonly string[]}
          accentColor={COLORS.kp}
        >
          <Text style={styles.comingSoonBadge}>COMING SOON</Text>
          <Text style={styles.comingSoonTitle}>Community Space</Text>
          <Text style={styles.comingSoonDesc}>The Cosmos community is being aligned by the stars.</Text>

          <View style={styles.featureList}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={[styles.featureCircle, { borderColor: 'rgba(0,229,209,0.25)' }]}>
                  <Ionicons name={f.icon} size={17} color={COLORS.kp} />
                </View>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>
        </GradientCard>

        {/* Weekly Event */}
        <View style={styles.eventShadow}>
          <View style={styles.eventCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.03)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFillObject, { borderRadius: BORDER_RADIUS.xl }]}
            />
            {/* Top gloss */}
            <LinearGradient
              colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[StyleSheet.absoluteFillObject, { borderRadius: BORDER_RADIUS.xl }]}
              pointerEvents="none"
            />
            <View style={styles.eventInner}>
              <View style={styles.eventBadge}>
                <Ionicons name="calendar-outline" size={12} color={COLORS.gold} />
                <Text style={styles.eventLabel}>THIS WEEK</Text>
              </View>
              <Text style={styles.eventTitle}>New Moon Intention Setting</Text>
              <Text style={styles.eventDesc}>
                Set your intentions under the new moon's energy. Write down your dreams and let the cosmos amplify them.
              </Text>
            </View>
          </View>
        </View>

        {/* Did You Know */}
        <GradientCard accentColor="rgba(255,255,255,0.25)">
          <View style={styles.factHeader}>
            <Ionicons name="bulb-outline" size={16} color={COLORS.gold} />
            <Text style={styles.factLabel}>DID YOU KNOW?</Text>
          </View>
          <Text style={styles.factText}>
            CosmicSelf is the only app that combines Western, Vedic, Chinese, and KP
            astrology in one place. Your Cosmic DNA is unique across all 4 traditions.
          </Text>
        </GradientCard>

        <View style={{ height: 110 }} />
      </ScrollView>
    </StarField>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: SPACING.lg, paddingTop: 58, gap: SPACING.lg },

  header: { alignItems: 'center', gap: SPACING.xs },
  title: {
    fontFamily: 'Cinzel_900Black',
    color: COLORS.white,
    fontSize: 28,
    letterSpacing: 8,
    textShadowColor: 'rgba(255,255,255,0.18)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center' },
  divider: { width: 80, height: 1, marginTop: SPACING.sm, opacity: 0.5 },

  comingSoonBadge: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 9,
    letterSpacing: 3,
    color: COLORS.kp,
    marginBottom: 6,
  },
  comingSoonTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: 'Cinzel_700Bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  comingSoonDesc: { color: COLORS.textSecondary, fontSize: 13, marginBottom: SPACING.sm },
  featureList: { gap: SPACING.md, marginTop: SPACING.xs },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  featureCircle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,229,209,0.08)',
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  featureText: { color: COLORS.textSecondary, fontSize: 13, flex: 1 },

  eventShadow: {
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 12,
  },
  eventCard: {
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    overflow: 'hidden',
  },
  eventInner: { padding: SPACING.lg, gap: SPACING.xs },
  eventBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  eventLabel: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 9,
    color: COLORS.gold,
    letterSpacing: 2.5,
  },
  eventTitle: { color: COLORS.white, fontSize: 19, fontFamily: 'Cinzel_700Bold', letterSpacing: 0.3 },
  eventDesc: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 4 },

  factHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.xs },
  factLabel: { color: COLORS.gold, fontSize: 9, fontFamily: 'Cinzel_400Regular', letterSpacing: 2.5 },
  factText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20 },
});
