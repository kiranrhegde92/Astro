import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPE } from '../../constants/theme';

interface Props {
  question: string;
  answer: string;
  createdAt: number;
}

function formatDate(ms: number, locale: string): string {
  try {
    return new Date(ms).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return new Date(ms).toDateString();
  }
}

export function AnswerCard({ question, answer, createdAt }: Props) {
  const { t, i18n } = useTranslation();
  return (
    <View style={styles.card}>
      <Text style={styles.overline}>{t('akasha.pastReadings')}</Text>
      <Text style={styles.question}>{question}</Text>
      <Text style={styles.brand}>Akasha</Text>
      <Text style={styles.answer}>{answer}</Text>
      <Text style={styles.footer}>
        {t('akasha.readOnPrefix')} {formatDate(createdAt, i18n.language)} · Akasha
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgInkCard,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.glass,
  },
  overline: {
    ...TYPE.label,
    color: COLORS.violetLight,
    marginBottom: SPACING.xs,
  },
  question: {
    ...TYPE.subhead,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    fontStyle: 'italic',
  },
  brand: {
    ...TYPE.label,
    color: COLORS.violetLight,
    marginBottom: SPACING.xs,
  },
  answer: {
    ...TYPE.body,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  footer: {
    ...TYPE.caption,
    color: COLORS.textMuted,
  },
});
