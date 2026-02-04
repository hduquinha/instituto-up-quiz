export type QuizOption = {
  label: string;
  value: number;
};

export type QuizQuestion = {
  id: string;
  text: string;
  options: QuizOption[];
};

export type QuizDefinition = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  questions: QuizQuestion[];
};

const likertOptions: QuizOption[] = [
  { label: "Nunca", value: 0 },
  { label: "Raramente", value: 1 },
  { label: "Às vezes", value: 2 },
  { label: "Frequentemente", value: 3 },
  { label: "Quase sempre", value: 4 },
];

const ansiedadeQuiz: QuizDefinition = {
  id: "ansiedade",
  slug: "ansiedade",
  title: "Descubra seu nível de ansiedade",
  subtitle: "Responda em poucos minutos e receba um relatório personalizado.",
  description:
    "Este quiz avalia sinais comuns de ansiedade e gera um relatório com insights personalizados.",
  questions: [
    {
      id: "q1",
      text: "Nos últimos 14 dias, com que frequência você sentiu preocupação excessiva sem motivo claro?",
      options: likertOptions,
    },
    {
      id: "q2",
      text: "Você percebe tensão no corpo (ombros, mandíbula) mesmo em momentos de descanso?",
      options: likertOptions,
    },
    {
      id: "q3",
      text: "Seu sono é leve ou interrompido por pensamentos?",
      options: likertOptions,
    },
    {
      id: "q4",
      text: "Você evita situações por medo de que algo dê errado?",
      options: likertOptions,
    },
    {
      id: "q5",
      text: "Você sente seu coração acelerar ou respiração curta em situações do dia a dia?",
      options: likertOptions,
    },
    {
      id: "q6",
      text: "Você tem dificuldade para desligar a mente quando vai descansar?",
      options: likertOptions,
    },
    {
      id: "q7",
      text: "Pequenos problemas parecem grandes demais no momento?",
      options: likertOptions,
    },
    {
      id: "q8",
      text: "Você se irrita ou fica impaciente com facilidade?",
      options: likertOptions,
    },
    {
      id: "q9",
      text: "Você sente necessidade de checar ou controlar coisas repetidamente?",
      options: likertOptions,
    },
    {
      id: "q10",
      text: "Você sente um aperto no peito ou estômago quando pensa no futuro?",
      options: likertOptions,
    },
    {
      id: "q11",
      text: "Você tem dificuldade para se concentrar por estar pensando em várias coisas?",
      options: likertOptions,
    },
    {
      id: "q12",
      text: "Você sente que precisa estar sempre ocupado para não pensar?",
      options: likertOptions,
    },
  ],
};

const quizzes = [ansiedadeQuiz];

export const getQuizBySlug = (slug: string) =>
  quizzes.find((quiz) => quiz.slug === slug);

export const getQuizById = (id: string) =>
  quizzes.find((quiz) => quiz.id === id);

export const getAllQuizzes = () => quizzes;
