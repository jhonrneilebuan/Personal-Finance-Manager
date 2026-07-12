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
  exportMonthly: asyncHandler(async (req, res) => {
    const format = req.query.format === 'pdf' ? 'pdf' : 'csv';
    const report = await reportService.exportMonthly(req.user!.userId, req.query.month as string | undefined, format);

    res.setHeader('Content-Type', report.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${report.filename}"`);
    res.send(report.body);
  }),
  dashboard: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await dashboardService.getDashboard(req.user!.userId) });
  }),
};
