import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { validateRequest } from '../middleware/error.middleware';
import { changePasswordRules, updateProfileRules } from '../validators/user.validator';

export const userRoutes = Router();

userRoutes.get('/profile', userController.profile);
userRoutes.put('/profile', updateProfileRules, validateRequest, userController.updateProfile);
userRoutes.put('/change-password', changePasswordRules, validateRequest, userController.changePassword);

