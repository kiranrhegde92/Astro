import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { WebShell } from '../../src/components/web/WebShell';
import { SEOHead } from '../../src/components/web/SEOHead';
import { fetchPublicCosmicCard } from '../../src/services/sharingService';
import { COLORS, FONTS, SPACING } from '../../src/constants/theme';

type Card = { sunSign: string; moonSign: string; risingSign: string; displayName: string };

export default function PublicCardPage() {
  const { qrCode } = useLocalSearchParams<{ qrCode: string }>();
  const [state, setState] = useState<{ loading: boolean; card?: Card; error?: string }>({ loading: true });

  useEffect(() => {
    fetchPublicCosmicCard(String(qrCode))
      .then((r) => {
        if (r.ok) setState({ loading: false, card: r.card });
        else setState({ loading: false, error: r.error });
      })
      .catch(() => setState({ loading: false, error: 'network' }));
  }, [qrCode]);

  return (
    <WebShell>
      <SEOHead
        title={state.card ? `${state.card.displayName}'s cosmic self` : 'Cosmic Self Card'}
        description="A shareable cosmic snapshot — Sun, Moon, Rising."
        noindex
      />
      <View style={styles.wrap}>
        {state.loading ? <ActivityIndicator color={COLORS.tide} /> : null}
        {!state.loading && state.error ? <Text style={styles.h1}>Card unavailable</Text> : null}
        {!state.loading && state.card ? (
          <>
            <Text style={styles.eyebrow}>COSMIC SELF</Text>
            <Text style={styles.h1}>{state.card.displayName}</Text>
            <View style={styles.grid}>
              <Cell label="Sun" value={state.card.sunSign} />
              <Cell label="Moon" value={state.card.moonSign} />
              <Cell label="Rising" value={state.card.risingSign} />
            </View>
          </>
        ) : null}
      </View>
    </WebShell>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.cellLabel}>{label}</Text>
      <Text style={styles.cellValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: SPACING.xl, gap: SPACING.md, maxWidth: 640 },
  eyebrow: { color: COLORS.textMuted, fontSize: 11, fontFamily: FONTS.accent, letterSpacing: 1.4 },
  h1: { color: COLORS.textPrimary, fontSize: 32, fontFamily: FONTS.display, lineHeight: 40 },
  grid: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md, flexWrap: 'wrap' },
  cell: { padding: SPACING.lg, borderRadius: 14, backgroundColor: 'rgba(255,248,242,0.04)', minWidth: 140, gap: 4 },
  cellLabel: { color: COLORS.textMuted, fontSize: 12, fontFamily: FONTS.accent, letterSpacing: 1.2 },
  cellValue: { color: COLORS.textPrimary, fontSize: 22, fontFamily: FONTS.heading },
});
