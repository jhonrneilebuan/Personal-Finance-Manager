import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { validateRequest } from '../middleware/error.middleware';
import { uploadReceipt } from '../middleware/upload.middleware';
import { expenseCategorySuggestionRules, spendingPlanRules } from '../validators/ai.validator';

export const aiRoutes = Router();

aiRoutes.get('/dashboard-insight', aiController.dashboardInsight);
aiRoutes.get('/budget-advice', aiController.budgetAdvice);
aiRoutes.get('/budget-recommendation', aiController.budgetRecommendation);
aiRoutes.get('/monthly-summary', aiController.monthlySummary);
aiRoutes.post('/categorize-expense', expenseCategorySuggestionRules, validateRequest, aiController.categorizeExpense);
aiRoutes.post('/spending-plan', spendingPlanRules, validateRequest, aiController.spendingPlan);
aiRoutes.post('/receipt-scan', uploadReceipt.single('receipt'), aiController.scanReceipt);
