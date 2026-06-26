import { dashboardService } from '../services/dashboard.service';
import { reportService } from '../services/report.service';
import { asyncHandler } from '../utils/asyncHandler';

export const reportController = {
  monthly: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await reportService.monthly(req.user!.userId, req.query.month as string) });
  }),
  category: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await reportService.category(req.user!.userId, req.query.month as string) });
  }),
  dashboard: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await dashboardService.getDashboard(req.user!.userId) });
  }),
};

