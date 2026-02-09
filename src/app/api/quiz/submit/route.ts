import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import nodemailer from "nodemailer";
import { ensureSchema, pool } from "@/lib/db";
import { buildReport, calculateScore, getLevel } from "@/lib/quiz-engine";
import { getQuizById } from "@/lib/quizzes";

export const runtime = "nodejs";

type SubmitPayload = {
  quizId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  responses: { id: string; value: number }[];
};

type NotificationPayload = {
  name: string;
  email: string | null;
  phone: string | null;
  score: number;
  level: string;
  quizTitle: string;
  createdAt: string;
};

const isValidResponses = (
  responses: { id: string; value: number }[],
  expected: number,
  questionIds: Set<string>
) =>
  Array.isArray(responses) &&
  responses.length === expected &&
  responses.every(
    (item) =>
      questionIds.has(item.id) &&
      Number.isFinite(item.value) &&
      item.value >= 0 &&
      item.value <= 4
  );

const getAdminUrl = () =>
  process.env.ADMIN_DASHBOARD_URL ||
  "https://instituto-up-quiz.vercel.app/admin";

const buildNotificationText = (payload: NotificationPayload) => {
  const contactLines = [
    payload.email ? `Email: ${payload.email}` : null,
    payload.phone ? `Telefone: ${payload.phone}` : null,
  ].filter(Boolean);

  return [
    "Nova resposta recebida",
    "",
    `Nome: ${payload.name}`,
    ...contactLines,
    `Quiz: ${payload.quizTitle}`,
    `Data: ${payload.createdAt}`,
    "",
    `Admin: ${getAdminUrl()}`,
  ].join("\n");
};

const sendNotificationEmail = async (payload: NotificationPayload) => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.NOTIFY_EMAIL_TO || "leonardokiorra12@gmail.com";
  const from = process.env.NOTIFY_EMAIL_FROM || user;

  if (!host || !port || !user || !pass || !from) {
    console.warn("Email nao configurado. Defina SMTP_* para enviar aviso.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    to,
    from,
    subject: `Novo quiz: ${payload.name}`,
    text: buildNotificationText(payload),
  });
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

    const questionMap = new Map(
      quiz.questionPool.map((question) => [question.id, question])
    );

    if (
      !isValidResponses(
        body.responses,
        quiz.totalQuestions,
        new Set(questionMap.keys())
      )
    ) {
      return NextResponse.json(
        { message: "Respostas inválidas." },
        { status: 400 }
      );
    }

    const answers = body.responses.map((item) => item.value);
    const questionsUsed = body.responses
      .map((item) => questionMap.get(item.id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    if (questionsUsed.length !== body.responses.length) {
      return NextResponse.json(
        { message: "Respostas inválidas." },
        { status: 400 }
      );
    }

    const score = calculateScore(answers);
    const level = getLevel(score);
    const report = buildReport({
      name: body.name,
      quiz,
      answers,
      questionsUsed,
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
        JSON.stringify(body.responses),
        score,
        level,
        report,
      ]
    );

    const createdAt = new Date().toLocaleString("pt-BR");
    try {
      await sendNotificationEmail({
        name: body.name.trim(),
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
        score,
        level,
        quizTitle: quiz.title,
        createdAt,
      });
    } catch (notifyError) {
      console.error("Falha ao enviar notificacao:", notifyError);
    }

    return NextResponse.json({ id });
  } catch (error) {
    console.error("Erro ao salvar respostas do quiz:", error);
    return NextResponse.json(
      { message: "Não foi possível salvar suas respostas." },
      { status: 500 }
    );
  }
}
