import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { createCorsOptions } from './middleware/cors.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';

export const app = express();
const loaderIoToken = 'loaderio-6584858c418570e1dbb33efe8870230d';
const loaderIoPath = `/${loaderIoToken}.txt`;

app.disable('x-powered-by');

if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(helmet());
app.use(cors(createCorsOptions()));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

app.get(loaderIoPath, (_request, response) => {
  response.type('text/plain').send(loaderIoToken);
});

app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
