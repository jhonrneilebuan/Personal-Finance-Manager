import { Router } from 'express';
import { billReminderController } from '../controllers/financeFeature.controller';
import { validateRequest } from '../middleware/error.middleware';
import { billReminderRules, paidStatusRules } from '../validators/financeFeature.validator';
import { idParamRules } from '../validators/transaction.validator';

export const billRoutes = Router();

billRoutes.get('/', billReminderController.list);
billRoutes.post('/', billReminderRules, validateRequest, billReminderController.create);
billRoutes.put('/:id', idParamRules, billReminderRules, validateRequest, billReminderController.update);
billRoutes.patch('/:id/paid', idParamRules, paidStatusRules, validateRequest, billReminderController.markPaid);
billRoutes.delete('/:id', idParamRules, validateRequest, billReminderController.delete);
