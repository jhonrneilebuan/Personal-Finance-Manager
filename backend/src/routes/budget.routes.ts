import { Router } from 'express';
import { budgetController } from '../controllers/budget.controller';
import { validateRequest } from '../middleware/error.middleware';
import { budgetRules, idParamRules } from '../validators/transaction.validator';

export const budgetRoutes = Router();

budgetRoutes.get('/', budgetController.list);
budgetRoutes.post('/', budgetRules, validateRequest, budgetController.create);
budgetRoutes.put('/:id', idParamRules, budgetRules, validateRequest, budgetController.update);
budgetRoutes.delete('/:id', idParamRules, validateRequest, budgetController.delete);

