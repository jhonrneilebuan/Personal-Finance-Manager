import { prisma } from '../config/prisma';

export const userRepository = {
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),
  findById: (id: string) => prisma.user.findUnique({ where: { id } }),
  create: (data: { fullName: string; email: string; password: string }) => prisma.user.create({ data }),
  update: (id: string, data: { fullName?: string; avatar?: string | null; notificationsEnabled?: boolean; notificationPermission?: string }) =>
    prisma.user.update({ where: { id }, data }),
};
