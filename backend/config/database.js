/**
 * SQLite access — better-sqlite3 locally; sql.js on Vercel serverless (no native bindings).
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let engine = null;

/**
 * Wraps a sql.js Database with a better-sqlite3-like prepare().run / .get / .all API.
 */
function wrapSqlJsDatabase(sqlDb) {
  return {
    exec(sql) {
      sqlDb.exec(sql);
    },
    prepare(sql) {
      return {
        run(...params) {
          const stmt = sqlDb.prepare(sql);
          if (params.length) stmt.bind(params);
          stmt.step();
          stmt.free();
          return { changes: sqlDb.getRowsModified() };
        },
        get(...params) {
          const stmt = sqlDb.prepare(sql);
          if (params.length) stmt.bind(params);
          if (!stmt.step()) {
            stmt.free();
            return undefined;
          }
          const row = stmt.getAsObject();
          stmt.free();
          return row;
        },
        all(...params) {
          const stmt = sqlDb.prepare(sql);
          if (params.length) stmt.bind(params);
          const rows = [];
          while (stmt.step()) rows.push(stmt.getAsObject());
          stmt.free();
          return rows;
        },
      };
    },
  };
}

export async function initDatabaseEngine() {
  if (engine) return engine;

  if (process.env.VERCEL === '1') {
    const initSqlJs = (await import('sql.js')).default;
    const require = createRequire(import.meta.url);
    const wasmPath = require.resolve('sql.js/dist/sql-wasm.wasm');
    const wasmBinary = fs.readFileSync(wasmPath);
    const SQL = await initSqlJs({ wasmBinary });
    const sqlDb = new SQL.Database();
    sqlDb.run('PRAGMA foreign_keys = ON');
    engine = wrapSqlJsDatabase(sqlDb);
    return engine;
  }

  const Database = (await import('better-sqlite3')).default;
  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', '..', 'career_platform.db');
  const nativeDb = new Database(dbPath);
  nativeDb.pragma('journal_mode = WAL');
  nativeDb.pragma('foreign_keys = ON');
  engine = nativeDb;
  return engine;
}

const db = new Proxy(
  {},
  {
    get(_, prop) {
      if (!engine) {
        throw new Error('Database not initialized. Call await initDatabaseEngine() before using db.');
      }
      const v = engine[prop];
      return typeof v === 'function' ? v.bind(engine) : v;
    },
  }
);

export default db;
