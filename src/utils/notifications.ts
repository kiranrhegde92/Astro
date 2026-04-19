/**
 * Push Notification Utilities for CosmicSelf
 *
 * expo-notifications crashes in Expo Go SDK 53+ because its
 * DevicePushTokenAutoRegistration side-effect module throws on Android
 * when loaded. We avoid the static import and use lazy require() inside
 * each function instead. Metro still bundles the module (require strings
 * are statically analyzable) but the side-effect code never runs at
 * module load time, only when a function is actually called.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DailyReading } from '../types/astrology';
import type { UserProfile } from '../types/user';
import { generateDailyReading } from '../content/dailyTemplates';
import { buildForecastProfile } from '../content/predictionSignals';
import { getDateKey } from './dateUtils';
import { registerPushToken } from './notificationTokenHelper';

export const IS_EXPO_GO = Constants.appOwnership === 'expo';

// Lazy accessor — require() is synchronous and Metro-bundled, but the
// side-effect modules inside expo-notifications only run on first call.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const getNotifications = () => require('expo-notifications') as typeof import('expo-notifications');

/* ------------------------------------------------------------------ */
/*  Notification deep-link route mapping                              */
/* ------------------------------------------------------------------ */

/** Screen keys that push notification payloads can carry in `data.screen`. */
export type NotificationScreen = 'today' | 'profile' | 'compatibility' | 'transits';

const SCREEN_ROUTES: Record<NotificationScreen, string> = {
  today: '/(tabs)/today',
  profile: '/(tabs)/profile',
  compatibility: '/(tabs)/compatibility',
  transits: '/reading/transits',
};

/** Resolve a notification `data.screen` value to an expo-router path. */
export function resolveNotificationRoute(screen?: string): string | null {
  if (!screen) return null;
  return SCREEN_ROUTES[screen as NotificationScreen] ?? null;
}

/* ------------------------------------------------------------------ */
/*  Foreground notification handler (idempotent)                      */
/* ------------------------------------------------------------------ */

let handlerInitialized = false;

/**
 * Register the foreground notification handler so notifications display
 * while the app is open. Safe to call multiple times — only registers
 * once. No-op in Expo Go.
 */
export function initializeNotificationHandler(): void {
  if (IS_EXPO_GO || handlerInitialized) return;
  handlerInitialized = true;

  const Notifications = getNotifications();
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/* ------------------------------------------------------------------ */
/*  Notification response listeners (tap handling)                    */
/* ------------------------------------------------------------------ */

/**
 * Set up a listener for notification interactions (user taps).
 * Returns a cleanup function that removes the listener.
 * No-op in Expo Go (returns no-op cleanup).
 */
export function setupNotificationResponseListener(
  onResponse: (screen: string | undefined, data: Record<string, unknown>) => void,
): () => void {
  if (IS_EXPO_GO) return () => {};

  const Notifications = getNotifications();
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = (response.notification.request.content.data ?? {}) as Record<string, unknown>;
    onResponse(data.screen as string | undefined, data);
  });

  return () => subscription.remove();
}

/**
 * Check if the app was launched by tapping a notification (cold start).
 * Returns the notification data, or null. No-op in Expo Go.
 */
export async function getLastNotificationResponse(): Promise<{
  screen?: string;
  data: Record<string, unknown>;
} | null> {
  if (IS_EXPO_GO) return null;

  const Notifications = getNotifications();
  const response = await Notifications.getLastNotificationResponseAsync();
  if (!response) return null;

  const data = (response.notification.request.content.data ?? {}) as Record<string, unknown>;
  return { screen: data.screen as string | undefined, data };
}

/* ------------------------------------------------------------------ */
/*  Daily reminder content                                            */
/* ------------------------------------------------------------------ */

