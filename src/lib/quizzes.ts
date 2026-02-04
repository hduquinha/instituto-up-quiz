export type QuizOption = {
  label: string;
  value: number;
};

export type QuizQuestion = {
  id: string;
  text: string;
  options: QuizOption[];
  segment: "base" | "sutil" | "moderado" | "intenso";
};

export type QuizDefinition = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  totalQuestions: number;
  questionPool: QuizQuestion[];
};

const frequencyOptions: QuizOption[] = [
  { label: "Nunca", value: 0 },
  { label: "Raramente", value: 1 },
  { label: "Às vezes", value: 2 },
  { label: "Frequentemente", value: 3 },
  { label: "Quase sempre", value: 4 },
];

const weeklyOptions: QuizOption[] = [
  { label: "0 dias", value: 0 },
  { label: "1–2 dias", value: 1 },
  { label: "3–4 dias", value: 2 },
  { label: "5–6 dias", value: 3 },
  { label: "Todos os dias", value: 4 },
];

const timeToSleepOptions: QuizOption[] = [
  { label: "Até 10 min", value: 0 },
  { label: "10–20 min", value: 1 },
  { label: "20–40 min", value: 2 },
  { label: "40–60 min", value: 3 },
  { label: "Mais de 60 min", value: 4 },
];

const intensityOptions: QuizOption[] = [
  { label: "Nada", value: 0 },
  { label: "Baixo", value: 1 },
  { label: "Médio", value: 2 },
  { label: "Alto", value: 3 },
  { label: "Muito alto", value: 4 },
];

const certaintyOptions: QuizOption[] = [
  { label: "Nunca", value: 0 },
  { label: "Raramente", value: 1 },
  { label: "Em alguns casos", value: 2 },
  { label: "Na maioria", value: 3 },
  { label: "Quase sempre", value: 4 },
];

const ansiedadeQuiz: QuizDefinition = {
  id: "ansiedade",
  slug: "ansiedade",
  title: "Descubra seu nível de ansiedade",
  subtitle: "Um quiz sutil baseado em padrões do dia a dia.",
  description:
    "O quiz ajusta a rota com base nas suas respostas e gera um relatório frio e objetivo.",
  totalQuestions: 12,
  questionPool: [
    {
      id: "base-1",
      text: "Quando algo sai do controle, quanto tempo sua mente leva para desacelerar?",
      options: intensityOptions,
      segment: "base",
    },
    {
      id: "base-2",
      text: "Com que frequência você revisa mensagens ou tarefas só para ter certeza?",
      options: frequencyOptions,
      segment: "base",
    },
    {
      id: "sutil-1",
      text: "Quantas vezes por semana você se distrai só para não pensar em pendências?",
      options: weeklyOptions,
      segment: "sutil",
    },
    {
      id: "sutil-2",
      text: "No fim do dia, você sente o corpo cansado mesmo sem esforço físico?",
      options: frequencyOptions,
      segment: "sutil",
    },
    {
      id: "sutil-3",
      text: "Antes de conversas importantes, você costuma ensaiar mentalmente?",
      options: certaintyOptions,
      segment: "sutil",
    },
    {
      id: "sutil-4",
      text: "Quanto tempo você leva para pegar no sono depois de deitar?",
      options: timeToSleepOptions,
      segment: "sutil",
    },
    {
      id: "sutil-5",
      text: "Em semanas mais corridas, seu apetite muda?",
      options: frequencyOptions,
      segment: "sutil",
    },
    {
      id: "sutil-6",
      text: "Você evita decidir rápido por medo de escolher errado?",
      options: certaintyOptions,
      segment: "sutil",
    },
    {
      id: "sutil-7",
      text: "Você fica inquieto quando precisa esperar sem fazer nada?",
      options: frequencyOptions,
      segment: "sutil",
    },
    {
      id: "moderado-1",
      text: "Com que frequência você acorda já pensando no que precisa resolver?",
      options: frequencyOptions,
      segment: "moderado",
    },
    {
      id: "moderado-2",
      text: "Você sente que precisa estar sempre produtivo para se sentir bem?",
      options: certaintyOptions,
      segment: "moderado",
    },
    {
      id: "moderado-3",
      text: "Você se irrita quando algo simples foge do plano?",
      options: frequencyOptions,
      segment: "moderado",
    },
    {
      id: "moderado-4",
      text: "Você costuma checar portas, itens ou mensagens mais de uma vez?",
      options: frequencyOptions,
      segment: "moderado",
    },
    {
      id: "moderado-5",
      text: "Lugares cheios geram desconforto mesmo quando está tudo bem?",
      options: certaintyOptions,
      segment: "moderado",
    },
    {
      id: "moderado-6",
      text: "Você sente o coração acelerar em situações comuns do dia a dia?",
      options: frequencyOptions,
      segment: "moderado",
    },
    {
      id: "intenso-1",
      text: "Com que frequência seus pensamentos aceleram a ponto de travar decisões?",
      options: frequencyOptions,
      segment: "intenso",
    },
    {
      id: "intenso-2",
      text: "Quantas vezes por semana seu corpo parece em alerta mesmo em casa?",
      options: weeklyOptions,
      segment: "intenso",
    },
    {
      id: "intenso-3",
      text: "Você tem dificuldade para relaxar mesmo quando tudo está sob controle?",
      options: frequencyOptions,
      segment: "intenso",
    },
    {
      id: "intenso-4",
      text: "Você sente um medo difuso sem motivo claro?",
      options: frequencyOptions,
      segment: "intenso",
    },
    {
      id: "intenso-5",
      text: "Você sente necessidade de controlar tudo para se sentir seguro?",
      options: certaintyOptions,
      segment: "intenso",
    },
    {
      id: "intenso-6",
      text: "Preocupações fortes já atrapalharam seu trabalho ou rotina?",
      options: frequencyOptions,
      segment: "intenso",
    },
  ],
};

const quizzes = [ansiedadeQuiz];

export const getQuizBySlug = (slug: string) =>
  quizzes.find((quiz) => quiz.slug === slug);

export const getQuizById = (id: string) =>
  quizzes.find((quiz) => quiz.id === id);

export const getAllQuizzes = () => quizzes;
