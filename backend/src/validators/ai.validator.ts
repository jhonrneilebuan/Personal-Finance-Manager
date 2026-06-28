import { body } from 'express-validator';

export const expenseCategorySuggestionRules = [
  body('title').trim().isLength({ min: 2, max: 120 }).withMessage('Expense title is required'),
  body('amount').optional({ nullable: true }).isFloat({ gt: 0 }).withMessage('Amount must be greater than zero'),
  body('description').optional({ nullable: true }).isString().trim().isLength({ max: 500 }).withMessage('Description is too long'),
];
