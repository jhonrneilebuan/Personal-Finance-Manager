import { body } from 'express-validator';

export const registerRules = [
  body('fullName').trim().isLength({ min: 2 }).withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

export const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const refreshRules = [body('refreshToken').notEmpty().withMessage('Refresh token is required')];

