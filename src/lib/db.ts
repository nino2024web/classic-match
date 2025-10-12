import { Pool } from "pg";

declare global {
  var __classicMatchPool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL が設定されていません。PostgreSQL への接続文字列を .env.local などで指定してください。"
    );
  }

  return new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30_000,
  });
}

export function getPool() {
  if (!globalThis.__classicMatchPool) {
    globalThis.__classicMatchPool = createPool();
  }
  return globalThis.__classicMatchPool;
}

export async function query<T = unknown>(text: string, params: unknown[] = []) {
  const pool = getPool();
  return pool.query<T>(text, params);
}
