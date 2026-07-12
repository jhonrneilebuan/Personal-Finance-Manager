import { Router } from 'express';
import { reportController } from '../controllers/report.controller';

export const reportRoutes = Router();

reportRoutes.get('/monthly', reportController.monthly);
reportRoutes.get('/category', reportController.category);
reportRoutes.get('/export', reportController.exportMonthly);
