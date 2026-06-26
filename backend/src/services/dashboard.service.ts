import { prisma } from '../config/prisma';
import { endOfMonth, startOfMonth } from '../utils/date';

const asNumber = (value: unknown) => Number(value ?? 0);

export const dashboardService = {
  async getDashboard(userId: string) {
    const start = startOfMonth();
    const end = endOfMonth();

    const [balanceIncomeTotal, balanceExpenseTotal, monthlyIncomeTotal, monthlyExpenseTotal, expenseByCategory, budgets, recentExpenses, recentIncome] = await Promise.all([
      prisma.income.aggregate({ where: { userId }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { userId }, _sum: { amount: true } }),
      prisma.income.aggregate({ where: { userId, transactionDate: { gte: start, lte: end } }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { userId, transactionDate: { gte: start, lte: end } }, _sum: { amount: true } }),
      prisma.expense.groupBy({
        by: ['category'],
        where: { userId, transactionDate: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      prisma.budget.findMany({ where: { userId, month: start } }),
      prisma.expense.findMany({ where: { userId }, take: 5, orderBy: { transactionDate: 'desc' } }),
      prisma.income.findMany({ where: { userId }, take: 5, orderBy: { transactionDate: 'desc' } }),
    ]);

    const currentBalance = asNumber(balanceIncomeTotal._sum.amount) - asNumber(balanceExpenseTotal._sum.amount);
    const totalIncome = asNumber(monthlyIncomeTotal._sum.amount);
    const totalExpenses = asNumber(monthlyExpenseTotal._sum.amount);
    const categoryMap = Object.fromEntries(expenseByCategory.map((item) => [item.category, asNumber(item._sum.amount)]));

    return {
      currentBalance,
      totalIncome,
      totalExpenses,
      savings: totalIncome - totalExpenses,
      expenseByCategory: expenseByCategory.map((item) => ({ category: item.category, amount: asNumber(item._sum.amount) })),
      budgetUsage: budgets.map((budget) => ({
        id: budget.id,
        category: budget.category,
        limitAmount: asNumber(budget.limitAmount),
        spentAmount: categoryMap[budget.category] ?? 0,
      })),
      recentTransactions: [
        ...recentExpenses.map((item) => ({ ...item, type: 'expense' as const })),
        ...recentIncome.map((item) => ({ ...item, type: 'income' as const })),
      ].sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime()).slice(0, 8),
      monthlyTrend: [],
    };
  },
};
