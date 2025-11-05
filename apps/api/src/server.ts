import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { corsOptions } from './config/cors';
import { helmetOptions } from './config/security';
import { registerErrorHandlers } from './middleware/errorHandler';
import healthRoutes from './routes/health';
import regionsRoutes from './routes/regions';
import sitesRoutes from './routes/sites';
import searchRoutes from './routes/search';
import scoreRoutes from './routes/score';
export function buildServer(){ const app = Fastify({ logger:{ level: process.env.LOG_LEVEL||'info' }}); app.register(cors, corsOptions); app.register(helmet, helmetOptions); app.register(healthRoutes, { prefix:'/api' }); app.register(regionsRoutes, { prefix:'/api' }); app.register(sitesRoutes, { prefix:'/api' }); app.register(searchRoutes, { prefix:'/api' }); app.register(scoreRoutes, { prefix:'/api' }); registerErrorHandlers(app); return app; }
