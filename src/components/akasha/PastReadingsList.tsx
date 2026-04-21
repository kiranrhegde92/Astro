import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS, COLORS, SPACING, TYPE } from '../../constants/theme';
import type { AkashaReading } from '../../store/akashaStore';

interface Props {
  readings: AkashaReading[];
  expandedId: string | null;
  onToggle: (id: string) => void;
}

const PREVIEW_CHARS = 60;

export function PastReadingsList({ readings, expandedId, onToggle }: Props) {
  if (readings.length === 0) return null;
  return (
    <View style={styles.list}>
      {readings.map((r) => {
        const isOpen = expandedId === r.id;
        return (
          <TouchableOpacity
            key={r.id}
            style={[styles.row, isOpen && styles.rowOpen]}
            onPress={() => onToggle(r.id)}
            activeOpacity={0.75}
          >
            <Text style={styles.question} numberOfLines={isOpen ? 0 : 1}>
              {r.question}
            </Text>
            {isOpen ? (
              <Text style={styles.answer}>{r.answer}</Text>
            ) : (
              <Text style={styles.preview} numberOfLines={1}>
                {r.answer.length > PREVIEW_CHARS
                  ? `${r.answer.slice(0, PREVIEW_CHARS)}…`
                  : r.answer}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: SPACING.sm },
  row: {
    backgroundColor: COLORS.bgCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  rowOpen: {
    borderColor: COLORS.violetLight,
  },
  question: {
    ...TYPE.subhead,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    fontStyle: 'italic',
  },
  preview: {
    ...TYPE.caption,
    color: COLORS.textMuted,
  },
  answer: {
    ...TYPE.body,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
});
