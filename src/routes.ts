import type { Express } from 'express';

import { env } from './config/env.js';
import { sendSuccess } from './shared/http/index.js';

export function registerRoutes(app: Express): void {
  app.get('/health', (_req, res) => {
    sendSuccess(res, {
      status: 'ok',
      service: 'stockflow-api',
      timestamp: new Date().toISOString(),
    });
  });

  app.get(env.API_PREFIX, (_req, res) => {
    sendSuccess(res, {
      name: 'StockFlow API',
      version: '1.0.0',
      description: 'SaaS multi-tenant inventory management platform',
    });
  });
}
