import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';
import type { User } from '@/types/finance';

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  setSession: (session: { user: User; accessToken: string; refreshToken: string }) => Promise<void>;
  hydrate: () => Promise<void>;
  logout: () => Promise<void>;
};

const ACCESS_TOKEN_KEY = 'pesopilot.accessToken';
const REFRESH_TOKEN_KEY = 'pesopilot.refreshToken';

const webStorage = () => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  return window.localStorage;
};

const tokenStorage = {
  async getItem(key: string) {
    const storage = webStorage();
    if (storage) return storage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string) {
    const storage = webStorage();
    if (storage) {
      storage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async deleteItem(key: string) {
    const storage = webStorage();
    if (storage) {
      storage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isHydrated: false,
  async setSession(session) {
    await tokenStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
    await tokenStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
    set(session);
  },
  async hydrate() {
    const [accessToken, refreshToken] = await Promise.all([
      tokenStorage.getItem(ACCESS_TOKEN_KEY),
      tokenStorage.getItem(REFRESH_TOKEN_KEY),
    ]);
    set({ accessToken, refreshToken, isHydrated: true });
  },
  async logout() {
    await Promise.all([tokenStorage.deleteItem(ACCESS_TOKEN_KEY), tokenStorage.deleteItem(REFRESH_TOKEN_KEY)]);
    set({ user: null, accessToken: null, refreshToken: null });
  },
}));
