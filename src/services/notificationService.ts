import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');

export interface MealReminderSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

interface PersistedReminder extends MealReminderSettings {
  notificationIds?: string[];
  /** Legacy v1 field, migrated when read. */
  notificationId?: string;
}

const STORAGE_KEY = '@mensabaer/meal-reminder/v1';
const CHANNEL_ID = 'meal-reminders';
const DEFAULT_SETTINGS: MealReminderSettings = {
  enabled: false,
  hour: 11,
  minute: 30,
};

export class NotificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotificationError';
  }
}

export function configureNotificationHandling(): void {
  if (Platform.OS === 'web') return;

  try {
    const Notifications = require('expo-notifications') as NotificationsModule;
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch {
    // Keep the rest of the app usable if notifications are unavailable.
  }
}

async function getNotifications(): Promise<NotificationsModule> {
  if (Platform.OS === 'web') {
    throw new NotificationError(
      'Essens-Erinnerungen können nur in der Android- oder iOS-App aktiviert werden.',
    );
  }
  return require('expo-notifications') as NotificationsModule;
}

async function readPersistedReminder(): Promise<PersistedReminder> {
  try {
    const serialized = await AsyncStorage.getItem(STORAGE_KEY);
    if (!serialized) return DEFAULT_SETTINGS;
    const value = JSON.parse(serialized) as Partial<PersistedReminder>;
    const hour = value.hour;
    const minute = value.minute;
    if (
      typeof value.enabled !== 'boolean' ||
      typeof hour !== 'number' ||
      !Number.isInteger(hour) ||
      typeof minute !== 'number' ||
      !Number.isInteger(minute)
    ) {
      return DEFAULT_SETTINGS;
    }
    return {
      enabled: value.enabled,
      hour,
      minute,
      notificationIds: [
        ...(Array.isArray(value.notificationIds)
          ? value.notificationIds.filter((id): id is string => typeof id === 'string')
          : []),
        ...(typeof value.notificationId === 'string' ? [value.notificationId] : []),
      ],
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function getMealReminderSettings(): Promise<MealReminderSettings> {
  const { enabled, hour, minute } = await readPersistedReminder();
  return { enabled, hour, minute };
}

async function ensurePermission(Notifications: NotificationsModule): Promise<void> {
  const current = await Notifications.getPermissionsAsync();
  const alreadyAllowed =
    current.granted ||
    current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  const result = alreadyAllowed
    ? current
    : await Notifications.requestPermissionsAsync();
  const allowed =
    result.granted ||
    result.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  if (!allowed) {
    throw new NotificationError(
      'Benachrichtigungen wurden nicht erlaubt. Bitte in den Systemeinstellungen freigeben.',
    );
  }
}

function validateTime(hour: number, minute: number): void {
  if (
    !Number.isInteger(hour) ||
    hour < 0 ||
    hour > 23 ||
    !Number.isInteger(minute) ||
    minute < 0 ||
    minute > 59
  ) {
    throw new NotificationError('Die Erinnerungszeit ist ungültig.');
  }
}

export async function saveMealReminder(
  settings: MealReminderSettings,
): Promise<MealReminderSettings> {
  validateTime(settings.hour, settings.minute);
  const previous = await readPersistedReminder();
  const previousIds = [...new Set(previous.notificationIds ?? [])];

  if (!settings.enabled) {
    if (
      previousIds.length > 0 &&
      Platform.OS !== 'web'
    ) {
      const Notifications = await getNotifications();
      await Promise.all(
        previousIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)),
      );
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return settings;
  }

  const Notifications = await getNotifications();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Essens-Erinnerungen',
      description: 'Tägliche Erinnerung an den aktuellen Mensa-Speiseplan',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  await ensurePermission(Notifications);

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Zeit für den Mensabär 🐻',
      body: 'Schau jetzt nach, was heute in deiner Mensa angeboten wird.',
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: settings.hour,
      minute: settings.minute,
      channelId: Platform.OS === 'android' ? CHANNEL_ID : undefined,
    },
  });

  const transitionalState: PersistedReminder = {
    ...settings,
    notificationIds: [notificationId, ...previousIds],
  };
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transitionalState));
  } catch {
    await Notifications.cancelScheduledNotificationAsync(notificationId).catch(
      () => undefined,
    );
    throw new NotificationError('Essens-Erinnerung konnte nicht gespeichert werden.');
  }

  const cancellationResults = await Promise.allSettled(
    previousIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)),
  );
  const idsStillScheduled = previousIds.filter(
    (_, index) => cancellationResults[index]?.status === 'rejected',
  );
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...settings,
      notificationIds: [notificationId, ...idsStillScheduled],
    } satisfies PersistedReminder),
  );
  return settings;
}
