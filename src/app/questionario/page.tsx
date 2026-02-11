import Link from "next/link";
import { getAllQuizzes } from "@/lib/quizzes";

const quizEmoji: Record<string, string> = {
  ansiedade: "🧠",
  comunicacao: "🎤",
  vendas: "💰",
};

const quizGradient: Record<string, string> = {
  ansiedade: "from-violet-600 to-indigo-600",
  comunicacao: "from-sky-600 to-cyan-500",
  vendas: "from-emerald-600 to-teal-500",
};

export default function QuestionarioIndexPage() {
  const quizzes = getAllQuizzes();

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 sm:py-14 lg:py-16">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-10 sm:mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Questionários disponíveis
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Qual área você quer diagnosticar?
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-300 sm:text-lg">
            Cada questionário se adapta às suas respostas e gera um relatório
            personalizado com insights que você não teria sozinho.
          </p>
        </header>

        <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
          {quizzes.filter((q) => !q.id.startsWith("aberto-")).map((quiz) => {
            const gradient = quizGradient[quiz.id] ?? "from-slate-600 to-slate-800";
            const emoji = quizEmoji[quiz.id] ?? "📋";

            return (
              <div
                key={quiz.id}
                className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-6 transition hover:border-slate-700 hover:shadow-lg hover:shadow-slate-800/30"
              >
                {/* gradient accent */}
                <div className={`absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-3xl transition group-hover:opacity-20`} />

                <div className="relative z-10">
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-xl shadow-lg`}>
                    {emoji}
                  </div>
                  <h2 className="text-xl font-bold sm:text-2xl">{quiz.title}</h2>
                  <p className="mt-2 text-sm text-slate-300">{quiz.subtitle}</p>
                  <p className="mt-3 text-xs text-amber-400">{quiz.urgencyLine}</p>
                  <p className="mt-1 text-xs text-slate-500">{quiz.socialProof}</p>

                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <Link
                      href={`/questionario/${quiz.slug}`}
                      className={`inline-flex w-full justify-center rounded-xl bg-gradient-to-r ${gradient} px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl sm:w-auto`}
                    >
                      Fazer questionário agora
                    </Link>
                    <Link
                      href={`/questionario/aberto-${quiz.slug}`}
                      className="inline-flex w-full justify-center rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white sm:w-auto"
                    >
                      ✍️ Versão escrita
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
