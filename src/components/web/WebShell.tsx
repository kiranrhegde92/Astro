import React, { useEffect } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { WebNav } from './WebNav';
import { WebFooter } from './WebFooter';
import { mountPlausible } from '../../utils/plausible';

export function WebShell({ children }: { children: React.ReactNode }) {
  useEffect(() => { if (Platform.OS === 'web') mountPlausible(); }, []);
  if (Platform.OS !== 'web') return <>{children}</>;
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <WebNav />
      <View style={styles.main}>{children}</View>
      <WebFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#06040F' },
  content: { minHeight: '100%' },
  main: { flex: 1, width: '100%', maxWidth: 1200, marginHorizontal: 'auto' as any },
});
