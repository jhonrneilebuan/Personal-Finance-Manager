import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma';
import { userRepository } from '../repositories/user.repository';
import { asyncHandler } from '../utils/asyncHandler';
import { HttpError } from '../utils/httpError';

const safeUser = <T extends { password: string }>(user: T) => {
  const { password: _password, ...rest } = user;
  return rest;
};

export const userController = {
  profile: asyncHandler(async (req, res) => {
    const user = await userRepository.findById(req.user!.userId);
    if (!user) throw new HttpError(404, 'User not found');
    res.json({ success: true, data: safeUser(user) });
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const user = await userRepository.update(req.user!.userId, req.body);
    res.json({ success: true, data: safeUser(user) });
  }),

  changePassword: asyncHandler(async (req, res) => {
    const user = await userRepository.findById(req.user!.userId);
    if (!user) throw new HttpError(404, 'User not found');
    const isValid = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!isValid) throw new HttpError(400, 'Current password is incorrect');
    const password = await bcrypt.hash(req.body.newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { password } });
    res.status(204).send();
  }),
};