const COSMIC_MESSAGES = [
  { title: 'Your Stars Are Aligned', body: 'The cosmos has a beautiful message for you today. Open CosmicSelf to discover it.' },
  { title: 'Cosmic Energy Update', body: 'Today brings a wave of positive cosmic energy your way. See what the stars say.' },
  { title: 'Good Morning, Star Child', body: 'Your daily cosmic vibe is ready. The universe has something special for you.' },
  { title: 'The Stars Are Speaking', body: 'Your multi-system cosmic reading is waiting. All 4 traditions aligned for you.' },
  { title: 'Cosmic Alignment', body: 'The planets are dancing in your favor today. Check your personalized reading.' },
  { title: 'Your Cosmic DNA Speaks', body: 'A new day, a new cosmic insight. Your unique star blueprint has guidance for you.' },
  { title: 'Celestial Guidance', body: 'Ancient wisdom from 4 traditions has a message for your day. Come see.' },
];

const DAILY_NOTIFICATION_KIND = 'daily';
const TRANSIT_NOTIFICATION_KIND = 'transit';
const MATCH_PEAK_NOTIFICATION_KIND = 'match-peak';
const TRANSIT_ALERT_MEMORY_KEY = '@cosmicself_last_transit_alert';
const HIGH_IMPACT_TRANSIT_PLANETS = new Set(['Jupiter', 'Saturn', 'NorthNode', 'SouthNode']);
const HIGH_IMPACT_TRANSIT_ASPECTS = new Set(['conjunction', 'square']);

function getDailyMessage(): { title: string; body: string } {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return COSMIC_MESSAGES[dayOfYear % COSMIC_MESSAGES.length];
}

async function cancelNotificationsByKind(kind: string): Promise<void> {
  if (IS_EXPO_GO) return;
  const Notifications = getNotifications();
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((item) => item.content?.data?.kind === kind)
      .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier))
  );
}

export function getHighImpactTransit(reading?: DailyReading | null) {
  return (reading?.activeTransits ?? []).find(
    (transit) =>
      HIGH_IMPACT_TRANSIT_PLANETS.has(transit.transitPlanet) &&
      HIGH_IMPACT_TRANSIT_ASPECTS.has(transit.aspect) &&
      transit.orb <= 1.5
  );
}

function buildTransitAlertSignature(reading: DailyReading, transit: NonNullable<DailyReading['activeTransits']>[number]) {
  return [reading.date, transit.transitPlanet, transit.aspect, transit.natalPlanet, transit.orb.toFixed(1)].join('|');
}

function buildTransitAlertContent(user: UserProfile | null | undefined, transit: NonNullable<DailyReading['activeTransits']>[number]) {
  const firstName = user?.name?.split(' ')[0] ?? 'Star Child';
  const title = `${transit.transitPlanet} is active for ${firstName}`;
  const body = transit.brief.length > 110 ? `${transit.brief.slice(0, 107)}...` : transit.brief;
  return { title, body };
}

function getPersonalizedMessage(user?: UserProfile | null): { title: string; body: string } {
  if (!user?.western?.sun || !user?.vedic?.rashi || !user?.chinese?.animal) {
    return getDailyMessage();
  }
  const profile = buildForecastProfile(user);
  const reading = profile
    ? generateDailyReading(new Date(), profile)
    : generateDailyReading(new Date(), user.western.sun, user.vedic.rashi, user.chinese.animal);
  const firstName = user.name.split(' ')[0];
  return {
    title: `Good morning, ${firstName}`,
    body: reading.unified.cosmicVibe.length > 110
      ? `${reading.unified.cosmicVibe.slice(0, 107)}...`
      : reading.unified.cosmicVibe,
  };
}

/**
 * Request notification permissions. Returns false in Expo Go.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (IS_EXPO_GO) return false;

  // Ensure the foreground handler is registered before requesting permissions
  initializeNotificationHandler();

  const Notifications = getNotifications();

  const existingPermissions = await Notifications.getPermissionsAsync() as any;
  let finalStatus = existingPermissions?.granted ? 'granted' : existingPermissions?.status ?? 'denied';
  if (!existingPermissions?.granted && finalStatus !== 'granted') {
    const requestedPermissions = await Notifications.requestPermissionsAsync() as any;
    finalStatus = requestedPermissions?.granted ? 'granted' : requestedPermissions?.status ?? 'denied';
  }
  if (finalStatus !== 'granted') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('cosmic-daily', {
      name: 'Daily Cosmic Vibe',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFD700',
    });
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    await registerPushToken(tokenData.data);
  } catch {
    // Non-critical — push token unavailable in some environments
  }

  return true;
}

/**
 * Schedule a daily recurring notification. No-op in Expo Go.
 */
