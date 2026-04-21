import { Platform } from 'react-native';

export interface SpokenReadingPayload {
  headline: string;
  heroBody: string;
  bestUse?: string;
  watchFor?: string;
  affirmation?: string;
}

export interface SpeakReadingOptions {
  onDone?: () => void;
  onError?: () => void;
}

function buildSpokenScript(payload: SpokenReadingPayload) {
  const parts = [
    payload.headline,
    payload.heroBody,
    payload.bestUse ? `Best use of the day: ${payload.bestUse}` : '',
    payload.watchFor ? `Watch for: ${payload.watchFor}` : '',
    payload.affirmation ? `Affirmation: ${payload.affirmation}` : '',
  ].filter(Boolean);

  return parts.join('. ');
}

export async function speakReading(
  payload: SpokenReadingPayload,
  options: SpeakReadingOptions = {}
): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const Speech = await import('expo-speech');
    await Speech.stop();
    Speech.speak(buildSpokenScript(payload), {
      language: 'en-US',
      rate: 0.96,
      pitch: 1.0,
      onDone: options.onDone,
      onStopped: options.onDone,
      onError: options.onError,
    });
    return true;
  } catch {
    return false;
  }
}

export async function stopReadingAudio(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const Speech = await import('expo-speech');
    await Speech.stop();
  } catch {}
}
