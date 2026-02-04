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
  "Padrão discreto identificado.",
  "Sinal pontual observado.",
  "Padrão consistente detectado.",
  "Sinal elevado nesta área.",
  "Sinal crítico nesta área.",
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
    if (partialScore <= answeredCount * 1.2) return "Leitura estável";
    if (partialScore <= answeredCount * 2.4) return "Leitura moderada";
    if (partialScore <= answeredCount * 3.2) return "Leitura elevada";
    return "Leitura crítica";
  }, [answeredCount, partialScore]);

  const routeLabel = useMemo(() => {
    if (answeredCount === 0) return "Rota Alfa";
    if (partialScore <= answeredCount * 1.2) return "Rota Alfa";
    if (partialScore <= answeredCount * 2.4) return "Rota Beta";
    if (partialScore <= answeredCount * 3.2) return "Rota Gama";
    return "Rota Delta";
  }, [answeredCount, partialScore]);

  const unlockedInsight = useMemo(() => {
    if (answeredCount < 3) return "Primeiro padrão em mapeamento.";
    if (answeredCount < 6) return "Zona de leitura estabilizada.";
    if (answeredCount < 9) return "Matriz de hábitos em consolidação.";
    return "Perfil quase fechado. Ajustes finais.";
  }, [answeredCount]);

  const handleSelect = (value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: value,
    }));
  };

  const pickNextQuestion = () => {
    const usedIds = new Set(flow.map((item) => item.id));
    const avgScore = answeredCount > 0 ? score / answeredCount : 0;
    const targetSegment = avgScore <= 1.4
      ? "sutil"
      : avgScore <= 2.6
        ? "moderado"
        : "intenso";

    const primaryPool = quiz.questionPool.filter(
      (item) => item.segment === targetSegment && !usedIds.has(item.id)
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
      <div className="rounded-3xl bg-white p-8 shadow-xl">
        <h2 className="text-2xl font-semibold text-slate-900">
          Obrigado! Seu relatório personalizado está em preparação.
        </h2>
        <p className="mt-4 text-slate-600">
          Nossa equipe enviará o relatório completo em breve para o contato
          informado.
        </p>
      </div>
    );
  }

  if (isLastQuestion) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-xl">
        <h2 className="text-2xl font-semibold text-slate-900">
          Resultado preliminar
        </h2>
        <p className="mt-2 text-slate-600">{getLevelSummary(level)}</p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
            Índice composto
          </p>
          <div className="mt-2 text-3xl font-semibold text-slate-900">
            {score} / {totalQuestions * 4}
          </div>
          <p className="mt-1 text-slate-600">
            Classificação interna:{" "}
            <span className="font-semibold">{getLevelLabel(level)}</span>
          </p>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-slate-900">
            Receba o relatório completo
          </h3>
          <p className="mt-1 text-slate-600">
            Informe seus dados para receber o relatório personalizado com
            recomendações.
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
    <div className="rounded-3xl bg-white p-8 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
        <span>
          Pergunta {currentIndex + 1} de {totalQuestions}
        </span>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {routeLabel}
          </span>
          <span>{momentLabel}</span>
        </div>
      </div>

      <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-slate-900 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h2 className="mt-6 text-2xl font-semibold text-slate-900">
        {question.text}
      </h2>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.3em] text-slate-500">
        Insight desbloqueado: <span className="ml-2 text-slate-700">{unlockedInsight}</span>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-400">
        <span>Mapa</span>
        <div className="flex flex-1 items-center gap-2">
          {["Entrada", "Leitura", "Filtro", "Conclusão"].map((step, index) => {
            const active = currentIndex >= index * 3;
            return (
              <div key={step} className="flex flex-1 items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    active ? "bg-slate-900" : "bg-slate-300"
                  }`}
                />
                <div
                  className={`hidden text-[10px] sm:block ${
                    active ? "text-slate-600" : "text-slate-400"
                  }`}
                >
                  {step}
                </div>
                {index < 3 ? (
                  <div className="h-px flex-1 bg-slate-200" />
                ) : null}
              </div>
            );
          })}
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
              className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
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

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentIndex === 0}
          className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={selectedValue < 0}
          className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
