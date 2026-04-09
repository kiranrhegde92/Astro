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
import type { UserProfile } from '../types/user';
import { generateDailyReading } from '../content/dailyTemplates';
import { buildForecastProfile } from '../content/predictionSignals';
import { registerPushToken } from './notificationTokenHelper';

export const IS_EXPO_GO = Constants.appOwnership === 'expo';

// Lazy accessor — require() is synchronous and Metro-bundled, but the
// side-effect modules inside expo-notifications only run on first call.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const getNotifications = () => require('expo-notifications') as typeof import('expo-notifications');

const COSMIC_MESSAGES = [
  { title: 'Your Stars Are Aligned', body: 'The cosmos has a beautiful message for you today. Open CosmicSelf to discover it.' },
  { title: 'Cosmic Energy Update', body: 'Today brings a wave of positive cosmic energy your way. See what the stars say.' },
  { title: 'Good Morning, Star Child', body: 'Your daily cosmic vibe is ready. The universe has something special for you.' },
  { title: 'The Stars Are Speaking', body: 'Your multi-system cosmic reading is waiting. All 4 traditions aligned for you.' },
  { title: 'Cosmic Alignment', body: 'The planets are dancing in your favor today. Check your personalized reading.' },
  { title: 'Your Cosmic DNA Speaks', body: 'A new day, a new cosmic insight. Your unique star blueprint has guidance for you.' },
  { title: 'Celestial Guidance', body: 'Ancient wisdom from 4 traditions has a message for your day. Come see.' },
];

function getDailyMessage(): { title: string; body: string } {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return COSMIC_MESSAGES[dayOfYear % COSMIC_MESSAGES.length];
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

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
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
  await Notifications.cancelAllScheduledNotificationsAsync();

  const [hours, minutes] = timeString.split(':').map(Number);
  const message = getPersonalizedMessage(user);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: message.title,
      body: message.body,
      data: { screen: 'today' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hours,
      minute: minutes,
    },
  });
}

/**
 * Cancel all scheduled notifications. No-op in Expo Go.
 */
export async function cancelAllNotifications(): Promise<void> {
  if (IS_EXPO_GO) return;
  const Notifications = getNotifications();
  await Notifications.cancelAllScheduledNotificationsAsync();
}
