import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { ensureSchema, pool } from "@/lib/db";
import { buildReport, calculateScore, getLevel } from "@/lib/quiz-engine";
import { getQuizById } from "@/lib/quizzes";

export const runtime = "nodejs";

type SubmitPayload = {
  quizId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  answers: number[];
};

const isValidAnswers = (answers: number[], expected: number) =>
  Array.isArray(answers) &&
  answers.length === expected &&
  answers.every((value) => Number.isFinite(value) && value >= 0 && value <= 4);

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
        { message: "Quiz não encontrado." },
        { status: 404 }
      );
    }

    if (!body.name || (!body.email && !body.phone)) {
      return NextResponse.json(
        { message: "Nome e contato são obrigatórios." },
        { status: 400 }
      );
    }

    if (!isValidAnswers(body.answers, quiz.questions.length)) {
      return NextResponse.json(
        { message: "Respostas inválidas." },
        { status: 400 }
      );
    }

    const score = calculateScore(body.answers);
    const level = getLevel(score);
    const report = buildReport({
      name: body.name,
      quiz,
      answers: body.answers,
      score,
      level,
    });

    await ensureSchema();

    const id = randomUUID();
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
        quiz.id,
        body.name.trim(),
        body.email?.trim() || null,
        body.phone?.trim() || null,
        JSON.stringify(body.answers),
        score,
        level,
        report,
      ]
    );

    return NextResponse.json({ id });
  } catch (error) {
    console.error("Erro ao salvar respostas do quiz:", error);
    return NextResponse.json(
      { message: "Não foi possível salvar suas respostas." },
      { status: 500 }
    );
  }
}
