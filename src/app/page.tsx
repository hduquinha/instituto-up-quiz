import Link from "next/link";

const quizCards = [
  {
    slug: "ansiedade",
    title: "Ansiedade",
    desc: "Descubra padrões ocultos que afetam sono, foco e decisões.",
    emoji: "🧠",
    gradient: "from-violet-600 to-indigo-600",
  },
  {
    slug: "comunicacao",
    title: "Comunicação",
    desc: "Identifique falhas invisíveis na oratória, presença e persuasão.",
    emoji: "🎤",
    gradient: "from-sky-600 to-cyan-500",
  },
  {
    slug: "vendas",
    title: "Vendas",
    desc: "Exponha os gargalos que travam seu faturamento e conversão.",
    emoji: "💰",
    gradient: "from-emerald-600 to-teal-500",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 sm:py-14 lg:py-16">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 sm:gap-16">
        <header className="flex flex-col gap-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Diagnósticos personalizados
          </p>
          <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Descubra o que está sabotando seu desempenho — antes que seja
            tarde demais.
          </h1>
          <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
            Questionários rápidos e adaptativos que revelam padrões invisíveis.
            Receba um relatório completo com próximos passos claros.
          </p>
          <p className="max-w-2xl text-sm font-medium text-amber-400">
            ⏳ Relatórios gratuitos por tempo limitado. Mais de 6.000 pessoas
            já fizeram.
          </p>
        </header>

        {/* Quiz cards */}
        <section className="grid gap-5 sm:gap-6 md:grid-cols-3">
          {quizCards.map((card) => (
            <div
              key={card.slug}
              className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-6 transition hover:border-slate-700 hover:shadow-lg hover:shadow-slate-800/30"
            >
              <div className={`pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${card.gradient} opacity-10 blur-3xl transition group-hover:opacity-20`} />
              <div className="relative z-10">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient} text-xl shadow-lg`}>
                  {card.emoji}
                </div>
                <h2 className="text-xl font-bold">{card.title}</h2>
                <p className="mt-2 text-sm text-slate-300">{card.desc}</p>
                <div className="mt-5 flex flex-col gap-2">
                  <Link
                    href={`/questionario/${card.slug}`}
                    className={`inline-flex justify-center rounded-xl bg-gradient-to-r ${card.gradient} px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl`}
                  >
                    Fazer questionário
                  </Link>
                  <Link
                    href={`/questionario/aberto-${card.slug}`}
                    className="inline-flex justify-center rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
                  >
                    ✍️ Versão escrita
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Feature highlights */}
        <section className="grid gap-5 sm:gap-6 md:grid-cols-3">
          {[
            {
              icon: "⚡",
              title: "Adaptativo e inteligente",
              description:
                "As perguntas mudam com base nas suas respostas para revelar exatamente onde estão seus pontos cegos.",
            },
            {
              icon: "📊",
              title: "Relatório personalizado",
              description:
                "Você recebe um diagnóstico único com insights que um teste genérico jamais ofereceria.",
            },
            {
              icon: "🔒",
              title: "Rápido e confidencial",
              description:
                "Apenas 5 perguntas. Seus dados ficam protegidos e são usados exclusivamente para seu relatório.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-800/50 bg-slate-900/30 p-5 sm:p-6"
            >
              <span className="text-2xl">{item.icon}</span>
              <h2 className="mt-3 text-lg font-bold">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-400">{item.description}</p>
            </div>
          ))}
        </section>

        <div className="text-center">
          <Link
            href="/questionario"
            className="inline-flex rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:border-slate-500 hover:bg-slate-900"
          >
            Ver todos os questionários
          </Link>
        </div>
      </main>
    </div>
  );
}
