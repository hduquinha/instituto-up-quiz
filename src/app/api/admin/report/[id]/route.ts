import { NextResponse } from "next/server";
import { ensureSchema, pool } from "@/lib/db";
import { generateReportPdf, type ReportResponse } from "@/lib/report-pdf";
import { getLevelLabel } from "@/lib/quiz-engine";
import { getQuizById } from "@/lib/quizzes";

export const runtime = "nodejs";

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
      SELECT report, name, answers, score, level, created_at, quiz_id
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

  const name = rows[0].name as string;
  const score = Number(rows[0].score) || 0;
  const level = String(rows[0].level || "baixo");
  const createdAt = new Date(rows[0].created_at as string);
  const quizId = String(rows[0].quiz_id || "ansiedade");
  const quiz = getQuizById(quizId);

  if (!quiz) {
    return NextResponse.json(
      { message: "Quiz não encontrado." },
      { status: 404 }
    );
  }

  const responses = JSON.parse(rows[0].answers as string) as ReportResponse[];
  const questionMap = new Map(
    quiz.questionPool.map((question) => [question.id, question])
  );
  const questions = responses
    .map((item) => questionMap.get(item.id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const pdf = await generateReportPdf({
    name,
    quizTitle: quiz.title,
    score,
    levelLabel: getLevelLabel(level as any),
    createdAt,
    responses,
    questions,
  });

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=relatorio-${
        name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "") || "quiz"
      }.pdf`,
    },
  });
}
