import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../constants/theme';
import { useSettingsStore } from '../../store/settingsStore';

const STEPS = [
  {
    icon: 'sunny' as const,
    color: COLORS.starGold,
    title: 'Your daily cosmic reading',
    body: 'The hero card blends signals from all your active astrology systems into one spoken-style summary. It updates every morning.',
  },
  {
    icon: 'telescope-outline' as const,
    color: COLORS.iris,
    title: 'Explore in depth',
    body: 'Tap Brief, Proof, Forecast, or Systems to dive into different views — from the evidence behind today\'s tone to weekly and monthly outlooks.',
  },
  {
    icon: 'heart-outline' as const,
    color: COLORS.coral,
    title: 'Match and reflect',
    body: 'Use the bottom tabs to check compatibility, write in your journal, and share your readings as cards with others.',
  },
];

interface TutorialOverlayProps {
  visible: boolean;
}

export function TutorialOverlay({ visible }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);
  const setTutorialSeen = useSettingsStore((s) => s.setTutorialSeen);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      setTutorialSeen(true);
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSkip = () => {
    setTutorialSeen(true);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <LinearGradient
            colors={COLORS.gradientInk as unknown as [string, string]}
            style={styles.cardGradient}
          >
            {/* Step dots */}
            <View style={styles.dots}>
              {STEPS.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === step && styles.dotActive]}
                />
              ))}
            </View>

            {/* Icon */}
            <View style={[styles.iconWrap, { borderColor: `${current.color}44` }]}>
              <Ionicons name={current.icon} size={36} color={current.color} />
            </View>

            {/* Text */}
            <Text style={styles.title}>{current.title}</Text>
            <Text style={styles.body}>{current.body}</Text>

            {/* Actions */}
            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: current.color }]}
              onPress={handleNext}
              activeOpacity={0.84}
            >
              <Text style={styles.nextText}>{isLast ? 'Get started' : 'Next'}</Text>
              {!isLast && <Ionicons name="arrow-forward" size={16} color="#fff" />}
            </TouchableOpacity>

            {!isLast && (
              <TouchableOpacity onPress={handleSkip} activeOpacity={0.72} style={styles.skipBtn}>
                <Text style={styles.skipText}>Skip tutorial</Text>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10,10,30,0.78)',
    justifyContent: 'flex-end',
    paddingBottom: 40,
    paddingHorizontal: SPACING.lg,
  },
  card: {
    borderRadius: BORDER_RADIUS.xxl,
    overflow: 'hidden',
    ...{
      shadowColor: 'rgba(0,0,0,0.4)',
      shadowOffset: { width: 0, height: 24 },
      shadowOpacity: 0.3,
      shadowRadius: 36,
      elevation: 14,
    },
  },
  cardGradient: {
    padding: SPACING.xl,
    gap: SPACING.md,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  dotActive: {
    backgroundColor: '#fffaf1',
    width: 20,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  title: {
    color: '#fffaf1',
    fontSize: 22,
    fontFamily: FONTS.heading,
    textAlign: 'center',
    lineHeight: 28,
  },
  body: {
    color: 'rgba(255,250,241,0.72)',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    maxWidth: 300,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 14,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.sm,
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS.heading,
  },
  skipBtn: {
    paddingVertical: SPACING.sm,
  },
  skipText: {
    color: 'rgba(255,250,241,0.42)',
    fontSize: 13,
    fontFamily: FONTS.accent,
    letterSpacing: 0.5,
  },
});
