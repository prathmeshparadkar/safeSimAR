import sqlite3 from 'sqlite3';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

class Database {
  private dbType: 'sqlite' | 'postgres';
  private sqliteDb: sqlite3.Database | null = null;
  private pgPool: Pool | null = null;

  constructor() {
    this.dbType = (process.env.DB_TYPE as 'sqlite' | 'postgres') || 'sqlite';
    this.initialize();
  }

  private initialize() {
    if (this.dbType === 'postgres' && process.env.DATABASE_URL) {
      this.pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      console.log('Connected to PostgreSQL database pool.');
    } else {
      this.dbType = 'sqlite';
      const sqlitePath = process.env.SQLITE_PATH || './data/sih_safety.db';
      const resolvedPath = path.resolve(process.cwd(), sqlitePath);
      const dir = path.dirname(resolvedPath);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      this.sqliteDb = new sqlite3.Database(resolvedPath, (err) => {
        if (err) {
          console.error('Failed to open SQLite database:', err.message);
        } else {
          console.log(`Connected to SQLite database at ${resolvedPath}`);
          // Enable foreign keys in SQLite
          this.sqliteDb?.run('PRAGMA foreign_keys = ON;');
        }
      });
    }
  }

  public async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    if (this.dbType === 'postgres' && this.pgPool) {
      const res = await this.pgPool.query(sql, params);
      return {
        rows: res.rows,
        rowCount: res.rowCount || 0,
      };
    }

    return new Promise((resolve, reject) => {
      if (!this.sqliteDb) {
        return reject(new Error('SQLite database not initialized'));
      }

      // Convert PostgreSQL style $1, $2 to SQLite ? placeholders
      const sqliteSql = sql.replace(/\$(\d+)/g, '?');

      const trimmed = sqliteSql.trim().toUpperCase();
      if (trimmed.startsWith('SELECT') || trimmed.startsWith('PRAGMA')) {
        this.sqliteDb.all(sqliteSql, params, (err, rows) => {
          if (err) return reject(err);
          resolve({
            rows: (rows as T[]) || [],
            rowCount: rows ? rows.length : 0,
          });
        });
      } else {
        this.sqliteDb.run(sqliteSql, params, function (err) {
          if (err) return reject(err);
          resolve({
            rows: [{ id: this.lastID, changes: this.changes }] as any,
            rowCount: this.changes,
          });
        });
      }
    });
  }

  public async exec(sqlScript: string): Promise<void> {
    if (this.dbType === 'postgres' && this.pgPool) {
      await this.pgPool.query(sqlScript);
      return;
    }

    return new Promise((resolve, reject) => {
      if (!this.sqliteDb) {
        return reject(new Error('SQLite database not initialized'));
      }
      this.sqliteDb.exec(sqlScript, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  public async close(): Promise<void> {
    if (this.pgPool) {
      await this.pgPool.end();
    }
    if (this.sqliteDb) {
      await new Promise<void>((resolve, reject) => {
        this.sqliteDb!.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }

  public getDbType(): 'sqlite' | 'postgres' {
    return this.dbType;
  }
}

export const db = new Database();
export default db;
