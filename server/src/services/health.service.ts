import { db } from '../config/database';
import os from 'os';

export class HealthService {
  static async checkHealth() {
    let dbStatus = 'healthy';
    let dbError = null;

    try {
      await db.query('SELECT 1');
    } catch (err: any) {
      dbStatus = 'degraded';
      dbError = err.message;
    }

    return {
      status: dbStatus === 'healthy' ? 'pass' : 'warn',
      service: 'jharkhand-industrial-safety-ar-backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime_seconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      database: {
        engine: db.getDbType(),
        status: dbStatus,
        error: dbError,
      },
      system: {
        platform: process.platform,
        node_version: process.version,
        free_memory_mb: Math.floor(os.freemem() / (1024 * 1024)),
        total_memory_mb: Math.floor(os.totalmem() / (1024 * 1024)),
      },
    };
  }
}
