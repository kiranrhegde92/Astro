import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { WebShell } from '../../src/components/web/WebShell';
import { SEOHead } from '../../src/components/web/SEOHead';
import { fetchSharedReading } from '../../src/services/sharingService';
import { COLORS, FONTS, SPACING } from '../../src/constants/theme';

type State =
  | { loading: true }
  | { loading: false; data: null }
  | { loading: false; data: { question: string; answer: string } };

export default function SharedReadingPage() {
  const { readingId } = useLocalSearchParams<{ readingId: string }>();
  const [state, setState] = useState<State>({ loading: true });
  useEffect(() => {
    fetchSharedReading(String(readingId))
      .then((r) => {
        if (r.ok) setState({ loading: false, data: { question: r.reading.question, answer: r.reading.answer } });
        else setState({ loading: false, data: null });
      })
      .catch(() => setState({ loading: false, data: null }));
  }, [readingId]);

  const title = state.loading || !state.data ? 'Shared reading' : state.data.question.slice(0, 60);
  const desc = state.loading || !state.data ? 'A CosmicSelf reading.' : state.data.answer.slice(0, 160);

  return (
    <WebShell>
      <SEOHead title={title} description={desc} noindex />
      <View style={styles.wrap}>
        {state.loading ? <ActivityIndicator color={COLORS.tide} /> : null}
        {!state.loading && !state.data ? <Text style={styles.h1}>Reading not found</Text> : null}
        {!state.loading && state.data ? (
          <>
            <Text style={styles.eyebrow}>A COSMIC READING</Text>
            <Text style={styles.q}>{state.data.question}</Text>
            <Text style={styles.a}>{state.data.answer}</Text>
          </>
        ) : null}
      </View>
    </WebShell>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: SPACING.xl, gap: SPACING.md, maxWidth: 760, width: '100%' },
  eyebrow: { color: COLORS.textMuted, fontSize: 11, fontFamily: FONTS.accent, letterSpacing: 1.4 },
  h1: { color: COLORS.textPrimary, fontSize: 28, fontFamily: FONTS.display },
  q: { color: COLORS.textPrimary, fontSize: 24, fontFamily: FONTS.heading, lineHeight: 32 },
  a: { color: COLORS.textSecondary, fontSize: 16, lineHeight: 28 },
});
