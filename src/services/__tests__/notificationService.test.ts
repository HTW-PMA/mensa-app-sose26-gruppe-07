import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockSetNotificationHandler = jest.fn<(handler: unknown) => void>();
const mockGetPermissionsAsync = jest.fn<() => Promise<any>>();
const mockRequestPermissionsAsync = jest.fn<() => Promise<any>>();
const mockSetNotificationChannelAsync = jest.fn<
  (channelId: string, input: unknown) => Promise<void>
>();
const mockScheduleNotificationAsync = jest.fn<
  (input: unknown) => Promise<string>
>();
const mockCancelScheduledNotificationAsync = jest.fn<
  (notificationId: string) => Promise<void>
>();

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const mockGetItem = jest.mocked(AsyncStorage.getItem);
const mockSetItem = jest.mocked(AsyncStorage.setItem);

jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: mockSetNotificationHandler,
  getPermissionsAsync: mockGetPermissionsAsync,
  requestPermissionsAsync: mockRequestPermissionsAsync,
  setNotificationChannelAsync: mockSetNotificationChannelAsync,
  scheduleNotificationAsync: mockScheduleNotificationAsync,
  cancelScheduledNotificationAsync: mockCancelScheduledNotificationAsync,
  IosAuthorizationStatus: { PROVISIONAL: 3 },
  AndroidImportance: { DEFAULT: 3 },
  SchedulableTriggerInputTypes: { DAILY: 'daily', TIME_INTERVAL: 'timeInterval' },
}));

import { Platform } from 'react-native';
import {
  configureNotificationHandling,
  getMealReminderSettings,
  NotificationError,
  scheduleTestNotification,
  saveMealReminder,
} from '../notificationService';

const storageKey = '@mensabaer/meal-reminder/v1';

describe('meal reminder notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);
    mockGetPermissionsAsync.mockResolvedValue({ granted: true });
    mockRequestPermissionsAsync.mockResolvedValue({ granted: true });
    mockScheduleNotificationAsync.mockResolvedValue('scheduled-id');
    mockCancelScheduledNotificationAsync.mockResolvedValue(undefined);
  });

  it('configures foreground notifications in Expo Go on native platforms', async () => {
    configureNotificationHandling();
    await Promise.resolve();

    expect(mockSetNotificationHandler).toHaveBeenCalledWith({
      handleNotification: expect.any(Function),
    });
  });

  it('keeps reminders unavailable on web', async () => {
    Platform.OS = 'web';

    await expect(
      saveMealReminder({ enabled: true, hour: 11, minute: 30 }),
    ).rejects.toBeInstanceOf(NotificationError);
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('returns default settings when no reminder was saved', async () => {
    await expect(getMealReminderSettings()).resolves.toEqual({
      enabled: false,
      hour: 11,
      minute: 30,
    });
  });

  it('falls back to default settings when persisted time is out of range', async () => {
    mockGetItem.mockResolvedValue(
      JSON.stringify({ enabled: true, hour: 24, minute: -1 }),
    );

    await expect(getMealReminderSettings()).resolves.toEqual({
      enabled: false,
      hour: 11,
      minute: 30,
    });
  });

  it('schedules a daily reminder after notification permission is granted', async () => {
    await saveMealReminder({ enabled: true, hour: 12, minute: 15 });

    expect(mockScheduleNotificationAsync).toHaveBeenCalledWith({
      content: {
        title: expect.any(String),
        body: 'Schau jetzt nach, was heute in deiner Mensa angeboten wird.',
        sound: 'default',
      },
      trigger: {
        type: 'daily',
        hour: 12,
        minute: 15,
        channelId: undefined,
      },
    });
    expect(mockSetItem).toHaveBeenLastCalledWith(
      storageKey,
      JSON.stringify({
        enabled: true,
        hour: 12,
        minute: 15,
        notificationIds: ['scheduled-id'],
      }),
    );
  });

  it('creates the Android notification channel before scheduling the reminder', async () => {
    Platform.OS = 'android';

    await saveMealReminder({ enabled: true, hour: 12, minute: 15 });

    expect(mockSetNotificationChannelAsync).toHaveBeenCalledWith(
      'meal-reminders',
      expect.objectContaining({ importance: 3 }),
    );
    expect(mockScheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger: expect.objectContaining({ channelId: 'meal-reminders' }),
      }),
    );
  });

  it('schedules a one-off presentation notification after five seconds', async () => {
    await scheduleTestNotification();

    expect(mockScheduleNotificationAsync).toHaveBeenCalledWith({
      content: {
        title: 'Mensabär-Test erfolgreich 🐻',
        body: 'Lokale Benachrichtigungen funktionieren auf diesem Gerät.',
        sound: 'default',
      },
      trigger: {
        type: 'timeInterval',
        seconds: 5,
        repeats: false,
        channelId: undefined,
      },
    });
  });

  it('accepts provisional iOS notification permission without requesting again', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ granted: false, ios: { status: 3 } });

    await saveMealReminder({ enabled: true, hour: 12, minute: 15 });

    expect(mockRequestPermissionsAsync).not.toHaveBeenCalled();
    expect(mockScheduleNotificationAsync).toHaveBeenCalled();
  });

  it('does not schedule when notification permission is denied', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ granted: false });
    mockRequestPermissionsAsync.mockResolvedValue({ granted: false });

    await expect(
      saveMealReminder({ enabled: true, hour: 12, minute: 15 }),
    ).rejects.toBeInstanceOf(NotificationError);
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('replaces an existing scheduled reminder after saving the new one', async () => {
    mockGetItem.mockResolvedValue(
      JSON.stringify({
        enabled: true,
        hour: 11,
        minute: 30,
        notificationIds: ['old-id'],
      }),
    );

    await saveMealReminder({ enabled: true, hour: 12, minute: 15 });

    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith('old-id');
  });

  it('cancels all scheduled reminders when disabled, including in Expo Go', async () => {
    mockGetItem.mockResolvedValue(
      JSON.stringify({
        enabled: true,
        hour: 11,
        minute: 30,
        notificationIds: ['first-id', 'second-id'],
      }),
    );

    await saveMealReminder({ enabled: false, hour: 11, minute: 30 });

    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith('first-id');
    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith('second-id');
    expect(mockSetItem).toHaveBeenCalledWith(
      storageKey,
      JSON.stringify({ enabled: false, hour: 11, minute: 30 }),
    );
  });

  it('cancels a newly scheduled reminder when it cannot be persisted', async () => {
    mockSetItem.mockRejectedValueOnce(new Error('storage unavailable'));

    await expect(
      saveMealReminder({ enabled: true, hour: 12, minute: 15 }),
    ).rejects.toBeInstanceOf(NotificationError);
    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith('scheduled-id');
  });
});
