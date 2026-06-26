import { Router } from 'express';
import { incomeController } from '../controllers/income.controller';
import { validateRequest } from '../middleware/error.middleware';
import { idParamRules, incomeRules } from '../validators/transaction.validator';

export const incomeRoutes = Router();

incomeRoutes.get('/', incomeController.list);
incomeRoutes.post('/', incomeRules, validateRequest, incomeController.create);
incomeRoutes.put('/:id', idParamRules, incomeRules, validateRequest, incomeController.update);
incomeRoutes.delete('/:id', idParamRules, validateRequest, incomeController.delete);

