import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const KEY = '@cosmicself_akasha_enabled';
const DEFAULT = true;

export async function isAkashaEnabled(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(KEY);
    if (v === null) return DEFAULT;
    return v === '1';
  } catch {
    return DEFAULT;
  }
}

export async function setAkashaEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, enabled ? '1' : '0');
  } catch {
    // ignore
  }
}

export function useAkashaEnabled(): boolean {
  const [enabled, setEnabled] = useState<boolean>(DEFAULT);
  useEffect(() => {
    let cancelled = false;
    isAkashaEnabled().then((v) => {
      if (!cancelled) setEnabled(v);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return enabled;
}
