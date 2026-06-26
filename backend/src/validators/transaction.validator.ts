import { body, param } from 'express-validator';

export const idParamRules = [param('id').isUUID().withMessage('Valid id is required')];

export const expenseRules = [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than zero'),
  body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
  body('description').optional({ nullable: true }).isString(),
  body('transactionDate').isISO8601().withMessage('Transaction date must be ISO-8601'),
];

export const incomeRules = [
  body('source').trim().isLength({ min: 1 }).withMessage('Source is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than zero'),
  body('description').optional({ nullable: true }).isString(),
  body('transactionDate').isISO8601().withMessage('Transaction date must be ISO-8601'),
];

export const budgetRules = [
  body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
  body('limitAmount').isFloat({ min: 0.01 }).withMessage('Limit amount must be greater than zero'),
  body('month').isISO8601().withMessage('Month must be an ISO-8601 date'),
];

