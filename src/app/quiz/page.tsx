import Link from "next/link";
import { getAllQuizzes } from "@/lib/quizzes";

export default function QuizIndexPage() {
  const quizzes = getAllQuizzes();

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 sm:py-14 lg:py-16">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-10 sm:mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Quizzes disponíveis
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Escolha seu quiz
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-300 sm:text-lg">
            Cada quiz é personalizado e gera um relatório único para você.
          </p>
        </header>

        <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6"
            >
              <h2 className="text-xl font-semibold sm:text-2xl">{quiz.title}</h2>
              <p className="mt-2 text-sm text-slate-300">{quiz.subtitle}</p>
              <Link
                href={`/quiz/${quiz.slug}`}
                className="mt-5 inline-flex w-full justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 sm:mt-6 sm:w-auto"
              >
                Iniciar agora
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
