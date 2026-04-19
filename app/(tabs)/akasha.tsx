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
import { MotiView } from 'moti';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);

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

  const showInputBar = status === 'idle' || status === 'error';

  return (
    <StarField>
      <LinearGradient
        colors={['rgba(91,62,168,0.18)', 'transparent']}
        style={styles.topGlow}
        pointerEvents="none"
      />
      <View style={[styles.flex, { paddingTop: insets.top }]}>
        <Header
          hasHistory={pastReadings.length > 0}
          onHistoryToggle={() => setShowHistory((v) => !v)}
          showingHistory={showHistory}
        />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
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
              <AskingState
                question={currentQuestion}
                statusLine={cyclingStatus.text}
                statusIndex={cyclingStatus.index}
              />
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
            ) : showHistory && pastReadings.length > 0 ? (
              <HistoryView
                readings={pastReadings}
                expandedId={expandedReadingId}
                onToggle={handleExpandReading}
              />
            ) : (
              <EmptyState onChip={handleChip} />
            )}
          </ScrollView>
        </KeyboardAvoidingView>
        {showInputBar ? (
          <InputBar
            input={input}
            onInputChange={setInput}
            onAsk={handleAsk}
            onChip={handleChip}
          />
        ) : null}
      </View>
    </StarField>
  );
}

