import { api, unwrap } from './api';
import type { Budget, Dashboard, Expense, Income } from '@/types/finance';

export const financeApi = {
  dashboard: () => unwrap<Dashboard>(api.get('/dashboard')),
  expenses: () => unwrap<Expense[]>(api.get('/expenses')),
  createExpense: (payload: Omit<Expense, 'id'>) => unwrap<Expense>(api.post('/expenses', payload)),
  income: () => unwrap<Income[]>(api.get('/income')),
  createIncome: (payload: Omit<Income, 'id'>) => unwrap<Income>(api.post('/income', payload)),
  budgets: () => unwrap<Budget[]>(api.get('/budgets')),
  createBudget: (payload: Omit<Budget, 'id'>) => unwrap<Budget>(api.post('/budgets', payload)),
  monthlyReport: (month?: string) => unwrap<{ totalIncome: number; totalExpenses: number; savings: number }>(api.get('/reports/monthly', { params: { month } })),
  categoryReport: (month?: string) => unwrap<Array<{ category: string; amount: number }>>(api.get('/reports/category', { params: { month } })),
};

