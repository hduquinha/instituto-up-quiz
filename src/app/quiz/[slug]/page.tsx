import { notFound } from "next/navigation";
import QuizRunner from "@/components/QuizRunner";
import { getQuizBySlug } from "@/lib/quizzes";

type Props = {
  params: { slug: string };
};

export default function QuizPage({ params }: Props) {
  const { slug } = params;
  const quiz = getQuizBySlug(slug);

  if (!quiz) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
        <header>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Quiz interativo
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            {quiz.title}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-300">
            {quiz.subtitle}
          </p>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            {quiz.description}
          </p>
        </header>

        <QuizRunner quiz={quiz} />
      </div>
    </div>
  );
}