function Header({
  hasHistory,
  onHistoryToggle,
  showingHistory,
}: {
  hasHistory: boolean;
  onHistoryToggle: () => void;
  showingHistory: boolean;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.header}>
      <View style={styles.headerBadge}>
        <Ionicons name="sparkles" size={14} color={COLORS.violetLight} />
        <Text style={styles.headerTitle}>{t('akasha.tabLabel')}</Text>
      </View>
      {hasHistory ? (
        <TouchableOpacity onPress={onHistoryToggle} style={styles.headerIconBtn} activeOpacity={0.7}>
          <Ionicons
            name={showingHistory ? 'close' : 'time-outline'}
            size={20}
            color={COLORS.textPrimary}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const CARD_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  marriage: 'heart-outline',
  career: 'briefcase-outline',
  moonSign: 'moon-outline',
  travel: 'airplane-outline',
  dasha: 'time-outline',
};

const CARD_GRADIENTS: Record<string, readonly [string, string]> = {
  marriage: ['rgba(255,107,158,0.22)', 'rgba(147,58,174,0.12)'],
  career: ['rgba(107,164,255,0.22)', 'rgba(58,116,174,0.12)'],
  moonSign: ['rgba(196,167,255,0.24)', 'rgba(91,62,168,0.14)'],
  travel: ['rgba(107,232,205,0.22)', 'rgba(58,174,148,0.12)'],
  dasha: ['rgba(255,197,107,0.22)', 'rgba(174,122,58,0.12)'],
};

function EmptyState({ onChip }: { onChip: (key: string) => void }) {
  const { t } = useTranslation();
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 5) return t('akasha.greetingNight') ?? 'The night listens';
    if (hour < 12) return t('akasha.greetingMorning') ?? 'Good morning, seeker';
    if (hour < 17) return t('akasha.greetingAfternoon') ?? 'The afternoon stills';
    return t('akasha.greetingEvening') ?? 'Good evening, seeker';
  }, [t]);

  return (
    <View style={styles.heroWrap}>
      <View style={styles.orbHeroBlock}>
        <MotiView
          from={{ scale: 0.95, opacity: 0.75 }}
          animate={{ scale: 1.02, opacity: 1 }}
          transition={{
            loop: true,
            type: 'timing',
            duration: 2800,
            easing: Easing.inOut(Easing.quad),
          }}
          style={styles.orbHalo}
        >
          <AkashaOrb mode="idle" size={170} />
        </MotiView>
        <Animated.Text
          entering={FadeIn.duration(600).delay(220)}
          style={styles.greeting}
        >
          {greeting}
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.duration(600).delay(360).easing(Easing.out(Easing.cubic))}
          style={styles.hero}
        >
          {t('akasha.intro')}
        </Animated.Text>
      </View>

      <Animated.View
        entering={FadeIn.duration(600).delay(500)}
        style={styles.suggestionGrid}
      >
        <Text style={styles.suggestLabel}>{t('akasha.tryAsking') ?? 'TRY ASKING'}</Text>
        <View style={styles.suggestList}>
          {CHIP_KEYS.map((key, idx) => (
            <MotiView
              key={key}
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 420, delay: 560 + idx * 80 }}
            >
              <Pressable
                onPress={() => onChip(key)}
                style={({ pressed }) => [
                  styles.suggestCardShell,
                  pressed && styles.suggestCardPressed,
                ]}
              >
                <LinearGradient
                  colors={CARD_GRADIENTS[key]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.suggestIconBubble}>
                  <Ionicons name={CARD_ICONS[key]} size={18} color={COLORS.violetLight} />
                </View>
                <Text style={styles.suggestText} numberOfLines={2}>
                  {t(`akasha.chips.${key}`)}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </Pressable>
            </MotiView>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

function InputBar(props: {
  input: string;
  onInputChange: (v: string) => void;
  onAsk: () => void;
  onChip: (key: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <Animated.View entering={FadeIn.duration(500).delay(400)} style={styles.inputBarWrap}>
      <LinearGradient
        colors={['rgba(10,11,31,0)', 'rgba(10,11,31,0.85)']}
        style={styles.inputBarGradient}
        pointerEvents="none"
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        keyboardShouldPersistTaps="handled"
      >
        {CHIP_KEYS.map((key) => (
          <PromptChip key={key} label={t(`akasha.chips.${key}`)} onPress={() => props.onChip(key)} />
        ))}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput
          value={props.input}
          onChangeText={props.onInputChange}
          placeholder={t('akasha.inputPlaceholder')}
          placeholderTextColor={COLORS.textMuted}
          style={styles.input}
          multiline
          onSubmitEditing={props.onAsk}
          returnKeyType="send"
          blurOnSubmit
        />
        <TouchableOpacity
          onPress={props.onAsk}
          disabled={!props.input.trim()}
          style={[styles.askBtn, !props.input.trim() && styles.askBtnDisabled]}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-up" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
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
    <View style={styles.heroWrap}>
      <AkashaOrb mode="asking" size={200} />
      <Animated.Text entering={FadeIn.duration(500)} style={styles.askingQuestion}>
        “{question}”
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
    <View style={styles.answeredWrap}>
      <Animated.View entering={FadeIn.duration(600)} style={styles.orbSmallWrap}>
        <AkashaOrb mode="idle" size={96} />
      </Animated.View>
      <Animated.View entering={FadeIn.duration(700).delay(200)}>
        <AnswerCard
          question={props.reading.question}
          answer={props.reading.answer}
          createdAt={props.reading.createdAt}
        />
      </Animated.View>
      <TouchableOpacity
        onPress={props.onAskAnother}
        style={styles.askAnotherBtn}
        activeOpacity={0.8}
      >
        <Ionicons name="sparkles" size={16} color={COLORS.violetLight} />
        <Text style={styles.askAnotherLabel}>{t('akasha.askButton')}</Text>
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
    </View>
  );
}

function HistoryView(props: {
  readings: { id: string; question: string; answer: string; locale: string; createdAt: number }[];
  expandedId: string | null;
  onToggle: (id: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.historyWrap}>
      <Text style={styles.sectionLabel}>{t('akasha.pastReadings')}</Text>
      <PastReadingsList
        readings={props.readings}
        expandedId={props.expandedId}
        onToggle={props.onToggle}
      />
    </View>
  );
}

function CenteredHero({
  icon,
  title,
  subtitle,
  primary,
  secondary,
  accent,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  primary?: { label: string; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap };
  secondary?: { label: string; onPress: () => void };
  accent?: readonly [string, string];
}) {
  return (
    <View style={styles.centeredHero}>
      <MotiView
        from={{ scale: 0.92, opacity: 0.8 }}
        animate={{ scale: 1.04, opacity: 1 }}
        transition={{
          loop: true,
          type: 'timing',
          duration: 3000,
          easing: Easing.inOut(Easing.quad),
        }}
        style={styles.orbHalo}
      >
        <AkashaOrb mode="idle" size={140} />
      </MotiView>
      {icon ? (
        <View style={styles.heroIconBubble}>
          <Ionicons name={icon} size={22} color={COLORS.violetLight} />
        </View>
      ) : null}
      <Animated.Text
        entering={FadeIn.duration(500).delay(160)}
        style={styles.heroTitle}
      >
        {title}
      </Animated.Text>
      {subtitle ? (
        <Animated.Text
          entering={FadeIn.duration(500).delay(260)}
          style={styles.heroSubtitle}
        >
          {subtitle}
        </Animated.Text>
      ) : null}
      {primary ? (
        <Animated.View entering={FadeIn.duration(500).delay(380)} style={styles.heroCtaWrap}>
          <Pressable
            onPress={primary.onPress}
            style={({ pressed }) => [styles.gradientBtn, pressed && styles.gradientBtnPressed]}
          >
            <LinearGradient
              colors={accent ?? ['#8B5CF6', '#5B3EA8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            {primary.icon ? (
              <Ionicons name={primary.icon} size={18} color="#fff" />
            ) : null}
            <Text style={styles.gradientBtnLabel}>{primary.label}</Text>
          </Pressable>
        </Animated.View>
      ) : null}
      {secondary ? (
        <TouchableOpacity
          onPress={secondary.onPress}
          style={styles.linkBtn}
          activeOpacity={0.6}
        >
          <Text style={styles.linkBtnLabel}>{secondary.label}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
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
    <CenteredHero
      icon="moon-outline"
      title={
        props.isPremium ? t('akasha.limitPremium') : t('akasha.limitFree', { date: dateStr })
      }
      primary={
        !props.isPremium
          ? { label: t('akasha.limitFreeCta'), onPress: props.onUpgrade, icon: 'sparkles' }
          : { label: t('akasha.retry'), onPress: props.onDismiss }
      }
    />
  );
}

function NoBirthState({ onComplete }: { onComplete: () => void }) {
  const { t } = useTranslation();
  return (
    <CenteredHero
      icon="star-outline"
      title={t('akasha.noBirthData')}
      primary={{ label: t('akasha.noBirthDataCta'), onPress: onComplete, icon: 'arrow-forward' }}
    />
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
    <CenteredHero
      icon="alert-circle-outline"
      title={copy}
      primary={{ label: t('akasha.retry'), onPress: onRetry, icon: 'refresh' }}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgDeep },
  flex: { flex: 1 },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 260,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(236,227,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(236,227,255,0.18)',
  },
  headerTitle: {
    ...TYPE.label,
    color: COLORS.textPrimary,
    letterSpacing: 1.5,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl * 2,
  },
  heroWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  orbHeroBlock: {
    alignItems: 'center',
    gap: SPACING.sm,
    width: '100%',
  },
  centeredHero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.xl,
    minHeight: 460,
  },
  heroIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(196,167,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(196,167,255,0.3)',
    marginTop: SPACING.sm,
  },
  heroTitle: {
    ...TYPE.body,
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '600',
    paddingHorizontal: SPACING.md,
  },
  heroSubtitle: {
    color: COLORS.textMuted,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: SPACING.md,
  },
  heroCtaWrap: {
    marginTop: SPACING.md,
  },
  gradientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    minWidth: 200,
  },
  gradientBtnPressed: {
    transform: [{ scale: 0.97 }],
  },
  gradientBtnLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.6,
  },
  linkBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  linkBtnLabel: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  orbHalo: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.violetDeep,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 14,
  },
  greeting: {
    ...TYPE.label,
    color: COLORS.violetLight,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  suggestionGrid: {
    width: '100%',
    gap: SPACING.sm,
  },
  suggestLabel: {
    ...TYPE.label,
    color: COLORS.violetLight,
    letterSpacing: 1.8,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  suggestList: {
    gap: SPACING.sm,
  },
  suggestCardShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(236,227,255,0.16)',
    overflow: 'hidden',
  },
  suggestCardPressed: {
    borderColor: 'rgba(236,227,255,0.32)',
    transform: [{ scale: 0.98 }],
  },
  suggestIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(196,167,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(196,167,255,0.28)',
  },
  suggestText: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  hero: {
    ...TYPE.body,
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: SPACING.md,
    lineHeight: 24,
  },
  answeredWrap: {
    gap: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  orbSmallWrap: { alignItems: 'center', marginVertical: SPACING.md },
  askAnotherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    alignSelf: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.violetLight,
    backgroundColor: 'rgba(91,62,168,0.15)',
    marginTop: SPACING.md,
  },
  askAnotherLabel: {
    color: COLORS.violetLight,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  historyWrap: { gap: SPACING.md, paddingTop: SPACING.md },
  pastWrap: { gap: SPACING.sm, marginTop: SPACING.xl },
  sectionLabel: {
    ...TYPE.label,
    color: COLORS.violetLight,
    letterSpacing: 1.5,
  },
  inputBarWrap: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  inputBarGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -40,
    height: 40,
  },
  chipsRow: {
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    paddingBottom: SPACING.sm,
  },
  inputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'flex-end',
    backgroundColor: 'rgba(21,23,54,0.85)',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.glass,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.textPrimary,
    ...TYPE.body,
  },
  askBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.violetDeep,
    borderRadius: 22,
    ...SHADOWS.glass,
  },
  askBtnDisabled: { opacity: 0.4 },
  askingQuestion: {
    ...TYPE.subhead,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusLine: {
    ...TYPE.caption,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  limitText: {
    ...TYPE.body,
    color: COLORS.textPrimary,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
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
