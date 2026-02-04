import { NextResponse } from "next/server";
import { ensureSchema, pool } from "@/lib/db";

const isAuthorized = (request: Request) => {
  const password = request.headers.get("x-admin-password");
  return password && password === process.env.ADMIN_PASSWORD;
};

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: Params) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  await ensureSchema();

  const { id } = await params;

  const { rows } = await pool.query(
    `
      SELECT report, name
      FROM quiz_responses
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  if (rows.length === 0) {
    return NextResponse.json(
      { message: "Relatório não encontrado." },
      { status: 404 }
    );
  }

  const report = rows[0].report as string;
  const name = rows[0].name as string;

  return new NextResponse(report, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename=relatorio-${
        name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "") || "quiz"
      }.txt`,
    },
  });
}
