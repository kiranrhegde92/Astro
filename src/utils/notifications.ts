/**
 * Push Notification Utilities for CosmicSelf
 *
 * Uses dynamic imports for expo-notifications so the module can be safely
 * loaded in Expo Go without triggering the SDK-53 push-token side effects.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { UserProfile } from '../types/user';
import { generateDailyReading } from '../content/dailyTemplates';
import { registerPushToken } from './notificationTokenHelper';

// Push tokens (and the DevicePushTokenAutoRegistration side-effect module)
// are unavailable in Expo Go since SDK 53. Never statically import
// expo-notifications at module level — load it dynamically inside functions.
export const IS_EXPO_GO = Constants.appOwnership === 'expo';

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
  const reading = generateDailyReading(new Date(), user.western.sun, user.vedic.rashi, user.chinese.animal);
  const firstName = user.name.split(' ')[0];
  return {
    title: `Good morning, ${firstName}`,
    body: reading.unified.cosmicVibe.length > 110
      ? `${reading.unified.cosmicVibe.slice(0, 107)}...`
      : reading.unified.cosmicVibe,
  };
}

/**
 * Request notification permissions. Returns false in Expo Go (not supported).
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (IS_EXPO_GO) return false;

  // Dynamic import avoids the DevicePushTokenAutoRegistration side-effect in Expo Go
  const Notifications = await import('expo-notifications');

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
    // Non-critical
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

  const Notifications = await import('expo-notifications');
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
  const Notifications = await import('expo-notifications');
  await Notifications.cancelAllScheduledNotificationsAsync();
}
