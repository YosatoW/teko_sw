import promMid from 'express-prometheus-middleware'
import type {Express} from 'express'
import {initializePostsAPI} from './posts'
import { initializeAuthAPI } from './auth'
import authMiddleware from './auth-middleware'
import {limiter} from './rate-limiter'
import { httpLogger } from '../services/logger';

export const initializeAPI = (app: Express) => {
  // Prometheus Middleware zuerst hinzufügen
  app.use(
    promMid({
      metricsPath: '/metrics',
      collectDefaultMetrics: false, // Muss auf false sein
      requestDurationBuckets: [0.1, 0.5, 1, 1.5],
      requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
      responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
    })
  );
  
  app.use(authMiddleware); // Auth-Middleware zuerst
  app.use(httpLogger); // Logger-Middleware hinzufügen
  app.use(limiter); // Rate-Limiter danach

  initializePostsAPI(app);
  initializeAuthAPI(app);
};
