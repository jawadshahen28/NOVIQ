import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import { apiRouter } from './routes/index.js';
import { createCorsOptions } from './middleware/cors.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';

export const app = express();

app.disable('x-powered-by');

app.use(helmet());
app.use(cors(createCorsOptions()));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
