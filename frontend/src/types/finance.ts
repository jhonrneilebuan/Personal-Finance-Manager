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

export type Dashboard = {
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  expenseByCategory: Array<{ category: string; amount: number }>;
  budgetUsage: Array<{ id: string; category: string; limitAmount: number; spentAmount: number }>;
  recentTransactions: Array<Record<string, unknown>>;
};

