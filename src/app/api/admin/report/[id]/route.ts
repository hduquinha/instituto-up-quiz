import { NextResponse } from "next/server";
import { ensureSchema, pool } from "@/lib/db";
import { generateReportPdf, type ReportResponse } from "@/lib/report-pdf";
import { getQuizById } from "@/lib/quizzes";

export const runtime = "nodejs";

const isAuthorized = (request: Request) => {
  const password = request.headers.get("x-admin-password");
  if (password && password === process.env.ADMIN_PASSWORD) {
    return true;
  }
  const url = new URL(request.url);
  const queryPassword = url.searchParams.get("password");
  return Boolean(
    queryPassword && queryPassword === process.env.ADMIN_PASSWORD
  );
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
  const quizId = String(rows[0].quiz_id || "ansiedade");

  /* Questionários abertos têm quiz_id prefixado com "aberto-" */
  const isOpen = quizId.startsWith("aberto-");
  const realQuizId = isOpen ? quizId.replace("aberto-", "") : quizId;
  const quiz = getQuizById(realQuizId);

  if (!quiz) {
    return NextResponse.json(
      { message: "Quiz não encontrado." },
      { status: 404 }
    );
  }

  const rawAnswers = rows[0].answers as unknown;
  const parsedAnswers =
    typeof rawAnswers === "string" ? JSON.parse(rawAnswers) : rawAnswers;

  /* Para questionários abertos, gerar PDF com o relatório de texto salvo */
  if (isOpen) {
    const reportText = rows[0].report as string;
    const { generateOpenReportPdf } = await import("@/lib/report-pdf");
    const pdf = await generateOpenReportPdf({
      name,
      quizTitle: quiz.title,
      quizId: realQuizId,
      score,
      reportText,
    });

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=relatorio-escrito-${
          name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "quiz"
        }.pdf`,
      },
    });
  }

  const responses = Array.isArray(parsedAnswers)
    ? parsedAnswers.map((item, index) => {
        if (typeof item === "number") {
          return { id: quiz.questionPool[index]?.id ?? "", value: item };
        }

        return item as ReportResponse;
      })
    : [];
  const questionMap = new Map(
    quiz.questionPool.map((question) => [question.id, question])
  );
  const questions = responses
    .map((item) => questionMap.get(item.id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const pdf = await generateReportPdf({
    name,
    quizTitle: quiz.title,
    quizId: realQuizId,
    score,
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
