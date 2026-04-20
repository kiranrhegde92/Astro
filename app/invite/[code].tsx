import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, Linking, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { WebShell } from '../../src/components/web/WebShell';
import { SEOHead } from '../../src/components/web/SEOHead';
import { fetchInviteMeta } from '../../src/services/sharingService';
import { useInstallDetect } from '../../src/utils/useInstallDetect';
import { pickStoreUrl } from '../../src/constants/storeLinks';
import { COLORS, FONTS, SPACING } from '../../src/constants/theme';

export default function InvitePage() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { platform } = useInstallDetect();
  const [state, setState] = useState<{ loading: boolean; inviter?: string; error?: string }>({ loading: true });

  useEffect(() => {
    fetchInviteMeta(String(code))
      .then((r) => {
        if (r.ok) setState({ loading: false, inviter: r.meta.inviterDisplayName });
        else setState({ loading: false, error: r.error });
      })
      .catch(() => setState({ loading: false, error: 'network' }));
  }, [code]);

  return (
    <WebShell>
      <SEOHead
        title={state.inviter ? `${state.inviter} invited you` : 'You have an invite'}
        description="Join CosmicSelf — daily readings, charts, and the wisdom of the stars."
        noindex
      />
      <View style={styles.wrap}>
        {state.loading ? <ActivityIndicator color={COLORS.tide} /> : null}
        {!state.loading && state.error ? <Text style={styles.h1}>Invite unavailable</Text> : null}
        {!state.loading && state.inviter ? (
          <>
            <Text style={styles.eyebrow}>AN INVITATION</Text>
            <Text style={styles.h1}>{state.inviter} invited you to CosmicSelf</Text>
            <Text style={styles.p}>Daily readings, charts, and the wisdom of the stars — personalized for you.</Text>
            <Pressable onPress={() => Linking.openURL(pickStoreUrl(platform))} style={styles.cta}>
              <Text style={styles.ctaText}>Claim invite</Text>
            </Pressable>
            <Text style={styles.codeText}>Invite code: {String(code)}</Text>
          </>
        ) : null}
      </View>
    </WebShell>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: SPACING.xl, gap: SPACING.md, maxWidth: 640, alignItems: 'flex-start' as any },
  eyebrow: { color: COLORS.textMuted, fontSize: 11, fontFamily: FONTS.accent, letterSpacing: 1.4 },
  h1: { color: COLORS.textPrimary, fontSize: 32, fontFamily: FONTS.display, lineHeight: 40 },
  p: { color: COLORS.textSecondary, fontSize: 16, lineHeight: 26 },
  cta: { marginTop: SPACING.md, backgroundColor: COLORS.tide, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999 },
  ctaText: { color: '#0a0816', fontSize: 15, fontFamily: FONTS.accent, letterSpacing: 0.4 },
  codeText: { color: COLORS.textMuted, fontSize: 13, marginTop: SPACING.sm },
});
