const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

let pgPool = null;
let sqlDbInstance = null;
let SQLModule = null;
let isUsingSqlite = false;
let connectionAttempted = false;
let activeDbPath = null;

async function getSqliteDb() {
  if (!sqlDbInstance) {
    if (!SQLModule) {
      const initSqlJs = require('sql.js');
      SQLModule = await initSqlJs();
    }

    const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    activeDbPath = isServerless ? '/tmp/database.sqlite' : path.join(process.cwd(), 'database.sqlite');
    
    if (isServerless && !fs.existsSync('/tmp/database.sqlite')) {
      const srcPath = path.join(process.cwd(), 'database.sqlite');
      if (fs.existsSync(srcPath)) {
        try {
          fs.copyFileSync(srcPath, '/tmp/database.sqlite');
        } catch (e) {
          console.warn('Could not copy database.sqlite to /tmp:', e.message);
        }
      }
    }

    const fileBuffer = fs.existsSync(activeDbPath) ? fs.readFileSync(activeDbPath) : null;
    sqlDbInstance = fileBuffer ? new SQLModule.Database(fileBuffer) : new SQLModule.Database();
  }
  return sqlDbInstance;
}

async function testPostgresConnection() {
  if (connectionAttempted) return !isUsingSqlite;
  connectionAttempted = true;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes('[YOUR-PASSWORD]')) {
    console.warn('⚡ Using local SQLite database (no remote Postgres configured).');
    isUsingSqlite = true;
    return false;
  }

  try {
    pgPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 4000,
    });
    // Test query with a short timeout
    const client = await pgPool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Connected to Supabase PostgreSQL successfully!');
    isUsingSqlite = false;
    return true;
  } catch (err) {
    console.warn(`\n⚠️  Remote PostgreSQL unreachable (${err.message}).`);
    console.warn('⚡ Falling back seamlessly to local SQLite for offline/development resilience.\n');
    isUsingSqlite = true;
    if (pgPool) {
      try { await pgPool.end(); } catch (_) {}
      pgPool = null;
    }
    return false;
  }
}

async function query(text, params = []) {
  if (!connectionAttempted) {
    await testPostgresConnection();
  }

  if (!isUsingSqlite && pgPool) {
    try {
      const res = await pgPool.query(text, params);
      return res;
    } catch (err) {
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
        console.warn(`Postgres connection lost (${err.message}), falling back to SQLite.`);
        isUsingSqlite = true;
      } else {
        throw err;
      }
    }
  }

  // SQLite execution fallback using WebAssembly (Zero C++ / Zero GLIBC dependencies)
  const db = await getSqliteDb();
  
  // Transform Postgres SQL dialect to SQLite:
  // 1. Replace $1, $2, ... with ?
  let sqliteQuery = text.replace(/\$(\d+)/g, '?');

  // 2. Transform PostgreSQL types and syntax
  sqliteQuery = sqliteQuery
    .replace(/UUID PRIMARY KEY DEFAULT gen_random_uuid\(\)/gi, 'TEXT PRIMARY KEY')
    .replace(/UUID/gi, 'TEXT')
    .replace(/JSONB DEFAULT '\[\]'::jsonb/gi, 'TEXT DEFAULT "[]"')
    .replace(/JSONB DEFAULT '\{\}'::jsonb/gi, 'TEXT DEFAULT "{}"')
    .replace(/JSONB/gi, 'TEXT')
    .replace(/TIMESTAMP WITH TIME ZONE DEFAULT NOW\(\)/gi, 'DATETIME DEFAULT CURRENT_TIMESTAMP')
    .replace(/TIMESTAMP WITH TIME ZONE/gi, 'DATETIME')
    .replace(/BOOLEAN/gi, 'INTEGER')
    .replace(/true/g, '1')
    .replace(/false/g, '0')
    .replace(/RETURNING id/gi, '')
    .replace(/CREATE EXTENSION IF NOT EXISTS "pgcrypto";/gi, '');

  // If query was empty after stripping extension
  if (!sqliteQuery.trim()) {
    return { rows: [] };
  }

  // Determine if it's a SELECT or Mutation
  const isSelect = /^\s*SELECT/i.test(sqliteQuery);

  if (isSelect) {
    const stmt = db.prepare(sqliteQuery);
    if (params && params.length) {
      stmt.bind(params);
    }
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return { rows };
  } else {
    db.run(sqliteQuery, params);
    try {
      if (activeDbPath) {
        fs.writeFileSync(activeDbPath, Buffer.from(db.export()));
      }
    } catch (_) {}
    return { rows: [], rowCount: 1 };
  }
}

function generateId() {
  return crypto.randomUUID();
}

module.exports = {
  query,
  generateId,
  isSqlite: () => isUsingSqlite
};
