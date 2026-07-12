import { aiCategorizationService } from '../services/aiCategorization.service';
import { aiInsightsService, type PurchasePlanItem } from '../services/aiInsights.service';
import { dashboardService } from '../services/dashboard.service';
import { reportService } from '../services/report.service';
import { asyncHandler } from '../utils/asyncHandler';
import { HttpError } from '../utils/httpError';

export const aiController = {
  categorizeExpense: asyncHandler(async (req, res) => {
    const amount = Number(req.body.amount);

    const suggestion = await aiCategorizationService.suggestCategory({
      title: String(req.body.title),
      amount: Number.isFinite(amount) ? amount : undefined,
      description: req.body.description ? String(req.body.description) : undefined,
    });

    res.json({ success: true, data: suggestion });
  }),

  dashboardInsight: asyncHandler(async (req, res) => {
    const dashboard = await dashboardService.getDashboard(req.user!.userId);
    const insight = await aiInsightsService.dashboardInsight(dashboard);
    res.json({ success: true, data: insight });
  }),

  budgetAdvice: asyncHandler(async (req, res) => {
    const dashboard = await dashboardService.getDashboard(req.user!.userId);
    const insight = await aiInsightsService.budgetAdvice(dashboard);
    res.json({ success: true, data: insight });
  }),

  budgetRecommendation: asyncHandler(async (req, res) => {
    const dashboard = await dashboardService.getDashboard(req.user!.userId);
    const recommendation = await aiInsightsService.budgetRecommendation(dashboard);
    res.json({ success: true, data: recommendation });
  }),

  monthlySummary: asyncHandler(async (req, res) => {
    const month = req.query.month as string | undefined;
    const [monthly, categories] = await Promise.all([
      reportService.monthly(req.user!.userId, month),
      reportService.category(req.user!.userId, month),
    ]);
    const insight = await aiInsightsService.monthlySummary(monthly, categories);
    res.json({ success: true, data: insight });
  }),

  spendingPlan: asyncHandler(async (req, res) => {
    const dashboard = await dashboardService.getDashboard(req.user!.userId);
    const availableMoney = Number(req.body.availableMoney);

    const items: PurchasePlanItem[] = Array.isArray(req.body.items)
      ? req.body.items.map((item: { name: unknown; estimatedCost: unknown; priority?: unknown }) => {
        const priority = ['need', 'want', 'optional'].includes(String(item.priority))
          ? String(item.priority) as PurchasePlanItem['priority']
          : undefined;

        return {
          name: String(item.name),
          estimatedCost: Number(item.estimatedCost),
          priority,
        };
      })
      : [];

    const plan = await aiInsightsService.spendingPlan({
      availableMoney,
      currentBalance: dashboard.currentBalance,
      monthlyIncome: dashboard.totalIncome,
      monthlyExpenses: dashboard.totalExpenses,
      items,
    });

    res.json({ success: true, data: plan });
  }),

  scanReceipt: asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new HttpError(400, 'Receipt image is required');
    }

    const receipt = await aiInsightsService.scanReceipt(req.file.path, req.file.mimetype);
    res.json({ success: true, data: receipt });
  }),
};
