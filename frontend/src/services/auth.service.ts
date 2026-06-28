import { api, unwrap } from './api';
import type { User } from '@/types/finance';

type AuthResponse = { user: User; accessToken: string; refreshToken: string };

export const authApi = {
  login: (payload: { email: string; password: string }) => unwrap<AuthResponse>(api.post('/auth/login', payload)),
  register: (payload: { fullName: string; email: string; password: string }) =>
    unwrap<AuthResponse>(api.post('/auth/register', payload)),
  profile: () => unwrap<User>(api.get('/user/profile')),
  updateProfile: (payload: { fullName: string; avatar?: string | null }) => unwrap<User>(api.put('/user/profile', payload)),
  changePassword: (payload: { currentPassword: string; newPassword: string }) => api.put('/user/change-password', payload),
  forgotPassword: async (_email: string) => ({ ok: true }),
};