export async function scheduleDailyNotification(
  timeString: string,
  user?: UserProfile | null
): Promise<void> {
  if (IS_EXPO_GO) return;

  const Notifications = getNotifications();
  await cancelNotificationsByKind(DAILY_NOTIFICATION_KIND);

  const [hours, minutes] = timeString.split(':').map(Number);
  const message = getPersonalizedMessage(user);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: message.title,
      body: message.body,
      data: { screen: 'today', kind: DAILY_NOTIFICATION_KIND },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hours,
      minute: minutes,
    },
  });
}

export async function scheduleHighImpactTransitAlert(
  reading: DailyReading,
  user?: UserProfile | null
): Promise<boolean> {
  if (IS_EXPO_GO) return false;

  const transit = getHighImpactTransit(reading);
  if (!transit) {
    await cancelNotificationsByKind(TRANSIT_NOTIFICATION_KIND);
    await AsyncStorage.removeItem(TRANSIT_ALERT_MEMORY_KEY);
    return false;
  }

  const signature = buildTransitAlertSignature(reading, transit);
  const lastScheduled = await AsyncStorage.getItem(TRANSIT_ALERT_MEMORY_KEY);
  if (lastScheduled === signature) {
    return false;
  }

  const Notifications = getNotifications();
  await cancelNotificationsByKind(TRANSIT_NOTIFICATION_KIND);

  const { title, body } = buildTransitAlertContent(user, transit);
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: {
        screen: 'transits',
        kind: TRANSIT_NOTIFICATION_KIND,
        transitPlanet: transit.transitPlanet,
        natalPlanet: transit.natalPlanet,
        aspect: transit.aspect,
      },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5 * 60,
      repeats: false,
    },
  });

  await AsyncStorage.setItem(TRANSIT_ALERT_MEMORY_KEY, signature);
  return true;
}

export async function cancelTransitAlerts(): Promise<void> {
  await cancelNotificationsByKind(TRANSIT_NOTIFICATION_KIND);
  await AsyncStorage.removeItem(TRANSIT_ALERT_MEMORY_KEY);
}

export async function scheduleMatchPeakNotification(
  partnerName: string,
  peakDateKey: string,
  peakScore: number,
  note: string,
): Promise<boolean> {
  if (IS_EXPO_GO) return false;

  const peakDate = new Date(peakDateKey);
  const now = new Date();
  const fireAt = new Date(peakDate);
  fireAt.setHours(9, 30, 0, 0);
  const secondsUntil = Math.floor((fireAt.getTime() - now.getTime()) / 1000);
  if (secondsUntil < 60) return false;

  const Notifications = getNotifications();
  await cancelNotificationsByKind(MATCH_PEAK_NOTIFICATION_KIND);

  const weekday = peakDate.toLocaleDateString('en-US', { weekday: 'long' });
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Peak day with ${partnerName} \u2728`,
      body: `${weekday} is your ${peakScore}% window. ${note}`,
      data: {
        screen: 'compatibility',
        kind: MATCH_PEAK_NOTIFICATION_KIND,
        partnerName,
        peakDateKey,
      },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: secondsUntil,
      repeats: false,
    },
  });
  return true;
}

export async function cancelMatchPeakAlerts(): Promise<void> {
  await cancelNotificationsByKind(MATCH_PEAK_NOTIFICATION_KIND);
}

/**
 * Cancel all scheduled notifications. No-op in Expo Go.
 */
export async function cancelAllNotifications(): Promise<void> {
  if (IS_EXPO_GO) return;
  await cancelNotificationsByKind(DAILY_NOTIFICATION_KIND);
  await cancelTransitAlerts();
  await cancelMatchPeakAlerts();
}
