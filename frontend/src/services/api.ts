import axios from 'axios';
import Constants from 'expo-constants';
import { useAuthStore } from '@/store/auth.store';

const apiUrl = Constants.expoConfig?.extra?.apiUrl ?? 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: apiUrl,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const unwrap = <T>(promise: Promise<{ data: { data: T } }>) => promise.then((response) => response.data.data);

