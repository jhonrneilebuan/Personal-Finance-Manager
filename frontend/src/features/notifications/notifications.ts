import Constants from 'expo-constants';
import { Platform } from 'react-native';

type ExpoNotificationsModule = typeof import('expo-notifications');

export type NotificationPreference = {
  budgetAlerts: boolean;
  weeklySummary: boolean;
  billReminders: boolean;
};

export const defaultNotificationPreference: NotificationPreference = {
  budgetAlerts: true,
  weeklySummary: true,
  billReminders: false,
};

export type NotificationPermissionState = 'unknown' | 'granted' | 'denied' | 'undetermined';

const CHANNEL_ID = 'pisopilot-reminders';
let notificationsModule: ExpoNotificationsModule | null = null;
let handlerConfigured = false;

const isExpoGo = () => Constants.appOwnership === 'expo';

const normalizePermission = (status?: string): NotificationPermissionState => {
  if (status === 'granted' || status === 'denied' || status === 'undetermined') return status;
  return 'unknown';
};

const loadNotifications = async () => {
  if (isExpoGo()) return null;

  try {
    notificationsModule ??= await import('expo-notifications');

    if (!handlerConfigured) {
      notificationsModule.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
      handlerConfigured = true;
    }

    return notificationsModule;
  } catch {
    return null;
  }
};

const ensureAndroidChannel = async (Notifications: ExpoNotificationsModule) => {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'PisoPilot reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 180, 120, 180],
    lightColor: '#0A84FF',
  });
};

export const getNotificationPermissionStatus = async (): Promise<NotificationPermissionState> => {
  try {
    const Notifications = await loadNotifications();
    if (!Notifications) return 'unknown';

    const permissions = await Notifications.getPermissionsAsync();
    return normalizePermission(permissions.status);
  } catch {
    return 'unknown';
  }
};

export const enablePisoPilotNotifications = async (): Promise<NotificationPermissionState> => {
  try {
    const Notifications = await loadNotifications();
    if (!Notifications) return 'unknown';

    let permissions = await Notifications.getPermissionsAsync();
    if (permissions.status !== 'granted') {
      permissions = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: true, allowSound: false },
      });
    }

    if (permissions.status !== 'granted') return normalizePermission(permissions.status);

    await ensureAndroidChannel(Notifications);
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'PisoPilot budget check',
        body: 'Review today\'s spending and keep your monthly budget on track.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        channelId: CHANNEL_ID,
        hour: 20,
        minute: 0,
      },
    });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Weekly money review',
        body: 'Check goals, upcoming bills, and expenses before the week starts.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        channelId: CHANNEL_ID,
        weekday: 1,
        hour: 18,
        minute: 0,
      },
    });

    return 'granted';
  } catch {
    return 'unknown';
  }
};

export const disablePisoPilotNotifications = async (): Promise<NotificationPermissionState> => {
  try {
    const Notifications = await loadNotifications();
    if (!Notifications) return 'unknown';

    await Notifications.cancelAllScheduledNotificationsAsync();
    return getNotificationPermissionStatus();
  } catch {
    return 'unknown';
  }
};
