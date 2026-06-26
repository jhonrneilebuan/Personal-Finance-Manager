import { create } from 'zustand';

type SettingsState = {
  isDarkMode: boolean;
  currency: string;
  notificationsEnabled: boolean;
  setDarkMode: (enabled: boolean) => void;
  setCurrency: (currency: string) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  isDarkMode: false,
  currency: 'PHP',
  notificationsEnabled: true,
  setDarkMode: (isDarkMode) => set({ isDarkMode }),
  setCurrency: (currency) => set({ currency }),
  setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
}));

