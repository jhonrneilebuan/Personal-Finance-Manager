import { aiCategorizationService } from '../services/aiCategorization.service';
import { asyncHandler } from '../utils/asyncHandler';

export const aiController = {
  categorizeExpense: asyncHandler(async (req, res) => {
    const amount = Number(req.body.amount);

    const suggestion = await aiCategorizationService.suggestCategory({
      title: String(req.body.title),
      amount: Number.isFinite(amount) ? amount : undefined,
      description: req.body.description ? String(req.body.description) : undefined,
    });

    res.json({ success: true, data: suggestion });
  }),
};
