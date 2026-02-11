import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { ensureSchema, pool } from "@/lib/db";
import { analyzeOpenQuiz, buildOpenReport } from "@/lib/open-quiz-engine";
import { getQuizById } from "@/lib/quizzes";

export const runtime = "nodejs";

type SubmitPayload = {
  quizId: string;
  name: string;
  phone: string;
  answers: Record<string, string>;  // questionId → texto
};

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { message: "DATABASE_URL não configurada." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as SubmitPayload;
    const quiz = getQuizById(body.quizId);

    if (!quiz) {
      return NextResponse.json(
        { message: "Questionário não encontrado." },
        { status: 404 }
      );
    }

    if (!quiz.openQuestions || quiz.openQuestions.length === 0) {
      return NextResponse.json(
        { message: "Este questionário não possui versão escrita." },
        { status: 400 }
      );
    }

    const phoneDigits = (body.phone || "").replace(/\D/g, "");
    if (!body.name || phoneDigits.length < 10 || phoneDigits.length > 11) {
      return NextResponse.json(
        { message: "Nome e telefone (WhatsApp) válido são obrigatórios." },
        { status: 400 }
      );
    }

    /* Validar que todas as perguntas foram respondidas */
    const questionIds = new Set(quiz.openQuestions.map((q) => q.id));
    const answeredIds = Object.keys(body.answers ?? {});
    const allAnswered = quiz.openQuestions.every(
      (q) => answeredIds.includes(q.id) && (body.answers[q.id] ?? "").trim().length >= 3
    );

    if (!allAnswered) {
      return NextResponse.json(
        { message: "Todas as perguntas precisam ser respondidas." },
        { status: 400 }
      );
    }

    /* Analisar respostas */
    const result = analyzeOpenQuiz(quiz, body.answers);
    const report = buildOpenReport(body.name, quiz, result);

    await ensureSchema();

    const id = randomUUID();

    /* Salvar no banco — usa a mesma tabela, mas com quiz_id prefixado */
    const openQuizId = `aberto-${quiz.id}`;

    /* Converter respostas para formato de array para o campo answers (jsonb) */
    const answersForDb = quiz.openQuestions.map((q) => ({
      id: q.id,
      text: body.answers[q.id] ?? "",
      score: result.analyses.find((a) => a.questionId === q.id)?.score ?? 0,
    }));

    await pool.query(
      `
        INSERT INTO quiz_responses (
          id,
          quiz_id,
          name,
          email,
          phone,
          answers,
          score,
          level,
          report
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
      [
        id,
        openQuizId,
        body.name.trim(),
        null,
        phoneDigits,
        JSON.stringify(answersForDb),
        result.totalScore,
        result.level,
        report,
      ]
    );

    return NextResponse.json({
      id,
      level: result.level,
      quizTitle: quiz.title,
    });
  } catch (error) {
    console.error("Erro ao salvar respostas do questionário aberto:", error);
    return NextResponse.json(
      { message: "Não foi possível salvar suas respostas." },
      { status: 500 }
    );
  }
}
