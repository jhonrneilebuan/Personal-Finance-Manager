import { body } from 'express-validator';

export const savingGoalRules = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Goal name is required'),
  body('targetAmount').isFloat({ gt: 0 }).withMessage('Target amount must be greater than zero'),
  body('currentAmount').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Current amount must be zero or greater'),
  body('targetDate').optional({ nullable: true }).isISO8601().withMessage('Target date must be ISO-8601'),
  body('note').optional({ nullable: true }).isString().trim().isLength({ max: 500 }).withMessage('Note is too long'),
];

export const contributionRules = [
  body('amount').isFloat({ gt: 0 }).withMessage('Contribution amount must be greater than zero'),
];

export const billReminderRules = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Bill name is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than zero'),
  body('category').trim().isLength({ min: 1, max: 80 }).withMessage('Category is required'),
  body('dueDate').isISO8601().withMessage('Due date must be ISO-8601'),
  body('isPaid').optional({ nullable: true }).isBoolean().withMessage('Paid status must be true or false'),
  body('note').optional({ nullable: true }).isString().trim().isLength({ max: 500 }).withMessage('Note is too long'),
];

export const paidStatusRules = [
  body('isPaid').isBoolean().withMessage('Paid status must be true or false'),
];

export const recurringTransactionRules = [
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('title').trim().isLength({ min: 2, max: 120 }).withMessage('Title is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than zero'),
  body('category').optional({ nullable: true }).isString().trim().isLength({ max: 80 }).withMessage('Category is too long'),
  body('frequency').isIn(['weekly', 'monthly', 'yearly']).withMessage('Frequency must be weekly, monthly, or yearly'),
  body('nextRunDate').isISO8601().withMessage('Next run date must be ISO-8601'),
  body('isActive').optional({ nullable: true }).isBoolean().withMessage('Active status must be true or false'),
  body('note').optional({ nullable: true }).isString().trim().isLength({ max: 500 }).withMessage('Note is too long'),
];

export const activeStatusRules = [
  body('isActive').isBoolean().withMessage('Active status must be true or false'),
];

export const debtRules = [
  body('lender').trim().isLength({ min: 2, max: 120 }).withMessage('Lender is required'),
  body('totalAmount').isFloat({ gt: 0 }).withMessage('Total amount must be greater than zero'),
  body('paidAmount').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Paid amount must be zero or greater'),
  body('interestRate').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Interest rate must be zero or greater'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Due date must be ISO-8601'),
  body('minimumPayment').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Minimum payment must be zero or greater'),
  body('note').optional({ nullable: true }).isString().trim().isLength({ max: 500 }).withMessage('Note is too long'),
];

export const paymentRules = [
  body('amount').isFloat({ gt: 0 }).withMessage('Payment amount must be greater than zero'),
];

export const allowancePlanRules = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Plan name is required'),
  body('month').isISO8601().withMessage('Month must be ISO-8601'),
  body('dailyAmount').isFloat({ gt: 0 }).withMessage('Daily allowance must be greater than zero'),
  body('spendingLimit').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Daily spending limit must be zero or greater'),
  body('weekdays').isArray({ min: 1, max: 7 }).withMessage('Choose at least one weekday'),
  body('weekdays.*').isInt({ min: 0, max: 6 }).withMessage('Weekday must be between 0 and 6'),
  body('note').optional({ nullable: true }).isString().trim().isLength({ max: 500 }).withMessage('Note is too long'),
];
