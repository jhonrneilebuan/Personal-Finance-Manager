export type ExpenseCategorySuggestion = {
  category: string;
  confidence: number;
  reason: string;
  source: 'ai' | 'rules' | 'fallback';
};

export type AiFinanceInsight = {
  title: string;
  summary: string;
  highlights: string[];
  actionItems: string[];
  source: 'ai' | 'fallback';
};

export type PurchasePlanItem = {
  name: string;
  estimatedCost: number;
  priority?: 'need' | 'want' | 'optional';
};

export type AiSpendingPlan = {
  title: string;
  summary: string;
  recommendedBudget: {
    essentials: number;
    flexible: number;
    savings: number;
  };
  decisions: Array<{
    item: string;
    estimatedCost: number;
    decision: 'buy_now' | 'buy_later' | 'save_for' | 'skip';
    reason: string;
  }>;
  actionItems: string[];
  source: 'ai' | 'fallback';
};

export type AiBudgetRecommendation = {
  title: string;
  summary: string;
  recommendations: Array<{
    category: string;
    suggestedLimit: number;
    reason: string;
    priority: 'increase' | 'decrease' | 'keep' | 'create';
  }>;
  savingsTarget: number;
  source: 'ai' | 'fallback';
};

export type AiReceiptScan = {
  title: string;
  merchant: string;
  amount: number;
  category: string;
  transactionDate: string;
  notes: string;
  confidence: number;
  source: 'ai' | 'fallback';
};
