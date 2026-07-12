export type User = {
  id: string;
  fullName: string;
  email: string;
  avatar?: string | null;
};

export type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  description?: string;
  receiptImage?: string;
  transactionDate: string;
};

export type Income = {
  id: string;
  source: string;
  amount: number;
  description?: string;
  transactionDate: string;
};

export type Budget = {
  id: string;
  category: string;
  limitAmount: number;
  month: string;
};

export type SavingGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string | null;
  note?: string | null;
};

export type BillReminder = {
  id: string;
  name: string;
  amount: number;
  category: string;
  dueDate: string;
  isPaid: boolean;
  note?: string | null;
};

export type RecurringTransaction = {
  id: string;
  type: 'income' | 'expense';
  title: string;
  amount: number;
  category?: string | null;
  frequency: 'weekly' | 'monthly' | 'yearly';
  nextRunDate: string;
  isActive: boolean;
  note?: string | null;
};

export type Debt = {
  id: string;
  lender: string;
  totalAmount: number;
  paidAmount: number;
  interestRate?: number | null;
  dueDate?: string | null;
  minimumPayment?: number | null;
  note?: string | null;
};

export type AllowancePlan = {
  id: string;
  name: string;
  month: string;
  dailyAmount: number;
  spendingLimit: number;
  weekdays: number[];
  note?: string | null;
};

export type AllowanceDay = {
  date: string;
  weekday: number;
  hasAllowance: boolean;
  allowanceAmount: number;
  spendingLimit: number;
  plannedSavings: number;
  isToday: boolean;
};

export type AllowanceSummary = {
  month: string;
  plans: AllowancePlan[];
  totalAllowance: number;
  plannedSpending: number;
  projectedSavings: number;
  earnedToDate: number;
  plannedSavedToDate: number;
  actualSpentToDate: number;
  actualSavingsToDate: number;
  allowanceDays: number;
  calendar: AllowanceDay[];
};

export type Dashboard = {
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  expenseByCategory: Array<{ category: string; amount: number }>;
  budgetUsage: Array<{ id: string; category: string; limitAmount: number; spentAmount: number }>;
  recentTransactions: Array<Record<string, unknown>>;
};
