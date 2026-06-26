import { prisma } from '../config/prisma';

export type BudgetInput = {
  category: string;
  limitAmount: number;
  month: Date;
};

export const budgetRepository = {
  list: (userId: string) => prisma.budget.findMany({ where: { userId }, orderBy: { month: 'desc' } }),
  findOwned: (id: string, userId: string) => prisma.budget.findFirst({ where: { id, userId } }),
  create: (userId: string, data: BudgetInput) => prisma.budget.create({ data: { ...data, userId } }),
  update: (id: string, userId: string, data: Partial<BudgetInput>) =>
    prisma.budget.update({ where: { id }, data: { ...data, userId } }),
  delete: (id: string, _userId: string) => prisma.budget.delete({ where: { id } }),
};
