import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import apiRouter from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

// Middlewares
app.use(cors({ origin: ENV.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logger (Development)
if (ENV.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// API Routes
app.use('/api/v1', apiRouter);

// 404 & Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Server Listen
if (require.main === module) {
  const server = app.listen(ENV.PORT, () => {
    console.log(`🚀 Industrial Safety AR Platform Backend running on port ${ENV.PORT}`);
    console.log(`   Health Check: http://localhost:${ENV.PORT}/api/v1/health`);
    console.log(`   Environment:  ${ENV.NODE_ENV}`);
  });

  const shutdown = () => {
    console.log('Shutting down server gracefully...');
    server.close(() => {
      console.log('Server shut down cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

export default app;
