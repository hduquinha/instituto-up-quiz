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
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [responseId, setResponseId] = useState<string | null>(null);

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

    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 11) {
      setError("Informe um telefone válido com DDD. Ex: (13) 99722-3066");
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
          phone: phone.replace(/\D/g, ""),
          responses,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        throw new Error(data.message || "Erro ao enviar respostas.");
      }

      const data = (await response.json()) as { id: string };
      setResponseId(data.id);
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
    const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER || "5513997223066";
    const waMessage = encodeURIComponent(
      `Olá! Preenchi o quiz "${quiz.title}" e quero receber meu relatório.\n\nNome: ${name}\nID: ${responseId}`
    );
    const waLink = `https://wa.me/${waNumber}?text=${waMessage}`;

    return (
      <div className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="mt-6 text-center text-xl font-semibold text-slate-900 sm:text-2xl">
          Seu relatório está pronto!
        </h2>
        <p className="mt-3 text-center text-sm text-slate-600 sm:text-base">
          Clique no botão abaixo para receber seu relatório completo em PDF
          diretamente no seu WhatsApp.
        </p>

        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-green-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-green-700 sm:text-lg"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Receber relatório no WhatsApp
        </a>

        <p className="mt-4 text-center text-xs text-slate-400">
          Você será redirecionado para o WhatsApp com uma mensagem pronta.
          Basta enviar para receber seu PDF.
        </p>
      </div>
    );
  }

  if (isLastQuestion) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
          Relatorio em processamento
        </h2>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          Seu relatorio esta sendo finalizado. Preencha seus dados para receber.
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
              Relatorio em processamento
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
            Complete seus dados
          </h3>
          <p className="mt-1 text-sm text-slate-600 sm:text-base">
            Preencha seu nome e WhatsApp para receber seu relatório.
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
              WhatsApp (para receber seu relatório)
              <input
                value={phone}
                onChange={(event) => {
                  const raw = event.target.value.replace(/\D/g, "").slice(0, 11);
                  let formatted = raw;
                  if (raw.length > 6) {
                    formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
                  } else if (raw.length > 2) {
                    formatted = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
                  } else if (raw.length > 0) {
                    formatted = `(${raw}`;
                  }
                  setPhone(formatted);
                }}
                inputMode="tel"
                className="mt-2 rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-slate-400 focus:outline-none"
                placeholder="(13) 99722-3066"
              />
              <span className="mt-1 text-xs text-slate-500">Você receberá seu relatório neste número.</span>
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
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-green-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {loading ? "Enviando..." : "Chamar no WhatsApp"}
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
