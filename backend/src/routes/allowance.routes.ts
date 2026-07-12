import { Router } from 'express';
import { allowancePlanController } from '../controllers/financeFeature.controller';
import { validateRequest } from '../middleware/error.middleware';
import { allowancePlanRules } from '../validators/financeFeature.validator';
import { idParamRules } from '../validators/transaction.validator';

export const allowanceRoutes = Router();

allowanceRoutes.get('/summary', allowancePlanController.summary);
allowanceRoutes.get('/', allowancePlanController.list);
allowanceRoutes.post('/', allowancePlanRules, validateRequest, allowancePlanController.create);
allowanceRoutes.put('/:id', idParamRules, allowancePlanRules, validateRequest, allowancePlanController.update);
allowanceRoutes.delete('/:id', idParamRules, validateRequest, allowancePlanController.delete);
