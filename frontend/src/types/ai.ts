export type ExpenseCategorySuggestion = {
  category: string;
  confidence: number;
  reason: string;
  source: 'ai' | 'rules' | 'fallback';
};
