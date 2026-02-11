"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { QuizDefinition, OpenQuizQuestion } from "@/lib/quizzes";

/* ── Cores de acento por quiz ── */
const quizAccent: Record<string, { from: string; to: string; ring: string; bg: string; text: string }> = {
  ansiedade: { from: "from-violet-600", to: "to-indigo-600", ring: "ring-violet-500/30", bg: "bg-violet-50", text: "text-violet-700" },
  comunicacao: { from: "from-sky-600", to: "to-cyan-500", ring: "ring-sky-500/30", bg: "bg-sky-50", text: "text-sky-700" },
  vendas: { from: "from-emerald-600", to: "to-teal-500", ring: "ring-emerald-500/30", bg: "bg-emerald-50", text: "text-emerald-700" },
};

const defaultAccent = quizAccent.ansiedade;

const insightsByIndex: Record<number, string> = {
  0: "Primeira análise registrada — padrões linguísticos sendo mapeados...",
  1: "Cruzando vocabulário... padrões interessantes surgindo.",
  2: "Análise semântica: padrão claramente identificado.",
  3: "Quase lá — mapeamento textual 80% completo.",
  4: "Última resposta! Seu diagnóstico narrativo está sendo finalizado.",
};

const stepIcons: Record<number, string> = {
  0: "✍️",
  1: "📊",
  2: "🧠",
  3: "⚡",
  4: "✅",
};

type Props = {
  quiz: QuizDefinition;
};

