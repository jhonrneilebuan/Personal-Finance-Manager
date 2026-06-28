import { body } from 'express-validator';

export const expenseCategorySuggestionRules = [
  body('title').trim().isLength({ min: 2, max: 120 }).withMessage('Expense title is required'),
  body('amount').optional({ nullable: true }).isFloat({ gt: 0 }).withMessage('Amount must be greater than zero'),
  body('description').optional({ nullable: true }).isString().trim().isLength({ max: 500 }).withMessage('Description is too long'),
];

export const spendingPlanRules = [
  body('availableMoney').isFloat({ gt: 0 }).withMessage('Available money must be greater than zero'),
  body('items').isArray({ min: 1, max: 15 }).withMessage('Add at least one item to plan'),
  body('items.*.name').trim().isLength({ min: 2, max: 120 }).withMessage('Item name is required'),
  body('items.*.estimatedCost').isFloat({ gt: 0 }).withMessage('Item cost must be greater than zero'),
  body('items.*.priority').optional({ nullable: true }).isIn(['need', 'want', 'optional']).withMessage('Priority must be need, want, or optional'),
];
