import { incomeService } from '../services/transaction.service';
import { asyncHandler } from '../utils/asyncHandler';

const mapIncome = (body: Record<string, unknown>) => ({
  source: String(body.source),
  amount: Number(body.amount),
  description: body.description ? String(body.description) : undefined,
  transactionDate: new Date(String(body.transactionDate)),
});

export const incomeController = {
  list: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await incomeService.list(req.user!.userId) });
  }),
  create: asyncHandler(async (req, res) => {
    res.status(201).json({ success: true, data: await incomeService.create(req.user!.userId, mapIncome(req.body)) });
  }),
  update: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await incomeService.update(String(req.params.id), req.user!.userId, mapIncome(req.body)) });
  }),
  delete: asyncHandler(async (req, res) => {
    await incomeService.delete(String(req.params.id), req.user!.userId);
    res.status(204).send();
  }),
};
