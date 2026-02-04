import { NextResponse } from "next/server";
import { ensureSchema, pool } from "@/lib/db";

const isAuthorized = (request: Request) => {
  const password = request.headers.get("x-admin-password");
  return password && password === process.env.ADMIN_PASSWORD;
};

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  await ensureSchema();

  type ResponseRow = {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    score: number;
    level: string;
    created_at: string;
  };

  const { rows } = await pool.query<ResponseRow>(
    `
      SELECT id, name, email, phone, score, level, created_at
      FROM quiz_responses
      ORDER BY created_at DESC
      LIMIT 200
    `
  );

  const typedRows = rows as ResponseRow[];

  return NextResponse.json(
    typedRows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      score: row.score,
      level: row.level,
      createdAt: row.created_at,
    }))
  );
}
