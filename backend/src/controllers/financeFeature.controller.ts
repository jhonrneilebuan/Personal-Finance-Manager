import {
  allowancePlanService,
  billReminderService,
  debtService,
  recurringTransactionService,
  savingGoalService,
} from '../services/financeFeature.service';
import { asyncHandler } from '../utils/asyncHandler';

const optionalDate = (value: unknown) => value ? new Date(String(value)) : null;
const optionalNumber = (value: unknown) => value == null || value === '' ? null : Number(value);
const optionalString = (value: unknown) => value == null || value === '' ? null : String(value);
const optionalBoolean = (value: unknown) => {
  if (value === undefined) return undefined;
  return value === true || value === 'true';
};

const mapGoal = (body: Record<string, unknown>) => ({
  name: String(body.name),
  targetAmount: Number(body.targetAmount),
  currentAmount: body.currentAmount == null || body.currentAmount === '' ? undefined : Number(body.currentAmount),
  targetDate: optionalDate(body.targetDate),
  note: optionalString(body.note),
});

const mapBill = (body: Record<string, unknown>) => ({
  name: String(body.name),
  amount: Number(body.amount),
  category: String(body.category),
  dueDate: new Date(String(body.dueDate)),
  isPaid: optionalBoolean(body.isPaid),
  note: optionalString(body.note),
});

const mapRecurring = (body: Record<string, unknown>) => ({
  type: String(body.type) as 'income' | 'expense',
  title: String(body.title),
  amount: Number(body.amount),
  category: optionalString(body.category),
  frequency: String(body.frequency) as 'weekly' | 'monthly' | 'yearly',
  nextRunDate: new Date(String(body.nextRunDate)),
  isActive: optionalBoolean(body.isActive),
  note: optionalString(body.note),
});

const mapDebt = (body: Record<string, unknown>) => ({
  lender: String(body.lender),
  totalAmount: Number(body.totalAmount),
  paidAmount: body.paidAmount == null || body.paidAmount === '' ? undefined : Number(body.paidAmount),
  interestRate: optionalNumber(body.interestRate),
  dueDate: optionalDate(body.dueDate),
  minimumPayment: optionalNumber(body.minimumPayment),
  note: optionalString(body.note),
});

const mapAllowancePlan = (body: Record<string, unknown>) => ({
  name: String(body.name),
  month: new Date(String(body.month)),
  dailyAmount: Number(body.dailyAmount),
  spendingLimit: body.spendingLimit == null || body.spendingLimit === '' ? undefined : Number(body.spendingLimit),
  weekdays: Array.isArray(body.weekdays) ? body.weekdays.map(Number) : [1, 2, 3, 4, 5],
  note: optionalString(body.note),
});

export const savingGoalController = {
  list: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await savingGoalService.list(req.user!.userId) });
  }),
  create: asyncHandler(async (req, res) => {
    res.status(201).json({ success: true, data: await savingGoalService.create(req.user!.userId, mapGoal(req.body)) });
  }),
  update: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await savingGoalService.update(String(req.params.id), req.user!.userId, mapGoal(req.body)) });
  }),
  contribute: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await savingGoalService.contribute(String(req.params.id), req.user!.userId, Number(req.body.amount)) });
  }),
  delete: asyncHandler(async (req, res) => {
    await savingGoalService.delete(String(req.params.id), req.user!.userId);
    res.status(204).send();
  }),
};

export const billReminderController = {
  list: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await billReminderService.list(req.user!.userId) });
  }),
  create: asyncHandler(async (req, res) => {
    res.status(201).json({ success: true, data: await billReminderService.create(req.user!.userId, mapBill(req.body)) });
  }),
  update: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await billReminderService.update(String(req.params.id), req.user!.userId, mapBill(req.body)) });
  }),
  markPaid: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await billReminderService.markPaid(String(req.params.id), req.user!.userId, Boolean(req.body.isPaid)) });
  }),
  delete: asyncHandler(async (req, res) => {
    await billReminderService.delete(String(req.params.id), req.user!.userId);
    res.status(204).send();
  }),
};

export const recurringTransactionController = {
  list: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await recurringTransactionService.list(req.user!.userId) });
  }),
  create: asyncHandler(async (req, res) => {
    res.status(201).json({ success: true, data: await recurringTransactionService.create(req.user!.userId, mapRecurring(req.body)) });
  }),
  update: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await recurringTransactionService.update(String(req.params.id), req.user!.userId, mapRecurring(req.body)) });
  }),
  toggle: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await recurringTransactionService.toggle(String(req.params.id), req.user!.userId, Boolean(req.body.isActive)) });
  }),
  delete: asyncHandler(async (req, res) => {
    await recurringTransactionService.delete(String(req.params.id), req.user!.userId);
    res.status(204).send();
  }),
};

export const debtController = {
  list: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await debtService.list(req.user!.userId) });
  }),
  create: asyncHandler(async (req, res) => {
    res.status(201).json({ success: true, data: await debtService.create(req.user!.userId, mapDebt(req.body)) });
  }),
  update: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await debtService.update(String(req.params.id), req.user!.userId, mapDebt(req.body)) });
  }),
  pay: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await debtService.pay(String(req.params.id), req.user!.userId, Number(req.body.amount)) });
  }),
  delete: asyncHandler(async (req, res) => {
    await debtService.delete(String(req.params.id), req.user!.userId);
    res.status(204).send();
  }),
};

export const allowancePlanController = {
  list: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await allowancePlanService.list(req.user!.userId) });
  }),
  summary: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await allowancePlanService.summary(req.user!.userId, req.query.month as string | undefined) });
  }),
  create: asyncHandler(async (req, res) => {
    res.status(201).json({ success: true, data: await allowancePlanService.create(req.user!.userId, mapAllowancePlan(req.body)) });
  }),
  update: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await allowancePlanService.update(String(req.params.id), req.user!.userId, mapAllowancePlan(req.body)) });
  }),
  delete: asyncHandler(async (req, res) => {
    await allowancePlanService.delete(String(req.params.id), req.user!.userId);
    res.status(204).send();
  }),
};
