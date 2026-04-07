/**
 * Push Notification Utilities for CosmicSelf
 *
 * Handles scheduling daily cosmic vibe notifications using expo-notifications.
 * Morning notification with a gentle, positive cosmic message.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { UserProfile } from '../types/user';
import { generateDailyReading } from '../content/dailyTemplates';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions from the user.
 * Returns true if permission was granted.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  // Android requires a notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('cosmic-daily', {
      name: 'Daily Cosmic Vibe',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFD700',
    });
  }

  return true;
}

/**
 * Daily cosmic notification messages - gentle, positive, never alarming.
 */
const COSMIC_MESSAGES = [
  { title: 'Your Stars Are Aligned', body: 'The cosmos has a beautiful message for you today. Open CosmicSelf to discover it.' },
  { title: 'Cosmic Energy Update', body: 'Today brings a wave of positive cosmic energy your way. See what the stars say.' },
  { title: 'Good Morning, Star Child', body: 'Your daily cosmic vibe is ready. The universe has something special for you.' },
  { title: 'The Stars Are Speaking', body: 'Your multi-system cosmic reading is waiting. All 4 traditions aligned for you.' },
  { title: 'Cosmic Alignment', body: 'The planets are dancing in your favor today. Check your personalized reading.' },
  { title: 'Your Cosmic DNA Speaks', body: 'A new day, a new cosmic insight. Your unique star blueprint has guidance for you.' },
  { title: 'Celestial Guidance', body: 'Ancient wisdom from 4 traditions has a message for your day. Come see.' },
];

/**
 * Get a daily notification message based on the day of the year.
 */
function getDailyMessage(): { title: string; body: string } {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return COSMIC_MESSAGES[dayOfYear % COSMIC_MESSAGES.length];
}

function getPersonalizedMessage(user?: UserProfile | null): { title: string; body: string } {
  if (!user?.western || !user?.vedic || !user?.chinese) {
    return getDailyMessage();
  }

  const reading = generateDailyReading(
    new Date(),
    user.western.sun,
    user.vedic.rashi,
    user.chinese.animal
  );
  const firstName = user.name.split(' ')[0];
  return {
    title: `Good morning, ${firstName}`,
    body: reading.unified.cosmicVibe.length > 110
      ? `${reading.unified.cosmicVibe.slice(0, 107)}...`
      : reading.unified.cosmicVibe,
  };
}

/**
 * Schedule a daily recurring notification at the specified time.
 * Cancels any existing scheduled notifications first.
 */
export async function scheduleDailyNotification(
  timeString: string,
  user?: UserProfile | null
): Promise<void> {
  // Cancel existing scheduled notifications
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
 * Cancel all scheduled notifications.
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
