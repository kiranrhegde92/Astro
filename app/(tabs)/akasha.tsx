import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut, Easing } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StarField } from '../../src/components/ui/StarField';
import { AkashaOrb } from '../../src/components/akasha/AkashaOrb';
import { PromptChip } from '../../src/components/akasha/PromptChip';
import { AnswerCard } from '../../src/components/akasha/AnswerCard';
import { PastReadingsList } from '../../src/components/akasha/PastReadingsList';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPE } from '../../src/constants/theme';
import { useAkashaStore } from '../../src/store/akashaStore';
import { useUserStore } from '../../src/store/userStore';
import { useSubscriptionStore } from '../../src/store/subscriptionStore';
import { askAkasha, loadPastReadings } from '../../src/services/akashaService';
import { logAkashaEvent } from '../../src/services/akashaAnalytics';

const CHIP_KEYS = ['marriage', 'career', 'moonSign', 'travel', 'dasha'] as const;

function useCyclingStatus(active: boolean): { text: string; index: number } {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!active) {
      setIndex(0);
      return;
    }
    const id = setInterval(() => setIndex((i) => (i + 1) % 3), 1800);
    return () => clearInterval(id);
  }, [active]);
  const keys = ['akasha.statusReading', 'akasha.statusConsulting', 'akasha.statusWeaving'];
  return { text: t(keys[index]), index };
}

