import { Router } from 'express';
import { savingGoalController } from '../controllers/financeFeature.controller';
import { validateRequest } from '../middleware/error.middleware';
import { contributionRules, savingGoalRules } from '../validators/financeFeature.validator';
import { idParamRules } from '../validators/transaction.validator';

export const goalRoutes = Router();

goalRoutes.get('/', savingGoalController.list);
goalRoutes.post('/', savingGoalRules, validateRequest, savingGoalController.create);
goalRoutes.put('/:id', idParamRules, savingGoalRules, validateRequest, savingGoalController.update);
goalRoutes.post('/:id/contribute', idParamRules, contributionRules, validateRequest, savingGoalController.contribute);
goalRoutes.delete('/:id', idParamRules, validateRequest, savingGoalController.delete);
