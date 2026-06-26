import { prisma } from '../config/prisma';

export type ExpenseInput = {
  title: string;
  amount: number;
  category: string;
  description?: string;
  receiptImage?: string;
  transactionDate: Date;
};

export const expenseRepository = {
  list: (userId: string) => prisma.expense.findMany({ where: { userId }, orderBy: { transactionDate: 'desc' } }),
  findOwned: (id: string, userId: string) => prisma.expense.findFirst({ where: { id, userId } }),
  create: (userId: string, data: ExpenseInput) => prisma.expense.create({ data: { ...data, userId } }),
  update: (id: string, userId: string, data: Partial<ExpenseInput>) =>
    prisma.expense.update({ where: { id }, data: { ...data, userId } }),
  delete: (id: string, _userId: string) => prisma.expense.delete({ where: { id } }),
};
