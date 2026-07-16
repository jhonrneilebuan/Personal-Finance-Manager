import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { prisma } from '../config/prisma';
import { userRepository } from '../repositories/user.repository';
import { emailService } from './email.service';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { HttpError } from '../utils/httpError';
import { env } from '../config/env';

const sanitizeUser = <T extends { password: string }>(user: T) => {
  const { password: _password, ...safeUser } = user;
  return safeUser;
};

const hashResetToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

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

  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email.toLowerCase());

    if (!user) {
      return { message: 'If that email exists, a reset link has been sent.' };
    }

    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
      data: { usedAt: new Date() },
    });

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(token);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const resetUrl = `${env.appUrl.replace(/\/$/, '')}/reset-password?token=${token}`;
    const delivery = await emailService.sendPasswordReset({ to: user.email, fullName: user.fullName, resetUrl });

    return {
      message: 'If that email exists, a reset link has been sent.',
      delivery,
      resetUrl: env.nodeEnv === 'production' ? undefined : resetUrl,
    };
  },

  async resetPassword(data: { token: string; password: string }) {
    const tokenHash = hashResetToken(data.token);
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw new HttpError(400, 'Reset link is invalid or expired');
    }

    const password = await bcrypt.hash(data.password, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: resetToken.userId }, data: { password } }),
      prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
    ]);

    return { message: 'Password has been reset. You can log in with your new password.' };
  },
};
