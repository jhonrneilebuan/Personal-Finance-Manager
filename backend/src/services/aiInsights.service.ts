import axios from 'axios';
import { env } from '../config/env';

type DashboardSnapshot = {
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  expenseByCategory: Array<{ category: string; amount: number }>;
  budgetUsage: Array<{ category: string; limitAmount: number; spentAmount: number }>;
};

type MonthlyReportSnapshot = {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  savings: number;
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

export type SpendingPlanInput = {
  availableMoney: number;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  currentBalance?: number;
  items: PurchasePlanItem[];
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

const insightSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string' },
    summary: { type: 'string' },
    highlights: { type: 'array', items: { type: 'string' } },
    actionItems: { type: 'array', items: { type: 'string' } },
  },
  required: ['title', 'summary', 'highlights', 'actionItems'],
};

const spendingPlanSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string' },
    summary: { type: 'string' },
    recommendedBudget: {
      type: 'object',
      additionalProperties: false,
      properties: {
        essentials: { type: 'number' },
        flexible: { type: 'number' },
        savings: { type: 'number' },
      },
      required: ['essentials', 'flexible', 'savings'],
    },
    decisions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          item: { type: 'string' },
          estimatedCost: { type: 'number' },
          decision: { type: 'string', enum: ['buy_now', 'buy_later', 'save_for', 'skip'] },
          reason: { type: 'string' },
        },
        required: ['item', 'estimatedCost', 'decision', 'reason'],
      },
    },
    actionItems: { type: 'array', items: { type: 'string' } },
  },
  required: ['title', 'summary', 'recommendedBudget', 'decisions', 'actionItems'],
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

const sanitizeInsight = (value: unknown): AiFinanceInsight | null => {
  if (!value || typeof value !== 'object') return null;
  const insight = value as Partial<AiFinanceInsight>;

  if (typeof insight.title !== 'string' || typeof insight.summary !== 'string') return null;
  if (!Array.isArray(insight.highlights) || !Array.isArray(insight.actionItems)) return null;

  return {
    title: insight.title.slice(0, 80),
    summary: insight.summary.slice(0, 260),
    highlights: insight.highlights.filter((item): item is string => typeof item === 'string').slice(0, 3),
    actionItems: insight.actionItems.filter((item): item is string => typeof item === 'string').slice(0, 3),
    source: 'ai',
  };
};

const sanitizeSpendingPlan = (value: unknown): AiSpendingPlan | null => {
  if (!value || typeof value !== 'object') return null;
  const plan = value as Partial<AiSpendingPlan>;

  if (typeof plan.title !== 'string' || typeof plan.summary !== 'string') return null;
  if (!plan.recommendedBudget || typeof plan.recommendedBudget !== 'object') return null;
  if (!Array.isArray(plan.decisions) || !Array.isArray(plan.actionItems)) return null;

  const budget = plan.recommendedBudget as AiSpendingPlan['recommendedBudget'];
  const decisions = plan.decisions
    .filter((item): item is AiSpendingPlan['decisions'][number] =>
      item &&
      typeof item === 'object' &&
      typeof item.item === 'string' &&
      typeof item.estimatedCost === 'number' &&
      ['buy_now', 'buy_later', 'save_for', 'skip'].includes(item.decision) &&
      typeof item.reason === 'string',
    )
    .slice(0, 12);

  return {
    title: plan.title.slice(0, 90),
    summary: plan.summary.slice(0, 280),
    recommendedBudget: {
      essentials: Number(budget.essentials ?? 0),
      flexible: Number(budget.flexible ?? 0),
      savings: Number(budget.savings ?? 0),
    },
    decisions,
    actionItems: plan.actionItems.filter((item): item is string => typeof item === 'string').slice(0, 4),
    source: 'ai',
  };
};

