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

