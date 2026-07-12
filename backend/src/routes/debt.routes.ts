import { Router } from 'express';
import { debtController } from '../controllers/financeFeature.controller';
import { validateRequest } from '../middleware/error.middleware';
import { debtRules, paymentRules } from '../validators/financeFeature.validator';
import { idParamRules } from '../validators/transaction.validator';

export const debtRoutes = Router();

debtRoutes.get('/', debtController.list);
debtRoutes.post('/', debtRules, validateRequest, debtController.create);
debtRoutes.put('/:id', idParamRules, debtRules, validateRequest, debtController.update);
debtRoutes.post('/:id/pay', idParamRules, paymentRules, validateRequest, debtController.pay);
debtRoutes.delete('/:id', idParamRules, validateRequest, debtController.delete);
