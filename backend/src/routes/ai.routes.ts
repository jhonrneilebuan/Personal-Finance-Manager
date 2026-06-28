import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { validateRequest } from '../middleware/error.middleware';
import { expenseCategorySuggestionRules } from '../validators/ai.validator';

export const aiRoutes = Router();

aiRoutes.post('/categorize-expense', expenseCategorySuggestionRules, validateRequest, aiController.categorizeExpense);