export default function AkashaScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [input, setInput] = useState('');

  const user = useUserStore((s) => s.user);
  const subscription = useSubscriptionStore((s) => s.subscription);
  const {
    status,
    currentQuestion,
    currentAnswer,
    currentReadingId,
    errorMessage,
    nextAvailableAt,
    pastReadings,
    expandedReadingId,
    resetToIdle,
    expandReading,
  } = useAkashaStore();

  useEffect(() => {
    loadPastReadings().catch(() => {});
  }, []);

  const hasBirth = Boolean(user?.birthDetails);
  const isPremium = subscription.tier === 'premium' || subscription.status === 'trial';
  const cyclingStatus = useCyclingStatus(status === 'asking');

  const handleAsk = useCallback(() => {
    const q = input.trim();
    if (!q) return;
    setInput('');
    askAkasha(q, i18n.language).catch(() => {});
  }, [input, i18n.language]);

  const handleChip = useCallback((labelKey: string) => {
    logAkashaEvent('akasha_prompt_chip_tapped', { chipKey: labelKey });
    setInput(t(`akasha.chips.${labelKey}`));
  }, [t]);

  const handleExpandReading = useCallback((id: string) => {
    if (id !== expandedReadingId) {
      logAkashaEvent('akasha_past_reading_opened', { readingId: id });
    }
    expandReading(id === expandedReadingId ? null : id);
  }, [expandReading, expandedReadingId]);

  const scrollToPast = useCallback(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, []);

  const currentReading = useMemo(() => {
    if (status === 'answered' && currentReadingId && currentAnswer) {
      const createdAt =
        pastReadings.find((r) => r.id === currentReadingId)?.createdAt ?? Date.now();
      return { id: currentReadingId, question: currentQuestion, answer: currentAnswer, createdAt };
    }
    return null;
  }, [status, currentReadingId, currentAnswer, currentQuestion, pastReadings]);

  const historicalReadings = useMemo(
    () => pastReadings.filter((r) => r.id !== currentReadingId),
    [pastReadings, currentReadingId]
  );

  return (
    <View style={styles.root}>
      <LinearGradient colors={COLORS.gradientBg} style={StyleSheet.absoluteFill} />
      <StarField />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {!hasBirth ? (
            <NoBirthState onComplete={() => router.push('/(onboarding)/birth-details')} />
          ) : status === 'rateLimited' ? (
            <LimitReachedState
              isPremium={isPremium}
              nextAvailableAt={nextAvailableAt}
              onUpgrade={() => {
                logAkashaEvent('akasha_limit_upsell_tapped', { tier: isPremium ? 'premium' : 'free' });
                router.push('/reading/unified');
              }}
              onDismiss={resetToIdle}
            />
          ) : status === 'asking' ? (
            <AskingState question={currentQuestion} statusLine={cyclingStatus.text} statusIndex={cyclingStatus.index} />
          ) : status === 'error' ? (
            <ErrorState message={errorMessage} onRetry={resetToIdle} />
          ) : currentReading ? (
            <AnsweredState
              reading={currentReading}
              historical={historicalReadings}
              expandedId={expandedReadingId}
              onToggle={handleExpandReading}
              onAskAnother={resetToIdle}
            />
          ) : (
            <EmptyState
              input={input}
              onInputChange={setInput}
              onAsk={handleAsk}
              onChip={handleChip}
              onPastReadings={pastReadings.length > 0 ? scrollToPast : undefined}
              pastReadings={pastReadings}
              expandedId={expandedReadingId}
              onToggle={handleExpandReading}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function EmptyState(props: {
  input: string;
  onInputChange: (v: string) => void;
  onAsk: () => void;
  onChip: (key: string) => void;
  onPastReadings?: () => void;
  pastReadings: { id: string; question: string; answer: string; locale: string; createdAt: number }[];
  expandedId: string | null;
  onToggle: (id: string) => void;
}) {
  const { t } = useTranslation();
  const entry = (delay: number) =>
    FadeIn.duration(520).delay(delay).easing(Easing.out(Easing.cubic));
  return (
    <>
      <Animated.View entering={FadeIn.duration(700)} style={styles.orbWrap}>
        <AkashaOrb mode="idle" />
      </Animated.View>
      <Animated.Text entering={entry(220)} style={styles.intro}>
        {t('akasha.intro')}
      </Animated.Text>
      <Animated.View entering={entry(360)} style={styles.inputRow}>
        <TextInput
          value={props.input}
          onChangeText={props.onInputChange}
          placeholder={t('akasha.inputPlaceholder')}
          placeholderTextColor={COLORS.textMuted}
          style={styles.input}
          multiline
          onSubmitEditing={props.onAsk}
          returnKeyType="send"
        />
        <TouchableOpacity
          onPress={props.onAsk}
          disabled={!props.input.trim()}
          style={[styles.askBtn, !props.input.trim() && styles.askBtnDisabled]}
          activeOpacity={0.8}
        >
          <Text style={styles.askBtnLabel}>{t('akasha.askButton')}</Text>
        </TouchableOpacity>
      </Animated.View>
      <View style={styles.chips}>
        {CHIP_KEYS.map((key, i) => (
          <Animated.View key={key} entering={entry(500 + i * 80)}>
            <PromptChip label={t(`akasha.chips.${key}`)} onPress={() => props.onChip(key)} />
          </Animated.View>
        ))}
      </View>
      {props.onPastReadings ? (
        <Animated.View entering={entry(900)}>
          <Pressable onPress={props.onPastReadings} style={styles.pastLink}>
            <Text style={styles.pastLinkLabel}>
              {t('akasha.pastReadings')} <Ionicons name="arrow-down" size={12} />
            </Text>
          </Pressable>
        </Animated.View>
      ) : null}
      {props.pastReadings.length > 0 ? (
        <Animated.View entering={entry(1000)} style={styles.pastWrap}>
          <Text style={styles.sectionLabel}>{t('akasha.pastReadings')}</Text>
          <PastReadingsList
            readings={props.pastReadings}
            expandedId={props.expandedId}
            onToggle={props.onToggle}
          />
        </Animated.View>
      ) : null}
    </>
  );
}

function AskingState({
  question,
  statusLine,
  statusIndex,
}: {
  question: string;
  statusLine: string;
  statusIndex: number;
}) {
  return (
    <View style={styles.centered}>
      <AkashaOrb mode="asking" />
      <Animated.Text
        entering={FadeIn.duration(500)}
        style={styles.askingQuestion}
      >
        {question}
      </Animated.Text>
      <View style={styles.statusRow}>
        <ActivityIndicator color={COLORS.violetLight} />
        <Animated.Text
          key={statusIndex}
          entering={FadeIn.duration(420)}
          exiting={FadeOut.duration(320)}
          style={styles.statusLine}
        >
          {statusLine}
        </Animated.Text>
      </View>
    </View>
  );
}

function AnsweredState(props: {
  reading: { id: string; question: string; answer: string; createdAt: number };
  historical: { id: string; question: string; answer: string; locale: string; createdAt: number }[];
  expandedId: string | null;
  onToggle: (id: string) => void;
  onAskAnother: () => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <Animated.View entering={FadeIn.duration(600)} style={styles.orbSmallWrap}>
        <AkashaOrb mode="idle" size={88} />
      </Animated.View>
      <Animated.View entering={FadeIn.duration(700).delay(200)}>
        <AnswerCard
          question={props.reading.question}
          answer={props.reading.answer}
          createdAt={props.reading.createdAt}
        />
      </Animated.View>
      <TouchableOpacity onPress={props.onAskAnother} style={styles.secondaryBtn} activeOpacity={0.8}>
        <Text style={styles.secondaryBtnLabel}>{t('akasha.askButton')}</Text>
      </TouchableOpacity>
      {props.historical.length > 0 ? (
        <View style={styles.pastWrap}>
          <Text style={styles.sectionLabel}>{t('akasha.pastReadings')}</Text>
          <PastReadingsList
            readings={props.historical}
            expandedId={props.expandedId}
            onToggle={props.onToggle}
          />
        </View>
      ) : null}
    </>
  );
}

function LimitReachedState(props: {
  isPremium: boolean;
  nextAvailableAt: number | null;
  onUpgrade: () => void;
  onDismiss: () => void;
}) {
  const { t, i18n } = useTranslation();
  const dateStr = props.nextAvailableAt
    ? new Date(props.nextAvailableAt).toLocaleDateString(i18n.language, {
        month: 'short',
        day: 'numeric',
      })
    : '';
  return (
    <View style={styles.centered}>
      <AkashaOrb mode="idle" size={100} />
      <Text style={styles.limitText}>
        {props.isPremium ? t('akasha.limitPremium') : t('akasha.limitFree', { date: dateStr })}
      </Text>
      {!props.isPremium ? (
        <TouchableOpacity onPress={props.onUpgrade} style={styles.primaryBtn} activeOpacity={0.8}>
          <Text style={styles.primaryBtnLabel}>{t('akasha.limitFreeCta')}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={props.onDismiss} style={styles.secondaryBtn} activeOpacity={0.8}>
          <Text style={styles.secondaryBtnLabel}>{t('akasha.retry')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function NoBirthState({ onComplete }: { onComplete: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.centered}>
      <AkashaOrb mode="idle" size={100} />
      <Text style={styles.intro}>{t('akasha.noBirthData')}</Text>
      <TouchableOpacity onPress={onComplete} style={styles.primaryBtn} activeOpacity={0.8}>
        <Text style={styles.primaryBtnLabel}>{t('akasha.noBirthDataCta')}</Text>
      </TouchableOpacity>
    </View>
  );
}

function ErrorState({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  const { t } = useTranslation();
  const copy =
    message === 'meditating'
      ? t('akasha.meditating')
      : message === 'no_birth_data'
      ? t('akasha.noBirthData')
      : t('akasha.oracleSilent');
  return (
    <View style={styles.centered}>
      <AkashaOrb mode="idle" size={100} />
      <Text style={styles.intro}>{copy}</Text>
      <TouchableOpacity onPress={onRetry} style={styles.secondaryBtn} activeOpacity={0.8}>
        <Text style={styles.secondaryBtnLabel}>{t('akasha.retry')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgDeep },
  flex: { flex: 1 },
  content: {
    padding: SPACING.lg,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
  },
  orbWrap: { alignItems: 'center', marginTop: SPACING.lg },
  orbSmallWrap: { alignItems: 'center', marginBottom: SPACING.md },
  centered: { alignItems: 'center', gap: SPACING.md, marginTop: SPACING.xl },
  intro: {
    ...TYPE.body,
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  inputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: COLORS.bgCard,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...TYPE.body,
  },
  askBtn: {
    backgroundColor: COLORS.violetDeep,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    ...SHADOWS.glass,
  },
  askBtnDisabled: { opacity: 0.5 },
  askBtnLabel: { color: '#fff', fontWeight: '700', fontSize: 15 },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  pastLink: { alignSelf: 'flex-end', paddingVertical: SPACING.xs },
  pastLinkLabel: { color: COLORS.violetLight, fontWeight: '600', fontSize: 13 },
  pastWrap: { gap: SPACING.sm, marginTop: SPACING.md },
  sectionLabel: {
    ...TYPE.label,
    color: COLORS.violetLight,
  },
  askingQuestion: {
    ...TYPE.subhead,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: SPACING.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusLine: {
    ...TYPE.caption,
    color: COLORS.textSecondary,
  },
  limitText: {
    ...TYPE.body,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: COLORS.violetDeep,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    ...SHADOWS.glass,
  },
  primaryBtnLabel: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondaryBtn: {
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  secondaryBtnLabel: { color: COLORS.textPrimary, fontWeight: '600', fontSize: 14 },
});
