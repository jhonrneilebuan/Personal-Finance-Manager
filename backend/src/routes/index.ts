import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authRoutes } from './auth.routes';
import { aiRoutes } from './ai.routes';
import { budgetRoutes } from './budget.routes';
import { expenseRoutes } from './expense.routes';
import { incomeRoutes } from './income.routes';
import { reportRoutes } from './report.routes';
import { userRoutes } from './user.routes';
import { reportController } from '../controllers/report.controller';

export const routes = Router();

routes.get('/', (_req, res) => res.json({ success: true, data: { name: 'PesoPilot API', status: 'ok' } }));
routes.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));
routes.use('/auth', authRoutes);
routes.use('/ai', authenticate, aiRoutes);
routes.use('/user', authenticate, userRoutes);
routes.use('/expenses', authenticate, expenseRoutes);
routes.use('/income', authenticate, incomeRoutes);
routes.use('/budgets', authenticate, budgetRoutes);
routes.use('/reports', authenticate, reportRoutes);
routes.get('/dashboard', authenticate, reportController.dashboard);