export default function OpenQuizRunner({ quiz }: Props) {
  const questions = quiz.openQuestions ?? [];
  const totalQuestions = questions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [animDir, setAnimDir] = useState<"next" | "prev">("next");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const accent = quizAccent[quiz.id] ?? defaultAccent;
  const isLastQuestion = currentIndex === totalQuestions;
  const question = questions[currentIndex] as OpenQuizQuestion | undefined;
  const currentAnswer = question ? (answers[question.id] ?? "") : "";
  const answeredCount = Object.values(answers).filter((v) => v.trim().length > 0).length;

  const progress = Math.min((Math.max(currentIndex, 0) / totalQuestions) * 100, 100);

  const momentLabel = useMemo(() => {
    if (answeredCount === 0) return "Início";
    if (answeredCount < 2) return "Análise inicial";
    if (answeredCount < 4) return "Padrão em formação";
    return "Diagnóstico avançado";
  }, [answeredCount]);

  const insightMessage = currentAnswer.trim().length > 10
    ? (insightsByIndex[currentIndex] ?? "Leitura registrada.")
    : "";
  const insightIcon = stepIcons[currentIndex] ?? "📌";

  /* Scroll to top on question change */
  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentIndex]);

  /* Auto-focus textarea */
  useEffect(() => {
    if (question && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [currentIndex, question]);

  const handleTextChange = (value: string) => {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const animateTransition = (dir: "next" | "prev", cb: () => void) => {
    setAnimDir(dir);
    setIsTransitioning(true);
    setTimeout(() => {
      cb();
      setIsTransitioning(false);
    }, 200);
  };

  const handleNext = () => {
    if (!question || currentAnswer.trim().length < 3) return;
    animateTransition("next", () => setCurrentIndex((p) => p + 1));
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      animateTransition("prev", () => setCurrentIndex((p) => p - 1));
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim()) { setError("Informe seu nome para gerar o relatório."); return; }
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 11) {
      setError("Informe um telefone válido com DDD. Ex: (13) 99722-3066");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/questionario/aberto/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          name: name.trim(),
          phone: digits,
          answers,
        }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { message?: string };
        throw new Error(d.message || "Erro ao enviar respostas.");
      }
      const d = (await res.json()) as { id: string };
      setResponseId(d.id);
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao enviar respostas.");
    } finally {
      setLoading(false);
    }
  };

  /* ════════════════════════════════════
     TELA DE SUCESSO
     ════════════════════════════════════ */
  if (submitted) {
    const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER || "5513997223066";
    const waMessage = encodeURIComponent(
      `Olá! Preenchi o questionário escrito "${quiz.title}" e quero receber meu relatório.\n\nNome: ${name}\nID: ${responseId}`
    );
    const waLink = `https://wa.me/${waNumber}?text=${waMessage}`;

    return (
      <div className="animate-fade-in relative overflow-hidden rounded-3xl border border-white/10 bg-white p-6 shadow-2xl sm:p-10">
        <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-gradient-to-br from-green-200/40 to-emerald-100/30 blur-3xl" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/25">
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-slate-900 sm:text-3xl">
            Sua análise está pronta!
          </h2>
          <p className="mt-3 max-w-md text-sm text-slate-500 sm:text-base">
            Sua análise escrita foi processada. Clique abaixo para receber seu relatório personalizado.
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 flex w-full max-w-sm items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-green-600/20 transition-all hover:scale-[1.02] hover:shadow-xl sm:text-lg"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Receber relatório no WhatsApp
          </a>
          <p className="mt-5 text-xs text-slate-400">
            Você será redirecionado para o WhatsApp com uma mensagem pronta.
          </p>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════
     TELA DE DADOS (formulário)
     ════════════════════════════════════ */
  if (isLastQuestion) {
    return (
      <div className="animate-fade-in relative overflow-hidden rounded-3xl border border-white/10 bg-white p-6 shadow-2xl sm:p-10">
        <div className={`pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br ${accent.from} ${accent.to} opacity-10 blur-3xl`} />
        <div className="relative z-10">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${accent.from} ${accent.to} text-white shadow-lg`}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Análise textual em processamento</h2>
              <p className="mt-1 text-sm text-slate-500">Padrões linguísticos identificados nas suas respostas.</p>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <span className="text-lg">⏳</span>
            <p className="text-sm font-medium text-amber-800">Seu relatório expira em 24 horas. Garanta o seu agora.</p>
          </div>

          <div className="relative mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100 p-5">
            <div className="space-y-3 blur-sm">
              <div className="h-6 w-40 rounded-full bg-slate-200/80" />
              <div className="h-3 w-full rounded-full bg-slate-200/60" />
              <div className="h-3 w-5/6 rounded-full bg-slate-200/50" />
              <div className="h-3 w-4/6 rounded-full bg-slate-200/40" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`rounded-full bg-gradient-to-r ${accent.from} ${accent.to} px-5 py-2.5 text-xs font-bold uppercase tracking-[0.3em] text-white shadow-lg`}>
                Análise em processamento
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-base font-bold text-slate-900 sm:text-lg">Complete seus dados para liberar</h3>
            <p className="mt-1 text-sm text-slate-500">Preencha nome e WhatsApp para receber o diagnóstico.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                <span>Nome</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 focus:outline-none"
                  placeholder="Seu nome completo"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                <span>WhatsApp</span>
                <input
                  value={phone}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "").slice(0, 11);
                    let f = raw;
                    if (raw.length > 6) f = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
                    else if (raw.length > 2) f = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
                    else if (raw.length > 0) f = `(${raw}`;
                    setPhone(f);
                  }}
                  inputMode="tel"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 focus:outline-none"
                  placeholder="(13) 99722-3066"
                />
                <span className="text-xs text-slate-400">Você receberá seu relatório neste número.</span>
              </label>
            </div>

            {error && (
              <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">{error}</p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-green-600/20 transition-all hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 sm:text-lg"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {loading ? "Analisando respostas..." : "Receber meu diagnóstico agora"}
            </button>

            <p className="mt-3 text-center text-xs text-slate-400">🔒 Seus dados são usados apenas para enviar o relatório.</p>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════
     TELA DE PERGUNTA ABERTA
     ════════════════════════════════════ */
  if (!question) return null;

  const charCount = currentAnswer.length;
  const minChars = 20;
  const isAnswerValid = currentAnswer.trim().length >= 3;

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">
      {/* gradient top bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${accent.from} ${accent.to}`} />

      <div className="p-6 sm:p-8">
        {/* top row: step dots + label */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-500 ${
                  i < currentIndex
                    ? `w-6 bg-gradient-to-r ${accent.from} ${accent.to}`
                    : i === currentIndex
                      ? `w-8 bg-gradient-to-r ${accent.from} ${accent.to} animate-pulse`
                      : "w-2 bg-slate-200"
                }`}
              />
            ))}
          </div>
          <span className={`rounded-full ${accent.bg} px-3 py-1 text-xs font-semibold ${accent.text}`}>
            {momentLabel}
          </span>
        </div>

        {/* progress bar */}
        <div className="mt-5 h-1 w-full rounded-full bg-slate-100">
          <div
            className={`h-1 rounded-full bg-gradient-to-r ${accent.from} ${accent.to} transition-all duration-700 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* question badge */}
        <div className="mt-4 flex items-center gap-2">
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${accent.from} ${accent.to} text-xs font-bold text-white`}>
            ✍️
          </span>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Pergunta {currentIndex + 1} de {totalQuestions} — resposta escrita
          </p>
        </div>

        {/* question + textarea */}
        <div
          className={`transition-all duration-200 ${
            isTransitioning
              ? animDir === "next" ? "translate-x-4 opacity-0" : "-translate-x-4 opacity-0"
              : "translate-x-0 opacity-100"
          }`}
        >
          <h2 className="mt-3 text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
            {question.text}
          </h2>

          <div className="mt-5">
            <textarea
              ref={textAreaRef}
              value={currentAnswer}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={question.placeholder}
              rows={5}
              className={`w-full resize-none rounded-2xl border-2 bg-white px-5 py-4 text-sm text-slate-900 shadow-sm transition-all focus:outline-none sm:text-base ${
                charCount >= minChars
                  ? `border-transparent ring-4 ${accent.ring} focus:ring-4`
                  : "border-slate-100 focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
              }`}
            />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
              <span>
                {charCount < minChars
                  ? `Mínimo ${minChars - charCount} caracteres restantes`
                  : "✓ Resposta válida"}
              </span>
              <span>{charCount} caracteres</span>
            </div>
          </div>
        </div>

        {/* insight feedback */}
        {insightMessage && (
          <div className={`mt-5 flex items-start gap-3 rounded-2xl ${accent.bg} px-4 py-3 animate-fade-in`}>
            <span className="text-lg">{insightIcon}</span>
            <p className={`text-sm font-medium ${accent.text}`}>{insightMessage}</p>
          </div>
        )}

        {/* navigation */}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!isAnswerValid}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${accent.from} ${accent.to} px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 sm:w-auto`}
          >
            {currentIndex === totalQuestions - 1 ? "Ver meu resultado" : "Próxima"}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
