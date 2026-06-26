import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/error.middleware';
import { loginRules, refreshRules, registerRules } from '../validators/auth.validator';

export const authRoutes = Router();

authRoutes.post('/register', registerRules, validateRequest, authController.register);
authRoutes.post('/login', loginRules, validateRequest, authController.login);
authRoutes.post('/refresh', refreshRules, validateRequest, authController.refresh);
authRoutes.post('/logout', authController.logout);

