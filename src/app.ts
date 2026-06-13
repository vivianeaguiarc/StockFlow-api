import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';

import { env } from './config/env.js';
import {
  errorHandler,
  notFoundHandler,
  requestLogger,
} from './shared/middlewares/index.js';
import { registerRoutes } from './routes.js';

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(requestLogger);

  registerRoutes(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export function startServer(): Express {
  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(
      JSON.stringify({
        level: 'info',
        message: 'StockFlow API started',
        port: env.PORT,
        environment: env.NODE_ENV,
        apiPrefix: env.API_PREFIX,
        timestamp: new Date().toISOString(),
      }),
    );
  });

  return app;
}
