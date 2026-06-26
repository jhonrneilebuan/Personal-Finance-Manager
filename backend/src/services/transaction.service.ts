import { budgetRepository, type BudgetInput } from '../repositories/budget.repository';
import { expenseRepository, type ExpenseInput } from '../repositories/expense.repository';
import { incomeRepository, type IncomeInput } from '../repositories/income.repository';
import { HttpError } from '../utils/httpError';

const ensureFound = async <T>(value: Promise<T | null>, message: string) => {
  const result = await value;
  if (!result) throw new HttpError(404, message);
  return result;
};

export const expenseService = {
  list: expenseRepository.list,
  create: expenseRepository.create,
  async update(id: string, userId: string, data: Partial<ExpenseInput>) {
    await ensureFound(expenseRepository.findOwned(id, userId), 'Expense not found');
    return expenseRepository.update(id, userId, data);
  },
  async delete(id: string, userId: string) {
    await ensureFound(expenseRepository.findOwned(id, userId), 'Expense not found');
    await expenseRepository.delete(id, userId);
  },
};

export const incomeService = {
  list: incomeRepository.list,
  create: incomeRepository.create,
  async update(id: string, userId: string, data: Partial<IncomeInput>) {
    await ensureFound(incomeRepository.findOwned(id, userId), 'Income not found');
    return incomeRepository.update(id, userId, data);
  },
  async delete(id: string, userId: string) {
    await ensureFound(incomeRepository.findOwned(id, userId), 'Income not found');
    await incomeRepository.delete(id, userId);
  },
};

export const budgetService = {
  list: budgetRepository.list,
  create: budgetRepository.create,
  async update(id: string, userId: string, data: Partial<BudgetInput>) {
    await ensureFound(budgetRepository.findOwned(id, userId), 'Budget not found');
    return budgetRepository.update(id, userId, data);
  },
  async delete(id: string, userId: string) {
    await ensureFound(budgetRepository.findOwned(id, userId), 'Budget not found');
    await budgetRepository.delete(id, userId);
  },
};

