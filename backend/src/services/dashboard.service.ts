import { prisma } from '../config/prisma';
import { endOfMonth, formatDateKey, startOfMonth } from '../utils/date';

const asNumber = (value: unknown) => Number(value ?? 0);
const startOfDay = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const dayDiff = (date: Date, from: Date) => Math.ceil((startOfDay(date).getTime() - startOfDay(from).getTime()) / 86400000);

const urgencyLabel = (daysLeft: number) => {
  if (daysLeft < 0) return 'OVERDUE';
  if (daysLeft === 0) return 'DUE TODAY';
  if (daysLeft === 1) return '1 DAY LEFT';
  return `${daysLeft} DAYS LEFT`;
};

export const dashboardService = {
  async getDashboard(userId: string) {
    const start = startOfMonth();
    const end = endOfMonth();
    const today = startOfDay();
    const tomorrow = addDays(today, 1);
    const last7Start = addDays(today, -6);
    const upcomingEnd = addDays(today, 45);

    const [
      balanceIncomeTotal,
      balanceExpenseTotal,
      monthlyIncomeTotal,
      monthlyExpenseTotal,
      todayExpenseTotal,
      weekExpenseTotal,
      expenseByCategory,
      budgets,
      recentExpenses,
      recentIncome,
      goals,
      upcomingBills,
      upcomingRecurring,
      last7Expenses,
    ] = await Promise.all([
      prisma.income.aggregate({ where: { userId }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { userId }, _sum: { amount: true } }),
      prisma.income.aggregate({ where: { userId, transactionDate: { gte: start, lte: end } }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { userId, transactionDate: { gte: start, lte: end } }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { userId, transactionDate: { gte: today, lt: tomorrow } }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { userId, transactionDate: { gte: last7Start, lt: tomorrow } }, _sum: { amount: true } }),
      prisma.expense.groupBy({
        by: ['category'],
        where: { userId, transactionDate: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      prisma.budget.findMany({ where: { userId, month: { gte: start, lte: end } } }),
      prisma.expense.findMany({ where: { userId }, take: 5, orderBy: { transactionDate: 'desc' } }),
      prisma.income.findMany({ where: { userId }, take: 5, orderBy: { transactionDate: 'desc' } }),
      prisma.savingGoal.findMany({ where: { userId } }),
      prisma.billReminder.findMany({
        where: { userId, isPaid: false, dueDate: { gte: addDays(today, -14), lte: upcomingEnd } },
        orderBy: { dueDate: 'asc' },
        take: 8,
      }),
      prisma.recurringTransaction.findMany({
        where: { userId, isActive: true, nextRunDate: { gte: today, lte: upcomingEnd } },
        orderBy: { nextRunDate: 'asc' },
        take: 8,
      }),
      prisma.expense.findMany({
        where: { userId, transactionDate: { gte: last7Start, lt: tomorrow } },
        select: { amount: true, transactionDate: true },
      }),
    ]);

    const currentBalance = asNumber(balanceIncomeTotal._sum.amount) - asNumber(balanceExpenseTotal._sum.amount);
    const totalIncome = asNumber(monthlyIncomeTotal._sum.amount);
    const totalExpenses = asNumber(monthlyExpenseTotal._sum.amount);
    const categoryMap = Object.fromEntries(expenseByCategory.map((item) => [item.category, asNumber(item._sum.amount)]));
    const budgetUsage = budgets.map((budget) => ({
      id: budget.id,
      category: budget.category,
      limitAmount: asNumber(budget.limitAmount),
      spentAmount: categoryMap[budget.category] ?? 0,
    }));
    const totalBudgetLimit = budgetUsage.reduce((sum, item) => sum + item.limitAmount, 0);
    const totalBudgetSpent = budgetUsage.reduce((sum, item) => sum + item.spentAmount, 0);
    const totalGoalSaved = goals.reduce((sum, item) => sum + asNumber(item.currentAmount), 0);
    const totalGoalTarget = goals.reduce((sum, item) => sum + asNumber(item.targetAmount), 0);
    const completedGoals = goals.filter((item) => asNumber(item.currentAmount) >= asNumber(item.targetAmount)).length;
    const last7Map = new Map<string, number>();

    Array.from({ length: 7 }, (_, index) => addDays(last7Start, index)).forEach((day) => {
      last7Map.set(formatDateKey(day), 0);
    });

    last7Expenses.forEach((expense) => {
      const key = formatDateKey(expense.transactionDate);
      last7Map.set(key, (last7Map.get(key) ?? 0) + asNumber(expense.amount));
    });

    const upcoming = [
      ...upcomingBills.map((item) => {
        const daysLeft = dayDiff(item.dueDate, today);
        return {
          id: item.id,
          title: item.name,
          type: 'expense' as const,
          category: item.category,
          amount: asNumber(item.amount),
          date: formatDateKey(item.dueDate),
          daysLeft,
          badge: urgencyLabel(daysLeft),
          source: 'bill' as const,
        };
      }),
      ...upcomingRecurring.map((item) => {
        const daysLeft = dayDiff(item.nextRunDate, today);
        return {
          id: item.id,
          title: item.title,
          type: item.type === 'income' ? 'income' as const : 'expense' as const,
          category: item.category ?? item.frequency,
          amount: asNumber(item.amount),
          date: formatDateKey(item.nextRunDate),
          daysLeft,
          badge: urgencyLabel(daysLeft),
          source: 'recurring' as const,
        };
      }),
    ].sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 8);

    return {
      currentBalance,
      totalIncome,
      totalExpenses,
      savings: totalIncome - totalExpenses,
      expenseByCategory: expenseByCategory.map((item) => ({ category: item.category, amount: asNumber(item._sum.amount) })),
      budgetUsage,
      budgetSummary: {
        limitAmount: totalBudgetLimit,
        spentAmount: totalBudgetSpent,
        remainingAmount: totalBudgetLimit - totalBudgetSpent,
        progress: totalBudgetLimit > 0 ? totalBudgetSpent / totalBudgetLimit : 0,
        categories: budgetUsage.length,
      },
      goalsSummary: {
        savedAmount: totalGoalSaved,
        targetAmount: totalGoalTarget,
        remainingAmount: totalGoalTarget - totalGoalSaved,
        progress: totalGoalTarget > 0 ? totalGoalSaved / totalGoalTarget : 0,
        activeCount: goals.length - completedGoals,
        completedCount: completedGoals,
        totalCount: goals.length,
      },
      expenseSummary: {
        today: asNumber(todayExpenseTotal._sum.amount),
        last7DaysTotal: asNumber(weekExpenseTotal._sum.amount),
        month: totalExpenses,
        last7Days: Array.from(last7Map.entries()).map(([date, amount]) => ({ date, amount })),
      },
      upcoming,
      recentTransactions: [
        ...recentExpenses.map((item) => ({ ...item, type: 'expense' as const })),
        ...recentIncome.map((item) => ({ ...item, type: 'income' as const })),
      ].sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime()).slice(0, 8),
      monthlyTrend: [],
    };
  },
};
