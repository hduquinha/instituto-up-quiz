import { Pool } from "pg";

type GlobalWithPool = typeof globalThis & {
  pgPool?: Pool;
};

const globalForPool = globalThis as GlobalWithPool;

const sanitizeDatabaseUrl = (value: string) => {
  try {
    const url = new URL(value);
    url.searchParams.delete("sslmode");
    url.searchParams.delete("sslrootcert");
    url.searchParams.delete("sslcert");
    url.searchParams.delete("sslkey");
    return url.toString();
  } catch {
    return value;
  }
};

const buildSslConfig = () => {
  if (!process.env.DATABASE_URL) return undefined;

  if (process.env.DATABASE_CA_CERT) {
    return { ca: process.env.DATABASE_CA_CERT };
  }

  return { rejectUnauthorized: false };
};

export const pool =
  globalForPool.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL
      ? sanitizeDatabaseUrl(process.env.DATABASE_URL)
      : undefined,
    ssl: buildSslConfig(),
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
