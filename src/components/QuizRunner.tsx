"use client";

import { useMemo, useState } from "react";
import type { QuizDefinition, QuizQuestion } from "@/lib/quizzes";
import {
  calculateScore,
  getLevel,
  getLevelLabel,
  getLevelSummary,
} from "@/lib/quiz-engine";

const insights = [
  "Leitura registrada.",
  "Leitura registrada.",
  "Leitura registrada.",
  "Leitura registrada.",
  "Leitura registrada.",
];

type Props = {
  quiz: QuizDefinition;
};

export default function QuizRunner({ quiz }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flow, setFlow] = useState<QuizQuestion[]>([quiz.questionPool[0]]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const totalQuestions = quiz.totalQuestions;
  const isLastQuestion = currentIndex === totalQuestions;
  const answeredCount = Object.values(answers).filter((value) => value >= 0)
    .length;

  const partialScore = useMemo(() => {
    const currentIds = flow
      .slice(0, Math.max(1, currentIndex + 1))
      .map((question) => question.id);
    return currentIds
      .map((id) => answers[id])
      .filter((value) => value !== undefined && value >= 0)
      .reduce((total, value) => total + value, 0);
  }, [answers, currentIndex, flow]);

  const progress = Math.min(
    (Math.max(currentIndex, 0) / totalQuestions) * 100,
    100
  );

  const question = flow[currentIndex];
  const selectedValue = answers[question?.id] ?? -1;

  const score = useMemo(
    () =>
      calculateScore(
        Object.values(answers).filter((value) => value >= 0)
      ),
    [answers]
  );
  const level = getLevel(score);

  const insightMessage =
    selectedValue >= 0 ? insights[selectedValue] : "";

  const momentLabel = useMemo(() => {
    if (answeredCount === 0) return "Início";
    if (answeredCount < 4) return "Mapa inicial";
    if (answeredCount < 8) return "Mapa em formação";
    return "Mapa avançado";
  }, [answeredCount]);

  const handleSelect = (value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: value,
    }));
  };

  const pickNextQuestion = () => {
    const usedIds = new Set(flow.map((item) => item.id));
    const tagStats = new Map<string, { sum: number; count: number }>();

    flow.forEach((item) => {
      const value = answers[item.id];
      if (value === undefined || value < 0) return;
      item.tags.forEach((tag) => {
        const current = tagStats.get(tag) ?? { sum: 0, count: 0 };
        tagStats.set(tag, {
          sum: current.sum + value,
          count: current.count + 1,
        });
      });
    });

    const rankedTags = Array.from(tagStats.entries())
      .map(([tag, stat]) => ({ tag, avg: stat.sum / stat.count }))
      .sort((a, b) => b.avg - a.avg);

    const preferredTags = rankedTags.slice(0, 2).map((item) => item.tag);
    const primaryPool = quiz.questionPool.filter(
      (item) =>
        !usedIds.has(item.id) &&
        (preferredTags.length === 0 ||
          item.tags.some((tag) => preferredTags.includes(tag)))
    );

    const fallbackPool = quiz.questionPool.filter(
      (item) => !usedIds.has(item.id)
    );

    const pool = primaryPool.length > 0 ? primaryPool : fallbackPool;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const handleNext = () => {
    if (selectedValue < 0) return;
    if (currentIndex < totalQuestions) {
      setCurrentIndex((prev) => prev + 1);
      if (flow.length < currentIndex + 2 && flow.length < totalQuestions) {
        const nextQuestion = pickNextQuestion();
        setFlow((prev) => [...prev, nextQuestion]);
      }
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    if (!name.trim()) {
      setError("Informe seu nome para gerar o relatório.");
      return;
    }

    if (!email.trim() && !phone.trim()) {
      setError("Informe seu email ou telefone para receber o relatório.");
      return;
    }

    const sanitizedAnswers = flow.map((question) =>
      Math.max(0, answers[question.id] ?? 0)
    );
    const responses = flow.map((question, index) => ({
      id: question.id,
      value: sanitizedAnswers[index],
    }));

    setLoading(true);
    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          responses,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        throw new Error(data.message || "Erro ao enviar respostas.");
      }

      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Erro ao enviar respostas."
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
          Obrigado! Seu relatório personalizado está em preparação.
        </h2>
        <p className="mt-4 text-sm text-slate-600 sm:text-base">
          Nossa equipe enviará o relatório completo em breve para o contato
          informado.
        </p>
      </div>
    );
  }

  if (isLastQuestion) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
          Relatório reservado
        </h2>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          Seu resultado completo está pronto, mas só é liberado com o contato.
        </p>

        <div className="relative mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
          <div className="space-y-3 blur-sm">
            <div className="h-6 w-40 rounded-full bg-slate-200" />
            <div className="h-3 w-full rounded-full bg-slate-200" />
            <div className="h-3 w-5/6 rounded-full bg-slate-200" />
            <div className="h-3 w-4/6 rounded-full bg-slate-200" />
            <div className="h-3 w-3/6 rounded-full bg-slate-200" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white">
              Relatório bloqueado
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
            Desbloquear relatório
          </h3>
          <p className="mt-1 text-sm text-slate-600 sm:text-base">
            Informe seu contato para liberar o relatório completo no WhatsApp.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col text-sm font-medium text-slate-700">
              Nome
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-slate-400 focus:outline-none"
                placeholder="Seu nome completo"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-slate-700">
              Telefone
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="mt-2 rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-slate-400 focus:outline-none"
                placeholder="(00) 00000-0000"
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-slate-700 sm:col-span-2">
              Email
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-slate-400 focus:outline-none"
                placeholder="seuemail@email.com"
              />
            </label>
          </div>

          {error ? (
            <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="mt-6 w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Enviando..." : "Quero meu relatório"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 sm:text-sm">
        <span>
          Pergunta {currentIndex + 1} de {totalQuestions}
        </span>
        <span>{momentLabel}</span>
      </div>

      <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-slate-900 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h2 className="mt-6 text-xl font-semibold text-slate-900 sm:text-2xl">
        {question.text}
      </h2>

      <div className="mt-4">
        <div className="h-1 w-full rounded-full bg-slate-100">
          <div
            className="h-1 rounded-full bg-slate-900 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {question.options.map((option) => {
          const isSelected = selectedValue === option.value;
          return (
            <button
              key={option.label}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition sm:text-base ${
                isSelected
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {insightMessage ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {insightMessage}
        </div>
      ) : null}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentIndex === 0}
          className="w-full rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={selectedValue < 0}
          className="w-full rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
