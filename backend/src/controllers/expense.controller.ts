import { expenseService } from '../services/transaction.service';
import { imageStorageService } from '../services/imageStorage.service';
import { asyncHandler } from '../utils/asyncHandler';

const mapExpense = (body: Record<string, unknown>, receiptImage?: string) => ({
  title: String(body.title),
  amount: Number(body.amount),
  category: String(body.category),
  description: body.description ? String(body.description) : undefined,
  receiptImage,
  transactionDate: new Date(String(body.transactionDate)),
});

export const expenseController = {
  list: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await expenseService.list(req.user!.userId) });
  }),
  create: asyncHandler(async (req, res) => {
    const receiptImage = req.file
      ? await imageStorageService.uploadImage({
        buffer: req.file.buffer,
        mimeType: req.file.mimetype,
        originalName: req.file.originalname,
        folder: 'receipts',
      })
      : undefined;
    const data = await expenseService.create(req.user!.userId, mapExpense(req.body, receiptImage));
    res.status(201).json({ success: true, data });
  }),
  update: asyncHandler(async (req, res) => {
    const receiptImage = req.file
      ? await imageStorageService.uploadImage({
        buffer: req.file.buffer,
        mimeType: req.file.mimetype,
        originalName: req.file.originalname,
        folder: 'receipts',
      })
      : undefined;
    const data = await expenseService.update(String(req.params.id), req.user!.userId, mapExpense(req.body, receiptImage));
    res.json({ success: true, data });
  }),
  delete: asyncHandler(async (req, res) => {
    await expenseService.delete(String(req.params.id), req.user!.userId);
    res.status(204).send();
  }),
};
