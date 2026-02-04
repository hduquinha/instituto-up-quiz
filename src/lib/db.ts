import { Pool } from "pg";

type GlobalWithPool = typeof globalThis & {
  pgPool?: Pool;
};

const globalForPool = globalThis as GlobalWithPool;

export const pool =
  globalForPool.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPool.pgPool = pool;
}

export const ensureSchema = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS quiz_responses (
      id uuid PRIMARY KEY,
      quiz_id text NOT NULL,
      name text NOT NULL,
      email text,
      phone text,
      answers jsonb NOT NULL,
      score integer NOT NULL,
      level text NOT NULL,
      report text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
};
