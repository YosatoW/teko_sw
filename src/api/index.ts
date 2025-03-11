import type {Express} from 'express'
import {initializePostsAPI} from './posts'
import { initializeAuthAPI } from './auth'
import authMiddleware from './auth-middleware'
import {limiter} from './rate-limiter'
import { httpLogger } from '../services/logger';

export const initializeAPI = (app: Express) => {
    app.use(authMiddleware); // Auth-Middleware zuerst
    app.use(httpLogger); // Logger-Middleware hinzufügen
    app.use(limiter); // Rate-Limiter danach

    initializePostsAPI(app);
    initializeAuthAPI(app);
};
