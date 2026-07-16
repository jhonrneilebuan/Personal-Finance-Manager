import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { validateRequest } from '../middleware/error.middleware';
import { uploadAvatar } from '../middleware/upload.middleware';
import { changePasswordRules, updateProfileRules, updateSettingsRules } from '../validators/user.validator';

export const userRoutes = Router();

userRoutes.get('/profile', userController.profile);
userRoutes.put('/profile', updateProfileRules, validateRequest, userController.updateProfile);
userRoutes.put('/settings', updateSettingsRules, validateRequest, userController.updateSettings);
userRoutes.post('/avatar', uploadAvatar.single('avatar'), userController.uploadAvatar);
userRoutes.put('/change-password', changePasswordRules, validateRequest, userController.changePassword);
