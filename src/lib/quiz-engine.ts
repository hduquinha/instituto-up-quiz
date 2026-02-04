import type { QuizDefinition } from "@/lib/quizzes";

export type QuizLevel = "baixo" | "moderado" | "alto" | "muito-alto";

export const calculateScore = (answers: number[]) =>
  answers.reduce((total, value) => total + value, 0);

export const getLevel = (score: number): QuizLevel => {
  if (score <= 12) return "baixo";
  if (score <= 24) return "moderado";
  if (score <= 36) return "alto";
  return "muito-alto";
};

export const getLevelLabel = (level: QuizLevel) => {
  switch (level) {
    case "baixo":
      return "Baixo";
    case "moderado":
      return "Moderado";
    case "alto":
      return "Alto";
    default:
      return "Muito alto";
  }
};

export const getLevelSummary = (level: QuizLevel) => {
  switch (level) {
    case "baixo":
      return "Seu perfil indica sinais leves de ansiedade no momento.";
    case "moderado":
      return "Seu perfil indica sinais moderados de ansiedade, que merecem atenção.";
    case "alto":
      return "Seu perfil indica sinais altos de ansiedade, com impacto no dia a dia.";
    default:
      return "Seu perfil indica sinais muito altos de ansiedade. Isso merece cuidado imediato.";
  }
};

export const getRecommendations = (level: QuizLevel) => {
  switch (level) {
    case "baixo":
      return [
        "Mantenha hábitos de sono consistentes.",
        "Inclua pausas conscientes na rotina.",
        "Observe gatilhos que aumentam a preocupação.",
      ];
    case "moderado":
      return [
        "Registre pensamentos recorrentes para aliviar a mente.",
        "Reserve momentos de respiração profunda durante o dia.",
        "Ajuste limites e reduza sobrecarga de tarefas.",
      ];
    case "alto":
      return [
        "Crie rituais de desaceleração antes de dormir.",
        "Evite excesso de cafeína e notícias estressantes.",
        "Considere apoio profissional para estratégias avançadas.",
      ];
    default:
      return [
        "Busque apoio profissional o quanto antes.",
        "Crie uma rede de apoio com pessoas próximas.",
        "Reduza estímulos e priorize autocuidado diário.",
      ];
  }
};

type BuildReportInput = {
  name: string;
  quiz: QuizDefinition;
  answers: number[];
  score: number;
  level: QuizLevel;
};

export const buildReport = ({
  name,
  quiz,
  answers,
  score,
  level,
}: BuildReportInput) => {
  const summary = getLevelSummary(level);
  const recommendations = getRecommendations(level);
  const detailLines = quiz.questions.map((question, index) => {
    const value = answers[index] ?? 0;
    return `${index + 1}. ${question.text} -> ${value}/4`;
  });

  return [
    `Relatório personalizado - ${quiz.title}`,
    `Nome: ${name}`,
    `Pontuação total: ${score}`,
    `Nível identificado: ${getLevelLabel(level)}`,
    "",
    "Resumo:",
    summary,
    "",
    "Recomendações iniciais:",
    ...recommendations.map((item) => `- ${item}`),
    "",
    "Detalhamento das respostas:",
    ...detailLines,
  ].join("\n");
};
