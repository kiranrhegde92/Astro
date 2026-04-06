import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import { StarField } from '../../src/components/ui/StarField';
import { GlowText } from '../../src/components/ui/GlowText';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { ProgressRing } from '../../src/components/ui/ProgressRing';
import { CompatibilityCard } from '../../src/components/share/ShareableCard';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useUserStore } from '../../src/store/userStore';
import { calculateCosmicProfile } from '../../src/engines/unified';
import { calculateCrossCompatibility } from '../../src/engines/unified/crossCompatibility';
import { captureAndShare } from '../../src/utils/shareUtils';
import type { CompatibilityResult, CosmicProfile } from '../../src/types/astrology';

export default function CompatibilityScreen() {
  const { t } = useTranslation();
  const user = useUserStore((s) => s.user);

  const [name, setName] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const compatCardRef = useRef<ViewShot>(null);

  const isValid = name.trim() && day && month && year;

  const handleShare = useCallback(async () => {
    try { await captureAndShare(compatCardRef); }
    catch { Alert.alert('Share', 'Unable to share at this time.'); }
  }, []);

  const handleCheck = useCallback(() => {
    if (!user?.western || !user?.vedic || !user?.chinese) return;
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const partnerProfile = calculateCosmicProfile(birthDate);
    const myProfile: CosmicProfile = { western: user.western, vedic: user.vedic, chinese: user.chinese, kp: user.kp };
    setResult(calculateCrossCompatibility(myProfile, partnerProfile));
    setPartnerName(name.trim());
  }, [user, year, month, day, name]);

  const resetCheck = useCallback(() => { setResult(null); setName(''); setDay(''); setMonth(''); setYear(''); }, []);

  return (
    <StarField>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>💖</Text>
          <GlowText size="xl" align="center">{t('compatibility.title')}</GlowText>
          <Text style={styles.subtitle}>{t('compatibility.subtitle')}</Text>
        </View>

        {!result ? (
          <GradientCard>
            <View style={styles.form}>
              <Text style={styles.formTitle}>Enter their details</Text>

              <View style={styles.field}>
                <Text style={styles.label}>NAME</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter their name" placeholderTextColor={COLORS.textMuted} />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>BIRTH DATE</Text>
                <View style={styles.dateRow}>
                  <TextInput style={[styles.input, styles.dateInput]} value={day} onChangeText={(v) => setDay(v.replace(/\D/g, '').slice(0, 2))} placeholder="DD" placeholderTextColor={COLORS.textMuted} keyboardType="number-pad" maxLength={2} />
                  <TextInput style={[styles.input, styles.dateInput]} value={month} onChangeText={(v) => setMonth(v.replace(/\D/g, '').slice(0, 2))} placeholder="MM" placeholderTextColor={COLORS.textMuted} keyboardType="number-pad" maxLength={2} />
                  <TextInput style={[styles.input, styles.yearInput]} value={year} onChangeText={(v) => setYear(v.replace(/\D/g, '').slice(0, 4))} placeholder="YYYY" placeholderTextColor={COLORS.textMuted} keyboardType="number-pad" maxLength={4} />
                </View>
              </View>

              <AnimatedPressable onPress={handleCheck} style={!isValid ? styles.disabled : undefined}>
                <LinearGradient colors={['#e8324a', '#ff6b40']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.checkBtn}>
                  <Text style={styles.checkBtnText}>{t('compatibility.check')}</Text>
                </LinearGradient>
              </AnimatedPressable>
            </View>
          </GradientCard>
        ) : (
          <View style={styles.results}>
            {/* Overall */}
            <View style={styles.overallCard}>
              <LinearGradient colors={['#c94b4b', '#ee5a24', '#f5c842']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.overallGradient}>
                <ProgressRing progress={result.overall / 100} size={110} strokeWidth={7} color="#fff" value={`${result.overall}%`} label="MATCH" />
                <Text style={styles.overallNames}>{user?.name}  ×  {partnerName}</Text>
              </LinearGradient>
            </View>

            {/* System breakdowns */}
            {[
              { sys: 'Western', emoji: '♈', score: result.western.score, details: result.western.details, gradient: COLORS.gradientWestern, color: COLORS.western },
              { sys: 'Vedic',   emoji: '🕉️', score: result.vedic.score,   details: result.vedic.details,   gradient: COLORS.gradientVedic,   color: COLORS.vedic },
              { sys: 'Chinese', emoji: '🐉', score: result.chinese.score, details: result.chinese.details, gradient: COLORS.gradientChinese, color: COLORS.chinese },
            ].map((s) => (
              <GradientCard key={s.sys} colors={s.gradient as unknown as readonly string[]} glowColor={s.color}>
                <View style={styles.compatHeader}>
                  <Text style={styles.compatEmoji}>{s.emoji}</Text>
                  <Text style={styles.compatSys}>{s.sys}</Text>
                  <ProgressRing progress={s.score / 100} size={48} strokeWidth={4} color={s.color} value={`${s.score}%`} />
                </View>
                <Text style={styles.compatDetails}>{s.details}</Text>
              </GradientCard>
            ))}

            {/* Actions */}
            <AnimatedPressable onPress={handleShare}>
              <LinearGradient colors={['#e8324a', '#ff6b40']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.shareBtn}>
                <Text style={styles.shareBtnText}>Share Compatibility ✨</Text>
              </LinearGradient>
            </AnimatedPressable>

            <AnimatedPressable onPress={resetCheck}>
              <View style={styles.outlineBtn}>
                <Text style={styles.outlineBtnText}>Check Another</Text>
              </View>
            </AnimatedPressable>

            <View style={styles.hiddenCard}>
              <CompatibilityCard name1={user?.name ?? ''} name2={partnerName} score={result.overall} westernScore={result.western.score} vedicScore={result.vedic.score} chineseScore={result.chinese.score} viewShotRef={compatCardRef} />
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </StarField>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: SPACING.lg, paddingTop: 58, gap: SPACING.lg },
  header: { alignItems: 'center', gap: SPACING.xs },
  headerEmoji: { fontSize: 44 },
  subtitle: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center' },

  // Form
  form: { gap: SPACING.md },
  formTitle: { fontFamily: 'PlayfairDisplay_700Bold', color: COLORS.white, fontSize: 18, textAlign: 'center' },
  field: { gap: 6 },
  label: { color: COLORS.violet, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  input: {
    backgroundColor: 'rgba(139,47,201,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(139,47,201,0.25)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.white,
    fontSize: 16,
  },
  dateRow: { flexDirection: 'row', gap: SPACING.sm },
  dateInput: { flex: 1, textAlign: 'center' },
  yearInput: { flex: 1.5, textAlign: 'center' },
  disabled: { opacity: 0.45 },
  checkBtn: { borderRadius: BORDER_RADIUS.full, paddingVertical: 17, alignItems: 'center' },
  checkBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', fontFamily: 'PlayfairDisplay_700Bold' },

  // Results
  results: { gap: SPACING.lg },
  overallCard: { borderRadius: BORDER_RADIUS.xl, overflow: 'hidden' },
  overallGradient: { padding: SPACING.xl, alignItems: 'center', gap: SPACING.md },
  overallNames: { color: '#fff', fontSize: 18, fontFamily: 'PlayfairDisplay_700Bold' },

  compatHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  compatEmoji: { fontSize: 22 },
  compatSys: { color: COLORS.white, fontSize: 16, fontFamily: 'PlayfairDisplay_700Bold', flex: 1 },
  compatDetails: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20 },

  shareBtn: { borderRadius: BORDER_RADIUS.full, paddingVertical: 17, alignItems: 'center' },
  shareBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', fontFamily: 'PlayfairDisplay_700Bold' },
  outlineBtn: {
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.violet,
  },
  outlineBtnText: { color: COLORS.violet, fontSize: 15, fontWeight: '600' },

  hiddenCard: { position: 'absolute', left: -9999, top: -9999 },
});
