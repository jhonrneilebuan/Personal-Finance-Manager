import { authService } from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';

export const authController = {
  register: asyncHandler(async (req, res) => {
    res.status(201).json({ success: true, data: await authService.register(req.body) });
  }),
  login: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await authService.login(req.body) });
  }),
  refresh: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await authService.refresh(req.body.refreshToken) });
  }),
  logout: asyncHandler(async (_req, res) => {
    res.status(204).send();
  }),
};

