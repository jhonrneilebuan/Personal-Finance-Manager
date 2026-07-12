import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { endOfMonth, parseMonth } from '../utils/date';
import { HttpError } from '../utils/httpError';

const ensureOwned = async <T>(value: Promise<T | null>, message: string) => {
  const result = await value;
  if (!result) throw new HttpError(404, message);
  return result;
};

const money = (value: number) => new Prisma.Decimal(value);

export type SavingGoalInput = {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate?: Date | null;
  note?: string | null;
};

export type BillReminderInput = {
  name: string;
  amount: number;
  category: string;
  dueDate: Date;
  isPaid?: boolean;
  note?: string | null;
};

export type RecurringTransactionInput = {
  type: 'income' | 'expense';
  title: string;
  amount: number;
  category?: string | null;
  frequency: 'weekly' | 'monthly' | 'yearly';
  nextRunDate: Date;
  isActive?: boolean;
  note?: string | null;
};

export type DebtInput = {
  lender: string;
  totalAmount: number;
  paidAmount?: number;
  interestRate?: number | null;
  dueDate?: Date | null;
  minimumPayment?: number | null;
  note?: string | null;
};

export type AllowancePlanInput = {
  name: string;
  month: Date;
  dailyAmount: number;
  spendingLimit?: number;
  weekdays: number[];
  note?: string | null;
};

export const savingGoalService = {
  list: (userId: string) => prisma.savingGoal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
  create: (userId: string, data: SavingGoalInput) =>
    prisma.savingGoal.create({
      data: {
        userId,
        name: data.name,
        targetAmount: money(data.targetAmount),
        currentAmount: money(data.currentAmount ?? 0),
        targetDate: data.targetDate,
        note: data.note,
      },
    }),
  async update(id: string, userId: string, data: SavingGoalInput) {
    await ensureOwned(prisma.savingGoal.findFirst({ where: { id, userId } }), 'Savings goal not found');
    return prisma.savingGoal.update({
      where: { id },
      data: {
        name: data.name,
        targetAmount: money(data.targetAmount),
        currentAmount: money(data.currentAmount ?? 0),
        targetDate: data.targetDate,
        note: data.note,
      },
    });
  },
  async contribute(id: string, userId: string, amount: number) {
    const goal = await ensureOwned(prisma.savingGoal.findFirst({ where: { id, userId } }), 'Savings goal not found');
    return prisma.savingGoal.update({
      where: { id },
      data: { currentAmount: goal.currentAmount.plus(amount) },
    });
  },
  async delete(id: string, userId: string) {
    await ensureOwned(prisma.savingGoal.findFirst({ where: { id, userId } }), 'Savings goal not found');
    await prisma.savingGoal.delete({ where: { id } });
  },
};

export const billReminderService = {
  list: (userId: string) => prisma.billReminder.findMany({ where: { userId }, orderBy: [{ isPaid: 'asc' }, { dueDate: 'asc' }] }),
  create: (userId: string, data: BillReminderInput) =>
    prisma.billReminder.create({
      data: {
        userId,
        name: data.name,
        amount: money(data.amount),
        category: data.category,
        dueDate: data.dueDate,
        isPaid: data.isPaid ?? false,
        note: data.note,
      },
    }),
  async update(id: string, userId: string, data: BillReminderInput) {
    await ensureOwned(prisma.billReminder.findFirst({ where: { id, userId } }), 'Bill reminder not found');
    return prisma.billReminder.update({
      where: { id },
      data: {
        name: data.name,
        amount: money(data.amount),
        category: data.category,
        dueDate: data.dueDate,
        isPaid: data.isPaid ?? false,
        note: data.note,
      },
    });
  },
  async markPaid(id: string, userId: string, isPaid: boolean) {
    await ensureOwned(prisma.billReminder.findFirst({ where: { id, userId } }), 'Bill reminder not found');
    return prisma.billReminder.update({ where: { id }, data: { isPaid } });
  },
  async delete(id: string, userId: string) {
    await ensureOwned(prisma.billReminder.findFirst({ where: { id, userId } }), 'Bill reminder not found');
    await prisma.billReminder.delete({ where: { id } });
  },
};

export const recurringTransactionService = {
  list: (userId: string) => prisma.recurringTransaction.findMany({ where: { userId }, orderBy: [{ isActive: 'desc' }, { nextRunDate: 'asc' }] }),
  create: (userId: string, data: RecurringTransactionInput) =>
    prisma.recurringTransaction.create({
      data: {
        userId,
        type: data.type,
        title: data.title,
        amount: money(data.amount),
        category: data.category,
        frequency: data.frequency,
        nextRunDate: data.nextRunDate,
        isActive: data.isActive ?? true,
        note: data.note,
      },
    }),
  async update(id: string, userId: string, data: RecurringTransactionInput) {
    await ensureOwned(prisma.recurringTransaction.findFirst({ where: { id, userId } }), 'Recurring transaction not found');
    return prisma.recurringTransaction.update({
      where: { id },
      data: {
        type: data.type,
        title: data.title,
        amount: money(data.amount),
        category: data.category,
        frequency: data.frequency,
        nextRunDate: data.nextRunDate,
        isActive: data.isActive ?? true,
        note: data.note,
      },
    });
  },
  async toggle(id: string, userId: string, isActive: boolean) {
    await ensureOwned(prisma.recurringTransaction.findFirst({ where: { id, userId } }), 'Recurring transaction not found');
    return prisma.recurringTransaction.update({ where: { id }, data: { isActive } });
  },
  async delete(id: string, userId: string) {
    await ensureOwned(prisma.recurringTransaction.findFirst({ where: { id, userId } }), 'Recurring transaction not found');
    await prisma.recurringTransaction.delete({ where: { id } });
  },
};

