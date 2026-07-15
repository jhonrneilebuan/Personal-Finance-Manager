import { api, unwrap } from './api';
import type {
  AllowancePlan,
  AllowanceSummary,
  BillReminder,
  Budget,
  Dashboard,
  Debt,
  ExportedReport,
  Expense,
  Income,
  RecurringTransaction,
  SavingGoal,
} from '@/types/finance';

export const financeApi = {
  dashboard: () => unwrap<Dashboard>(api.get('/dashboard')),
  expenses: () => unwrap<Expense[]>(api.get('/expenses')),
  createExpense: (payload: Omit<Expense, 'id'>) => unwrap<Expense>(api.post('/expenses', payload)),
  income: () => unwrap<Income[]>(api.get('/income')),
  createIncome: (payload: Omit<Income, 'id'>) => unwrap<Income>(api.post('/income', payload)),
  budgets: () => unwrap<Budget[]>(api.get('/budgets')),
  createBudget: (payload: Omit<Budget, 'id'>) => unwrap<Budget>(api.post('/budgets', payload)),
  monthlyReport: (month?: string) => unwrap<{ totalIncome: number; totalExpenses: number; savings: number; transactionCount: number }>(api.get('/reports/monthly', { params: { month } })),
  categoryReport: (month?: string) => unwrap<Array<{ category: string; amount: number }>>(api.get('/reports/category', { params: { month } })),
  exportReport: (format: 'csv' | 'pdf', month?: string) =>
    unwrap<ExportedReport>(api.get('/reports/export', { params: { format, month, base64: true } })),

  goals: () => unwrap<SavingGoal[]>(api.get('/goals')),
  createGoal: (payload: Omit<SavingGoal, 'id'>) => unwrap<SavingGoal>(api.post('/goals', payload)),
  updateGoal: (id: string, payload: Omit<SavingGoal, 'id'>) => unwrap<SavingGoal>(api.put(`/goals/${id}`, payload)),
  contributeGoal: (id: string, amount: number) => unwrap<SavingGoal>(api.post(`/goals/${id}/contribute`, { amount })),
  deleteGoal: (id: string) => api.delete(`/goals/${id}`).then(() => undefined),

  bills: () => unwrap<BillReminder[]>(api.get('/bills')),
  createBill: (payload: Omit<BillReminder, 'id'>) => unwrap<BillReminder>(api.post('/bills', payload)),
  updateBill: (id: string, payload: Omit<BillReminder, 'id'>) => unwrap<BillReminder>(api.put(`/bills/${id}`, payload)),
  markBillPaid: (id: string, isPaid: boolean) => unwrap<BillReminder>(api.patch(`/bills/${id}/paid`, { isPaid })),
  deleteBill: (id: string) => api.delete(`/bills/${id}`).then(() => undefined),

  recurring: () => unwrap<RecurringTransaction[]>(api.get('/recurring')),
  createRecurring: (payload: Omit<RecurringTransaction, 'id'>) => unwrap<RecurringTransaction>(api.post('/recurring', payload)),
  updateRecurring: (id: string, payload: Omit<RecurringTransaction, 'id'>) => unwrap<RecurringTransaction>(api.put(`/recurring/${id}`, payload)),
  toggleRecurring: (id: string, isActive: boolean) => unwrap<RecurringTransaction>(api.patch(`/recurring/${id}/active`, { isActive })),
  deleteRecurring: (id: string) => api.delete(`/recurring/${id}`).then(() => undefined),

  debts: () => unwrap<Debt[]>(api.get('/debts')),
  createDebt: (payload: Omit<Debt, 'id'>) => unwrap<Debt>(api.post('/debts', payload)),
  updateDebt: (id: string, payload: Omit<Debt, 'id'>) => unwrap<Debt>(api.put(`/debts/${id}`, payload)),
  payDebt: (id: string, amount: number) => unwrap<Debt>(api.post(`/debts/${id}/pay`, { amount })),
  deleteDebt: (id: string) => api.delete(`/debts/${id}`).then(() => undefined),

  allowancePlans: () => unwrap<AllowancePlan[]>(api.get('/allowance')),
  allowanceSummary: (month?: string) => unwrap<AllowanceSummary>(api.get('/allowance/summary', { params: { month } })),
  createAllowancePlan: (payload: Omit<AllowancePlan, 'id'>) => unwrap<AllowancePlan>(api.post('/allowance', payload)),
  updateAllowancePlan: (id: string, payload: Omit<AllowancePlan, 'id'>) => unwrap<AllowancePlan>(api.put(`/allowance/${id}`, payload)),
  deleteAllowancePlan: (id: string) => api.delete(`/allowance/${id}`).then(() => undefined),
};
