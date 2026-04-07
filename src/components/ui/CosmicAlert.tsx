import React, { useCallback, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../../constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CosmicAlertButton = {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void | Promise<void>;
};

type AlertState = {
  visible: boolean;
  title: string;
  message: string;
  buttons: CosmicAlertButton[];
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCosmicAlert() {
  const [state, setState] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  const showAlert = useCallback(
    (title: string, message = '', buttons: CosmicAlertButton[] = [{ text: 'OK' }]) => {
      setState({ visible: true, title, message, buttons });
    },
    [],
  );

  const dismiss = useCallback(() => {
    setState((s) => ({ ...s, visible: false }));
  }, []);

  const alertModal = (
    <CosmicAlertModal
      visible={state.visible}
      title={state.title}
      message={state.message}
      buttons={state.buttons}
      onDismiss={dismiss}
    />
  );

  return { showAlert, alertModal };
}

// ─── Modal component ──────────────────────────────────────────────────────────

type Props = {
  visible: boolean;
  title: string;
  message: string;
  buttons: CosmicAlertButton[];
  onDismiss: () => void;
};

export function CosmicAlertModal({ visible, title, message, buttons, onDismiss }: Props) {
  const handlePress = async (btn: CosmicAlertButton) => {
    onDismiss();
    await btn.onPress?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.scrim} onPress={onDismiss}>
        <Pressable onPress={() => {}} style={styles.cardWrap}>
          <LinearGradient colors={COLORS.gradientSilver} style={styles.card}>

            {/* Top accent pill */}
            <View style={styles.pill} />

            <Text style={styles.title}>{title}</Text>
            {!!message && <Text style={styles.message}>{message}</Text>}

            <View style={styles.divider} />

            <View style={[styles.btnRow, buttons.length === 1 && styles.btnRowSingle]}>
              {buttons.map((btn, i) => {
                const isDestructive = btn.style === 'destructive';
                const isCancel = btn.style === 'cancel';
                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.btn,
                      buttons.length === 1 && styles.btnFull,
                      isDestructive && styles.btnDestructive,
                      isCancel && styles.btnCancel,
                      !isDestructive && !isCancel && styles.btnDefault,
                    ]}
                    onPress={() => handlePress(btn)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.btnText,
                        isDestructive && styles.btnTextDestructive,
                        isCancel && styles.btnTextCancel,
                        !isDestructive && !isCancel && styles.btnTextDefault,
                      ]}
                    >
                      {btn.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(100, 80, 160, 0.30)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  cardWrap: {
    width: '100%',
    maxWidth: 340,
    shadowColor: '#7367ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  card: {
    borderRadius: BORDER_RADIUS.xxl,
    borderWidth: 1,
    borderColor: 'rgba(115,103,255,0.18)',
    overflow: 'hidden',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  pill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(115,103,255,0.35)',
    alignSelf: 'center',
    marginBottom: SPACING.xs,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    lineHeight: 28,
    fontFamily: FONTS.display,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    paddingHorizontal: SPACING.xs,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(115,103,255,0.12)',
    marginVertical: SPACING.xs,
  },
  btnRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  btnRowSingle: {
    flexDirection: 'column',
  },
  btn: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnFull: {
    flex: undefined,
    width: '100%',
  },
  btnDefault: {
    backgroundColor: COLORS.western,
    borderColor: COLORS.western,
  },
  btnCancel: {
    backgroundColor: 'rgba(36,40,74,0.06)',
    borderColor: 'rgba(36,40,74,0.14)',
  },
  btnDestructive: {
    backgroundColor: 'rgba(255,94,126,0.08)',
    borderColor: 'rgba(255,94,126,0.40)',
  },
  btnText: {
    fontSize: 15,
    fontFamily: FONTS.heading,
    letterSpacing: 0.1,
  },
  btnTextDefault: {
    color: '#ffffff',
  },
  btnTextCancel: {
    color: COLORS.textSecondary,
  },
  btnTextDestructive: {
    color: COLORS.coral,
  },
});
