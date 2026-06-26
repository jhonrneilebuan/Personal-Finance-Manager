import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { endOfMonth, parseMonth } from '../utils/date';

const money = (value: Prisma.Decimal | number | null | undefined) => Number(value ?? 0);

export const reportService = {
  async monthly(userId: string, month?: string) {
    const start = parseMonth(month);
    const end = endOfMonth(start);

    const [income, expenses] = await Promise.all([
      prisma.income.aggregate({
        where: { userId, transactionDate: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { userId, transactionDate: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = money(income._sum.amount);
    const totalExpenses = money(expenses._sum.amount);
    return {
      month: start.toISOString().slice(0, 7),
      totalIncome,
      totalExpenses,
      savings: totalIncome - totalExpenses,
    };
  },

  async category(userId: string, month?: string) {
    const start = parseMonth(month);
    const end = endOfMonth(start);

    const grouped = await prisma.expense.groupBy({
      by: ['category'],
      where: { userId, transactionDate: { gte: start, lte: end } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
    });

    return grouped.map((item) => ({ category: item.category, amount: money(item._sum.amount) }));
  },
};

