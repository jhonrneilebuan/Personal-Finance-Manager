import axios from 'axios';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';

export const apiBaseUrl = Constants.expoConfig?.extra?.apiUrl ?? 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      await useAuthStore.getState().clearSession();
      router.replace('/(auth)/login');
    }
    return Promise.reject(error);
  },
);

export const unwrap = <T>(promise: Promise<{ data: { data: T } }>) => promise.then((response) => response.data.data);