export const debtService = {
  list: (userId: string) => prisma.debt.findMany({ where: { userId }, orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }] }),
  create: (userId: string, data: DebtInput) =>
    prisma.debt.create({
      data: {
        userId,
        lender: data.lender,
        totalAmount: money(data.totalAmount),
        paidAmount: money(data.paidAmount ?? 0),
        interestRate: data.interestRate == null ? null : new Prisma.Decimal(data.interestRate),
        dueDate: data.dueDate,
        minimumPayment: data.minimumPayment == null ? null : money(data.minimumPayment),
        note: data.note,
      },
    }),
  async update(id: string, userId: string, data: DebtInput) {
    await ensureOwned(prisma.debt.findFirst({ where: { id, userId } }), 'Debt not found');
    return prisma.debt.update({
      where: { id },
      data: {
        lender: data.lender,
        totalAmount: money(data.totalAmount),
        paidAmount: money(data.paidAmount ?? 0),
        interestRate: data.interestRate == null ? null : new Prisma.Decimal(data.interestRate),
        dueDate: data.dueDate,
        minimumPayment: data.minimumPayment == null ? null : money(data.minimumPayment),
        note: data.note,
      },
    });
  },
  async pay(id: string, userId: string, amount: number) {
    const debt = await ensureOwned(prisma.debt.findFirst({ where: { id, userId } }), 'Debt not found');
    return prisma.debt.update({
      where: { id },
      data: { paidAmount: debt.paidAmount.plus(amount) },
    });
  },
  async delete(id: string, userId: string) {
    await ensureOwned(prisma.debt.findFirst({ where: { id, userId } }), 'Debt not found');
    await prisma.debt.delete({ where: { id } });
  },
};

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

export const allowancePlanService = {
  list: (userId: string) => prisma.allowancePlan.findMany({ where: { userId }, orderBy: [{ month: 'desc' }, { createdAt: 'desc' }] }),
  create: (userId: string, data: AllowancePlanInput) =>
    prisma.allowancePlan.create({
      data: {
        userId,
        name: data.name,
        month: data.month,
        dailyAmount: money(data.dailyAmount),
        spendingLimit: money(data.spendingLimit ?? 0),
        weekdays: data.weekdays,
        note: data.note,
      },
    }),
  async update(id: string, userId: string, data: AllowancePlanInput) {
    await ensureOwned(prisma.allowancePlan.findFirst({ where: { id, userId } }), 'Allowance plan not found');
    return prisma.allowancePlan.update({
      where: { id },
      data: {
        name: data.name,
        month: data.month,
        dailyAmount: money(data.dailyAmount),
        spendingLimit: money(data.spendingLimit ?? 0),
        weekdays: data.weekdays,
        note: data.note,
      },
    });
  },
  async delete(id: string, userId: string) {
    await ensureOwned(prisma.allowancePlan.findFirst({ where: { id, userId } }), 'Allowance plan not found');
    await prisma.allowancePlan.delete({ where: { id } });
  },
  async summary(userId: string, month?: string) {
    const start = parseMonth(month);
    const end = endOfMonth(start);
    const today = startOfDay(new Date());
    const toDateEnd = today < start ? start : today > end ? end : today;

    const [plans, expenses] = await Promise.all([
      prisma.allowancePlan.findMany({
        where: { userId, month: { gte: start, lte: end } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.expense.aggregate({
        where: { userId, transactionDate: { gte: start, lte: addDays(toDateEnd, 1) } },
        _sum: { amount: true },
      }),
    ]);

    const calendar = [];
    let totalAllowance = 0;
    let plannedSpending = 0;
    let projectedSavings = 0;
    let earnedToDate = 0;
    let plannedSavedToDate = 0;
    let allowanceDays = 0;

    for (let day = startOfDay(start); day <= end; day = addDays(day, 1)) {
      const weekday = day.getDay();
      const dayPlans = plans.filter((plan) => plan.weekdays.includes(weekday));
      const allowanceAmount = dayPlans.reduce((sum, plan) => sum + Number(plan.dailyAmount), 0);
      const spendingLimit = dayPlans.reduce((sum, plan) => sum + Number(plan.spendingLimit), 0);
      const plannedSavings = Math.max(allowanceAmount - spendingLimit, 0);
      const hasAllowance = allowanceAmount > 0;
      const isPastOrToday = day <= toDateEnd;

      if (hasAllowance) allowanceDays += 1;
      totalAllowance += allowanceAmount;
      plannedSpending += spendingLimit;
      projectedSavings += plannedSavings;

      if (isPastOrToday) {
        earnedToDate += allowanceAmount;
        plannedSavedToDate += plannedSavings;
      }

      calendar.push({
        date: day.toISOString(),
        weekday,
        hasAllowance,
        allowanceAmount,
        spendingLimit,
        plannedSavings,
        isToday: day.toDateString() === today.toDateString(),
      });
    }

    const actualSpentToDate = Number(expenses._sum.amount ?? 0);

    return {
      month: start.toISOString().slice(0, 7),
      plans,
      totalAllowance,
      plannedSpending,
      projectedSavings,
      earnedToDate,
      plannedSavedToDate,
      actualSpentToDate,
      actualSavingsToDate: earnedToDate - actualSpentToDate,
      allowanceDays,
      calendar,
    };
  },
};
