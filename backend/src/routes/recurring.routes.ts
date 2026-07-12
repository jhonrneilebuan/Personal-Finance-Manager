import { Router } from 'express';
import { recurringTransactionController } from '../controllers/financeFeature.controller';
import { validateRequest } from '../middleware/error.middleware';
import { activeStatusRules, recurringTransactionRules } from '../validators/financeFeature.validator';
import { idParamRules } from '../validators/transaction.validator';

export const recurringRoutes = Router();

recurringRoutes.get('/', recurringTransactionController.list);
recurringRoutes.post('/', recurringTransactionRules, validateRequest, recurringTransactionController.create);
recurringRoutes.put('/:id', idParamRules, recurringTransactionRules, validateRequest, recurringTransactionController.update);
recurringRoutes.patch('/:id/active', idParamRules, activeStatusRules, validateRequest, recurringTransactionController.toggle);
recurringRoutes.delete('/:id', idParamRules, validateRequest, recurringTransactionController.delete);
