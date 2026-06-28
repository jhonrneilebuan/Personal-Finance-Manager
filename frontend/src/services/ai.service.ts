import { api, unwrap } from './api';
import type { ExpenseCategorySuggestion } from '@/types/ai';

type SuggestExpenseCategoryPayload = {
  title: string;
  amount?: number;
  description?: string;
};

export const aiApi = {
  suggestExpenseCategory: (payload: SuggestExpenseCategoryPayload) =>
    unwrap<ExpenseCategorySuggestion>(api.post('/ai/categorize-expense', payload)),
};
