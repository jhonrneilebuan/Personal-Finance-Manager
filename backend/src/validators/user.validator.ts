import { body } from 'express-validator';

export const updateProfileRules = [
  body('fullName').optional().trim().isLength({ min: 2 }).withMessage('Full name is too short'),
  body('avatar').optional({ nullable: true }).isString(),
];

export const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];

export const updateSettingsRules = [
  body('notificationsEnabled').isBoolean().withMessage('Notification setting is required'),
  body('notificationPermission').optional().isIn(['unknown', 'granted', 'denied', 'undetermined']),
];
