import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { validateRequest } from '../middleware/error.middleware';
import { expenseCategorySuggestionRules, spendingPlanRules } from '../validators/ai.validator';

export const aiRoutes = Router();

aiRoutes.get('/dashboard-insight', aiController.dashboardInsight);
aiRoutes.get('/budget-advice', aiController.budgetAdvice);
aiRoutes.get('/monthly-summary', aiController.monthlySummary);
aiRoutes.post('/categorize-expense', expenseCategorySuggestionRules, validateRequest, aiController.categorizeExpense);
aiRoutes.post('/spending-plan', spendingPlanRules, validateRequest, aiController.spendingPlan);
