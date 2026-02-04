import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-14">
        <header className="flex flex-col gap-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Relatórios personalizados
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight">
            Descubra seu nível de ansiedade com um quiz inteligente e receba
            um relatório sob medida.
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            Responda perguntas rápidas, veja um resumo imediato e receba um
            relatório com insights e próximos passos.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/quiz/ansiedade"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              Iniciar quiz agora
            </Link>
            <Link
              href="/quiz"
              className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:border-slate-400"
            >
              Ver todos os quizzes
            </Link>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Experiência gamificada",
              description:
                "Cada resposta ajusta o fluxo para parecer único e pessoal.",
            },
            {
              title: "Relatório imediato",
              description:
                "Você recebe uma análise inicial antes do relatório completo.",
            },
            {
              title: "Dados seguros",
              description:
                "Suas respostas ficam protegidas e usadas apenas para seu relatório.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6"
            >
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-300">{item.description}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
