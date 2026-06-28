import axios from 'axios';
import { env } from '../config/env';

const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Utilities',
  'Housing',
  'Healthcare',
  'Shopping',
  'Entertainment',
  'Education',
  'Debt',
  'Savings',
  'Subscription',
  'Personal',
  'Other',
] as const;

type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

type SuggestCategoryInput = {
  title: string;
  amount?: number;
  description?: string;
};

export type ExpenseCategorySuggestion = {
  category: ExpenseCategory;
  confidence: number;
  reason: string;
  source: 'ai' | 'rules' | 'fallback';
};

const keywordRules: Array<{ category: ExpenseCategory; keywords: string[] }> = [
  { category: 'Food', keywords: ['jollibee', 'mcdo', 'mcdonald', 'kfc', 'chowking', 'restaurant', 'food', 'meal', 'coffee'] },
  { category: 'Transportation', keywords: ['grab', 'angkas', 'joyride', 'taxi', 'gas', 'fuel', 'fare', 'bus', 'jeep', 'tricycle'] },
  { category: 'Utilities', keywords: ['meralco', 'maynilad', 'internet', 'wifi', 'water', 'electric', 'utility', 'bill'] },
  { category: 'Housing', keywords: ['rent', 'apartment', 'condo', 'mortgage'] },
  { category: 'Healthcare', keywords: ['doctor', 'medicine', 'pharmacy', 'hospital', 'clinic'] },
  { category: 'Shopping', keywords: ['shopee', 'lazada', 'mall', 'clothes', 'clothing', 'grocery'] },
  { category: 'Entertainment', keywords: ['netflix', 'spotify', 'movie', 'cinema', 'game'] },
  { category: 'Education', keywords: ['tuition', 'school', 'book', 'course'] },
  { category: 'Debt', keywords: ['loan', 'credit card', 'debt', 'payment'] },
  { category: 'Savings', keywords: ['savings', 'investment', 'deposit'] },
  { category: 'Subscription', keywords: ['subscription', 'premium', 'monthly plan'] },
];

const isExpenseCategory = (value: string): value is ExpenseCategory =>
  EXPENSE_CATEGORIES.includes(value as ExpenseCategory);

const clampConfidence = (value: unknown) => {
  const numberValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numberValue)) return 0.6;
  return Math.min(1, Math.max(0, numberValue));
};

const buildTransactionText = ({ title, amount, description }: SuggestCategoryInput) =>
  [
    `Title: ${title}`,
    typeof amount === 'number' && Number.isFinite(amount) ? `Amount: PHP ${amount}` : null,
    description ? `Description: ${description}` : null,
  ].filter(Boolean).join('\n');

const suggestWithRules = (input: SuggestCategoryInput): ExpenseCategorySuggestion | null => {
  const normalized = `${input.title} ${input.description ?? ''}`.toLowerCase();
  const match = keywordRules.find((rule) => rule.keywords.some((keyword) => normalized.includes(keyword)));

  if (!match) return null;

  return {
    category: match.category,
    confidence: 0.72,
    reason: `Matched a common keyword for ${match.category}.`,
    source: 'rules',
  };
};

const extractOutputText = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') return null;
  const root = payload as { output_text?: unknown; output?: unknown };

  if (typeof root.output_text === 'string') return root.output_text;
  if (!Array.isArray(root.output)) return null;

  for (const outputItem of root.output) {
    if (!outputItem || typeof outputItem !== 'object') continue;
    const content = (outputItem as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;

    for (const contentItem of content) {
      if (!contentItem || typeof contentItem !== 'object') continue;
      const text = (contentItem as { text?: unknown }).text;
      if (typeof text === 'string') return text;
    }
  }

  return null;
};

const parseAiSuggestion = (text: string): ExpenseCategorySuggestion => {
  const parsed = JSON.parse(text) as { category?: unknown; confidence?: unknown; reason?: unknown };
  const category = typeof parsed.category === 'string' && isExpenseCategory(parsed.category) ? parsed.category : 'Other';

  return {
    category,
    confidence: clampConfidence(parsed.confidence),
    reason: typeof parsed.reason === 'string' && parsed.reason.trim() ? parsed.reason.trim() : 'AI suggested this category from the transaction details.',
    source: 'ai',
  };
};

export const aiCategorizationService = {
  async suggestCategory(input: SuggestCategoryInput): Promise<ExpenseCategorySuggestion> {
    const ruleSuggestion = suggestWithRules(input);

    if (!env.openAiApiKey) {
      return ruleSuggestion ?? {
        category: 'Other',
        confidence: 0.3,
        reason: 'OpenAI API key is not configured, so PesoPilot used the default category.',
        source: 'fallback',
      };
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/responses',
        {
          model: env.openAiModel,
          input: [
            {
              role: 'system',
              content: [
                'You categorize personal finance expenses for a Philippine peso budgeting app.',
                `Use one category only from this list: ${EXPENSE_CATEGORIES.join(', ')}.`,
                'Return a short reason that is helpful to the user.',
              ].join(' '),
            },
            { role: 'user', content: buildTransactionText(input) },
          ],
          max_output_tokens: 180,
          text: {
            format: {
              type: 'json_schema',
              name: 'expense_category_suggestion',
              strict: true,
              schema: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  category: { type: 'string', enum: EXPENSE_CATEGORIES },
                  confidence: { type: 'number', minimum: 0, maximum: 1 },
                  reason: { type: 'string' },
                },
                required: ['category', 'confidence', 'reason'],
              },
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${env.openAiApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 12000,
        },
      );

      const outputText = extractOutputText(response.data);
      if (!outputText) throw new Error('OpenAI response did not include text output');
      return parseAiSuggestion(outputText);
    } catch (error) {
      if (env.nodeEnv !== 'production') {
        console.warn('AI categorization unavailable, using local fallback.');
      }

      return ruleSuggestion ?? {
        category: 'Other',
        confidence: 0.35,
        reason: 'AI was unavailable, so PesoPilot used a safe default category.',
        source: 'fallback',
      };
    }
  },

  async explainSuggestion(input: SuggestCategoryInput, category: string) {
    return `PesoPilot suggested ${category} based on: ${buildTransactionText(input)}`;
  },
};
