import { notFound } from "next/navigation";
import QuizRunner from "@/components/QuizRunner";
import OpenQuizRunner from "@/components/OpenQuizRunner";
import { getQuizBySlug } from "@/lib/quizzes";

const quizGradient: Record<string, string> = {
  ansiedade: "from-violet-600 to-indigo-600",
  comunicacao: "from-sky-600 to-cyan-500",
  vendas: "from-emerald-600 to-teal-500",
};

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function QuestionarioPage({ params }: Props) {
  const { slug } = await params;

  /* ── Detectar se é questionário aberto ── */
  const isOpen = slug.startsWith("aberto-");
  const realSlug = isOpen ? slug.replace("aberto-", "") : slug;
  const quiz = getQuizBySlug(realSlug);

  if (!quiz) {
    notFound();
  }

  const gradient = quizGradient[quiz.id] ?? "from-slate-600 to-slate-800";

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 sm:py-16">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
        <header>
          <div className="flex items-center gap-3">
            <div className={`h-1.5 w-10 rounded-full bg-gradient-to-r ${gradient}`} />
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              {isOpen ? "Questionário escrito" : "Questionário interativo"}
            </p>
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {quiz.title}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-300 sm:text-lg">
            {quiz.subtitle}
          </p>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            {quiz.description}
          </p>
          <p className="mt-3 text-sm font-medium text-amber-400">
            {quiz.hookLine}
          </p>
        </header>

        {isOpen ? <OpenQuizRunner quiz={quiz} /> : <QuizRunner quiz={quiz} />}
      </div>
    </div>
  );
}
