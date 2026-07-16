import axios from 'axios';
import { env } from '../config/env';

type ResetPasswordEmailInput = {
  to: string;
  fullName: string;
  resetUrl: string;
};

export const emailService = {
  async sendPasswordReset({ to, fullName, resetUrl }: ResetPasswordEmailInput) {
    if (!env.resendApiKey) {
      if (env.nodeEnv !== 'production') {
        console.info(`[PisoPilot] Password reset link for ${to}: ${resetUrl}`);
      }
      return { delivered: false, provider: 'development-log' as const };
    }

    await axios.post(
      'https://api.resend.com/emails',
      {
        from: env.emailFrom,
        to,
        subject: 'Reset your PisoPilot password',
        html: [
          `<p>Hello ${fullName},</p>`,
          '<p>Use the button below to reset your PisoPilot password. This link expires in 30 minutes.</p>',
          `<p><a href="${resetUrl}" style="background:#0A84FF;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:700;">Reset password</a></p>`,
          `<p>If the button does not work, open this link:</p><p>${resetUrl}</p>`,
          '<p>If you did not request this, you can ignore this email.</p>',
        ].join(''),
      },
      {
        headers: {
          Authorization: `Bearer ${env.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 12000,
      },
    );

    return { delivered: true, provider: 'resend' as const };
  },
};
