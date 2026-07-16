import { api, unwrap } from './api';
import type { User } from '@/types/finance';

type AuthResponse = { user: User; accessToken: string; refreshToken: string };
type PasswordResetResponse = { message: string; resetUrl?: string; delivery?: { delivered: boolean; provider: string } };

export const authApi = {
  login: (payload: { email: string; password: string }) => unwrap<AuthResponse>(api.post('/auth/login', payload)),
  register: (payload: { fullName: string; email: string; password: string }) =>
    unwrap<AuthResponse>(api.post('/auth/register', payload)),
  profile: () => unwrap<User>(api.get('/user/profile')),
  updateProfile: (payload: { fullName: string; avatar?: string | null }) => unwrap<User>(api.put('/user/profile', payload)),
  updateSettings: (payload: { notificationsEnabled: boolean; notificationPermission?: string }) => unwrap<User>(api.put('/user/settings', payload)),
  uploadAvatar: (payload: FormData) => unwrap<User>(api.post('/user/avatar', payload, { headers: { 'Content-Type': 'multipart/form-data' } })),
  changePassword: (payload: { currentPassword: string; newPassword: string }) => api.put('/user/change-password', payload),
  forgotPassword: (email: string) => unwrap<PasswordResetResponse>(api.post('/auth/forgot-password', { email })),
  resetPassword: (payload: { token: string; password: string }) => unwrap<{ message: string }>(api.post('/auth/reset-password', payload)),
};
