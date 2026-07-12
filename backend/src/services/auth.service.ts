import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/user.repository';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { HttpError } from '../utils/httpError';

const sanitizeUser = <T extends { password: string }>(user: T) => {
  const { password: _password, ...safeUser } = user;
  return safeUser;
};

export const authService = {
  async register(data: { fullName: string; email: string; password: string }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new HttpError(409, 'Email is already registered');

    const password = await bcrypt.hash(data.password, 12);
    const user = await userRepository.create({ ...data, email: data.email.toLowerCase(), password });
    const payload = { userId: user.id, email: user.email };

    return {
      user: sanitizeUser(user),
      accessToken: createAccessToken(payload),
      refreshToken: createRefreshToken(payload),
    };
  },

  async login(data: { email: string; password: string }) {
    const user = await userRepository.findByEmail(data.email.toLowerCase());
    if (!user) throw new HttpError(401, 'Invalid email or password');

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) throw new HttpError(401, 'Invalid email or password');

    const payload = { userId: user.id, email: user.email };
    return {
      user: sanitizeUser(user),
      accessToken: createAccessToken(payload),
      refreshToken: createRefreshToken(payload),
    };
  },

  async refresh(refreshToken: string) {
    const payload = (() => {
      try {
        return verifyRefreshToken(refreshToken);
      } catch {
        throw new HttpError(401, 'Invalid refresh token');
      }
    })();

    const user = await userRepository.findById(payload.userId);
    if (!user) throw new HttpError(401, 'Session expired. Please log in again.');

    const tokenPayload = { userId: user.id, email: user.email };
    return {
      accessToken: createAccessToken(tokenPayload),
      refreshToken: createRefreshToken(tokenPayload),
    };
  },
};
