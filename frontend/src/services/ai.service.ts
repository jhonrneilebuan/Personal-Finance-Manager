import { api, unwrap } from './api';
import type {
  AiBudgetRecommendation,
  AiFinanceInsight,
  AiReceiptScan,
  AiSpendingPlan,
  ExpenseCategorySuggestion,
  PurchasePlanItem,
} from '@/types/ai';

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
  budgetRecommendation: () => unwrap<AiBudgetRecommendation>(api.get('/ai/budget-recommendation')),
  monthlySummary: (month?: string) => unwrap<AiFinanceInsight>(api.get('/ai/monthly-summary', { params: { month } })),
  spendingPlan: (payload: SpendingPlanPayload) => unwrap<AiSpendingPlan>(api.post('/ai/spending-plan', payload)),
  scanReceipt: (payload: FormData) => unwrap<AiReceiptScan>(api.post('/ai/receipt-scan', payload)),
  suggestExpenseCategory: (payload: SuggestExpenseCategoryPayload) =>
    unwrap<ExpenseCategorySuggestion>(api.post('/ai/categorize-expense', payload)),
};
