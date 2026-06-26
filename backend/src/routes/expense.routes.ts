import { Router } from 'express';
import { expenseController } from '../controllers/expense.controller';
import { validateRequest } from '../middleware/error.middleware';
import { uploadReceipt } from '../middleware/upload.middleware';
import { expenseRules, idParamRules } from '../validators/transaction.validator';

export const expenseRoutes = Router();

expenseRoutes.get('/', expenseController.list);
expenseRoutes.post('/', uploadReceipt.single('receipt'), expenseRules, validateRequest, expenseController.create);
expenseRoutes.put('/:id', uploadReceipt.single('receipt'), idParamRules, expenseRules, validateRequest, expenseController.update);
expenseRoutes.delete('/:id', idParamRules, validateRequest, expenseController.delete);

