import { api, unwrap } from './api';
import type { AiFinanceInsight, AiSpendingPlan, ExpenseCategorySuggestion, PurchasePlanItem } from '@/types/ai';

type SuggestExpenseCategoryPayload = {
  title: string;
  amount?: number;
  description?: string;
};

type SpendingPlanPayload = {
  availableMoney: number;
  items: PurchasePlanItem[];
};

export const aiApi = {
  dashboardInsight: () => unwrap<AiFinanceInsight>(api.get('/ai/dashboard-insight')),
  budgetAdvice: () => unwrap<AiFinanceInsight>(api.get('/ai/budget-advice')),
  monthlySummary: (month?: string) => unwrap<AiFinanceInsight>(api.get('/ai/monthly-summary', { params: { month } })),
  spendingPlan: (payload: SpendingPlanPayload) => unwrap<AiSpendingPlan>(api.post('/ai/spending-plan', payload)),
  suggestExpenseCategory: (payload: SuggestExpenseCategoryPayload) =>
    unwrap<ExpenseCategorySuggestion>(api.post('/ai/categorize-expense', payload)),
};
