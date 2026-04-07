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
import { BORDER_RADIUS, COLORS, FONTS, SHADOWS, SPACING } from '../../constants/theme';

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

/**
 * Drop-in replacement for React Native's Alert.alert().
 *
 * Usage:
 *   const { showAlert, alertModal } = useCosmicAlert();
 *   showAlert('Title', 'Message', [{ text: 'OK' }]);
 *   // render {alertModal} anywhere in the component's JSX
 */
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
      {/* Scrim */}
      <Pressable style={styles.scrim} onPress={onDismiss}>
        <Pressable onPress={() => {}} style={styles.cardWrap}>
          <LinearGradient colors={COLORS.gradientInk} style={styles.card}>
            {/* Accent line */}
            <View style={styles.accentLine} />

            <Text style={styles.title}>{title}</Text>
            {!!message && <Text style={styles.message}>{message}</Text>}

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
    backgroundColor: 'rgba(8,6,24,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  cardWrap: {
    width: '100%',
    maxWidth: 340,
    ...SHADOWS.deep,
  },
  card: {
    borderRadius: BORDER_RADIUS.xxl,
    borderWidth: 1,
    borderColor: COLORS.glassBorderBright,
    overflow: 'hidden',
    paddingHorizontal: SPACING.lg,
    paddingTop: 0,
    paddingBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  accentLine: {
    height: 3,
    width: 44,
    borderRadius: 2,
    backgroundColor: COLORS.western,
    alignSelf: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    lineHeight: 28,
    fontFamily: FONTS.display,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    paddingHorizontal: SPACING.sm,
  },
  btnRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
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
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderColor: COLORS.glassBorder,
  },
  btnDestructive: {
    backgroundColor: `${COLORS.coral}18`,
    borderColor: `${COLORS.coral}66`,
  },
  btnText: {
    fontSize: 15,
    fontFamily: FONTS.heading,
    letterSpacing: 0.2,
  },
  btnTextDefault: {
    color: '#fff',
  },
  btnTextCancel: {
    color: COLORS.textSecondary,
  },
  btnTextDestructive: {
    color: COLORS.coral,
  },
});
