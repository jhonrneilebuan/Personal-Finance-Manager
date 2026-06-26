import { prisma } from '../config/prisma';

export type IncomeInput = {
  source: string;
  amount: number;
  description?: string;
  transactionDate: Date;
};

export const incomeRepository = {
  list: (userId: string) => prisma.income.findMany({ where: { userId }, orderBy: { transactionDate: 'desc' } }),
  findOwned: (id: string, userId: string) => prisma.income.findFirst({ where: { id, userId } }),
  create: (userId: string, data: IncomeInput) => prisma.income.create({ data: { ...data, userId } }),
  update: (id: string, userId: string, data: Partial<IncomeInput>) =>
    prisma.income.update({ where: { id }, data: { ...data, userId } }),
  delete: (id: string, _userId: string) => prisma.income.delete({ where: { id } }),
};