const requestInsight = async (task: string, snapshot: unknown): Promise<AiFinanceInsight | null> => {
  if (!env.openAiApiKey) return null;

  const response = await axios.post(
    'https://api.openai.com/v1/responses',
    {
      model: env.openAiModel,
      input: [
        {
          role: 'system',
          content: [
            'You are PesoPilot, a concise personal finance coach for a Philippine peso budgeting app.',
            'Give practical, safe budgeting guidance based only on the provided numbers.',
            'Keep the tone direct, helpful, and mobile-friendly.',
          ].join(' '),
        },
        {
          role: 'user',
          content: `${task}\n\nData:\n${JSON.stringify(snapshot, null, 2)}`,
        },
      ],
      max_output_tokens: 420,
      text: {
        format: {
          type: 'json_schema',
          name: 'finance_insight',
          strict: true,
          schema: insightSchema,
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
  if (!outputText) return null;
  return sanitizeInsight(JSON.parse(outputText));
};

const requestSpendingPlan = async (input: SpendingPlanInput): Promise<AiSpendingPlan | null> => {
  if (!env.openAiApiKey) return null;

  const response = await axios.post(
    'https://api.openai.com/v1/responses',
    {
      model: env.openAiModel,
      input: [
        {
          role: 'system',
          content: [
            'You are PesoPilot, a practical spending planner for a Philippine peso personal finance app.',
            'Help the user decide what to buy first, what to delay, what to skip, and how to split money.',
            'Prioritize essentials, bills, health, school, transportation, and emergency savings before wants.',
            'Never encourage debt or spending all available money.',
          ].join(' '),
        },
        {
          role: 'user',
          content: `Create a spending priority plan for these items.\n\nData:\n${JSON.stringify(input, null, 2)}`,
        },
      ],
      max_output_tokens: 560,
      text: {
        format: {
          type: 'json_schema',
          name: 'spending_priority_plan',
          strict: true,
          schema: spendingPlanSchema,
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
  if (!outputText) return null;
  return sanitizeSpendingPlan(JSON.parse(outputText));
};

const topCategory = (categories: Array<{ category: string; amount: number }>) =>
  [...categories].sort((a, b) => b.amount - a.amount)[0];

const needKeywords = ['rice', 'food', 'grocery', 'rent', 'bill', 'electric', 'water', 'medicine', 'school', 'tuition', 'fare', 'load', 'internet'];

const isNeed = (item: PurchasePlanItem) => {
  const name = item.name.toLowerCase();
  return item.priority === 'need' || needKeywords.some((keyword) => name.includes(keyword));
};

const fallbackDashboardInsight = (dashboard: DashboardSnapshot): AiFinanceInsight => {
  const savingsRate = dashboard.totalIncome > 0 ? Math.round((dashboard.savings / dashboard.totalIncome) * 100) : 0;
  const top = topCategory(dashboard.expenseByCategory);

  return {
    title: dashboard.savings >= 0 ? 'Your month is staying positive' : 'Your expenses are ahead this month',
    summary: dashboard.savings >= 0
      ? `You saved about ${savingsRate}% of monthly income so far. Keep watching your largest category to protect that balance.`
      : 'Your expenses are higher than your income this month. Focus on the biggest category first.',
    highlights: [
      `Income: PHP ${dashboard.totalIncome.toLocaleString()}`,
      `Expenses: PHP ${dashboard.totalExpenses.toLocaleString()}`,
      top ? `Top spending: ${top.category} at PHP ${top.amount.toLocaleString()}` : 'No category spending yet',
    ],
    actionItems: [
      top ? `Review ${top.category} before adding new spending.` : 'Add expenses with categories to unlock stronger insights.',
      dashboard.savings < 0 ? 'Pause non-essential purchases until income catches up.' : 'Move part of the savings into a fixed goal.',
      'Update expenses daily so the dashboard stays accurate.',
    ],
    source: 'fallback',
  };
};

const fallbackBudgetAdvice = (dashboard: DashboardSnapshot): AiFinanceInsight => {
  const overLimit = dashboard.budgetUsage.filter((budget) => budget.spentAmount > budget.limitAmount);
  const nearLimit = dashboard.budgetUsage.filter((budget) => budget.limitAmount > 0 && budget.spentAmount / budget.limitAmount >= 0.8 && budget.spentAmount <= budget.limitAmount);

  return {
    title: overLimit.length ? 'Some budgets need attention' : 'Budgets are under control',
    summary: overLimit.length
      ? `${overLimit.length} budget category is already over the limit. Reduce spending there first.`
      : nearLimit.length
        ? `${nearLimit.length} budget category is near the limit. Watch it before the month ends.`
        : 'No budget category is over the limit right now.',
    highlights: [
      overLimit[0] ? `${overLimit[0].category} is over by PHP ${(overLimit[0].spentAmount - overLimit[0].limitAmount).toLocaleString()}` : 'No category is over budget',
      nearLimit[0] ? `${nearLimit[0].category} is near its limit` : 'No category is close to the limit',
      `${dashboard.budgetUsage.length} tracked budget categories`,
    ],
    actionItems: [
      overLimit[0] ? `Stop extra ${overLimit[0].category} spending this month.` : 'Keep recording expenses against each budget.',
      nearLimit[0] ? `Set a smaller daily cap for ${nearLimit[0].category}.` : 'Create budgets for your top spending categories.',
      'Review limits every payday or month end.',
    ],
    source: 'fallback',
  };
};

const fallbackMonthlySummary = (monthly: MonthlyReportSnapshot, categories: Array<{ category: string; amount: number }>): AiFinanceInsight => {
  const top = topCategory(categories);

  return {
    title: `${monthly.month} money summary`,
    summary: monthly.savings >= 0
      ? `You ended with positive savings of PHP ${monthly.savings.toLocaleString()}.`
      : `You spent PHP ${Math.abs(monthly.savings).toLocaleString()} more than your income.`,
    highlights: [
      `Income: PHP ${monthly.totalIncome.toLocaleString()}`,
      `Expenses: PHP ${monthly.totalExpenses.toLocaleString()}`,
      top ? `Largest category: ${top.category}` : 'No category data yet',
    ],
    actionItems: [
      top ? `Compare next month ${top.category} spending against this month.` : 'Add category data for better monthly analysis.',
      monthly.savings < 0 ? 'Set a lower expense target next month.' : 'Turn part of savings into a goal or emergency fund.',
      'Check reports weekly instead of waiting until month end.',
    ],
    source: 'fallback',
  };
};

const fallbackSpendingPlan = (input: SpendingPlanInput): AiSpendingPlan => {
  const available = Math.max(0, input.availableMoney);
  const savings = Math.round(available * 0.2);
  const essentials = Math.round(available * 0.5);
  const flexible = Math.max(0, available - essentials - savings);
  let spendable = essentials + flexible;

  const ordered = [...input.items].sort((a, b) => Number(isNeed(b)) - Number(isNeed(a)) || a.estimatedCost - b.estimatedCost);
  const decisions = ordered.map((item) => {
    const needed = isNeed(item);
    let decision: AiSpendingPlan['decisions'][number]['decision'] = 'buy_later';
    let reason = 'Delay this until essentials and savings are covered.';

    if (item.estimatedCost <= spendable && (needed || item.estimatedCost <= flexible)) {
      decision = 'buy_now';
      reason = needed ? 'This looks essential and fits the available money.' : 'This fits the flexible budget after protecting essentials.';
      spendable -= item.estimatedCost;
    } else if (!needed && item.estimatedCost > flexible) {
      decision = 'save_for';
      reason = 'This looks like a want and is too large for the flexible budget right now.';
    } else if (item.estimatedCost > available) {
      decision = 'skip';
      reason = 'This costs more than the available money, so buying it now is risky.';
    }

    return {
      item: item.name,
      estimatedCost: item.estimatedCost,
      decision,
      reason,
    };
  });

  return {
    title: 'Priority spending plan',
    summary: 'PesoPilot protected savings first, then ranked essentials before wants.',
    recommendedBudget: { essentials, flexible, savings },
    decisions,
    actionItems: [
      'Buy essentials first, then stop when flexible money is used.',
      'Keep the savings portion untouched unless it is an emergency.',
      'Move buy_later and save_for items into next month or a goal.',
    ],
    source: 'fallback',
  };
};

const withFallback = async <T>(createInsight: () => Promise<T | null>, fallback: T): Promise<T> => {
  try {
    return (await createInsight()) ?? fallback;
  } catch {
    if (env.nodeEnv !== 'production') {
      console.warn('AI finance insight unavailable, using local fallback.');
    }
    return fallback;
  }
};

export const aiInsightsService = {
  dashboardInsight(dashboard: DashboardSnapshot) {
    return withFallback(
      () => requestInsight('Create a dashboard coaching insight with the most important pattern and next actions.', dashboard),
      fallbackDashboardInsight(dashboard),
    );
  },

  budgetAdvice(dashboard: DashboardSnapshot) {
    return withFallback(
      () => requestInsight('Create budget advice focused on overspending, near-limit categories, and next actions.', dashboard.budgetUsage),
      fallbackBudgetAdvice(dashboard),
    );
  },

  monthlySummary(monthly: MonthlyReportSnapshot, categories: Array<{ category: string; amount: number }>) {
    return withFallback(
      () => requestInsight('Create a monthly spending summary with trends, risks, and next actions.', { monthly, categories }),
      fallbackMonthlySummary(monthly, categories),
    );
  },

  spendingPlan(input: SpendingPlanInput) {
    return withFallback(
      () => requestSpendingPlan(input),
      fallbackSpendingPlan(input),
    );
  },
};
