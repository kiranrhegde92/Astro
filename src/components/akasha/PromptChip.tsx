import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BORDER_RADIUS, COLORS, SPACING } from '../../constants/theme';

interface Props {
  label: string;
  onPress: () => void;
}

export function PromptChip({ label, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={styles.chip}
      activeOpacity={0.75}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: COLORS.violetSoft,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(91,62,168,0.2)',
  },
  label: { color: COLORS.violetDeep, fontWeight: '600', fontSize: 13 },
});
