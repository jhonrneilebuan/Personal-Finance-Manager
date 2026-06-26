import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { routes } from './routes';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin === '*' ? true : env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use('/uploads', express.static(path.resolve(env.uploadDir)));
app.use('/api', routes);
app.use(notFoundHandler);
app.use(errorHandler);

