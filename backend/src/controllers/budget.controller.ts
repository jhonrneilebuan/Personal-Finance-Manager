import { budgetService } from '../services/transaction.service';
import { asyncHandler } from '../utils/asyncHandler';
import { parseMonth } from '../utils/date';

const mapBudget = (body: Record<string, unknown>) => ({
  category: String(body.category),
  limitAmount: Number(body.limitAmount),
  month: parseMonth(String(body.month)),
});

export const budgetController = {
  list: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await budgetService.list(req.user!.userId) });
  }),
  create: asyncHandler(async (req, res) => {
    res.status(201).json({ success: true, data: await budgetService.create(req.user!.userId, mapBudget(req.body)) });
  }),
  update: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await budgetService.update(String(req.params.id), req.user!.userId, mapBudget(req.body)) });
  }),
  delete: asyncHandler(async (req, res) => {
    await budgetService.delete(String(req.params.id), req.user!.userId);
    res.status(204).send();
  }),
};
