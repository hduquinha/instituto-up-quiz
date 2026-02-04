import type { QuizDefinition, QuizQuestion } from "@/lib/quizzes";

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
      return "Faixa 1";
    case "moderado":
      return "Faixa 2";
    case "alto":
      return "Faixa 3";
    default:
      return "Faixa 4";
  }
};

export const getLevelSummary = (level: QuizLevel) => {
  switch (level) {
    case "baixo":
      return "Seu perfil atual aponta padrões leves de ativação interna.";
    case "moderado":
      return "Seu perfil atual aponta padrões moderados que pedem ajuste.";
    case "alto":
      return "Seu perfil atual aponta padrões altos com impacto na rotina.";
    default:
      return "Seu perfil atual aponta padrões intensos que exigem ação rápida.";
  }
};

export const getRecommendations = (level: QuizLevel) => {
  switch (level) {
    case "baixo":
      return [
        "Mantenha rotinas previsíveis para reduzir ruído mental.",
        "Inclua pausas curtas para recalibrar o foco.",
        "Registre gatilhos que aumentam tensão silenciosa.",
      ];
    case "moderado":
      return [
        "Mapeie horários de pico e reduza sobrecarga.",
        "Use ciclos curtos de respiração para baixar o ritmo.",
        "Crie limites objetivos para tarefas e mensagens.",
      ];
    case "alto":
      return [
        "Implemente rituais fixos de desaceleração noturna.",
        "Reduza estímulos que elevam alerta fisiológico.",
        "Considere apoio especializado para estratégias avançadas.",
      ];
    default:
      return [
        "Busque apoio profissional com prioridade.",
        "Ative uma rede de suporte confiável.",
        "Reduza estímulos e preserve energia diária.",
      ];
  }
};

type BuildReportInput = {
  name: string;
  quiz: QuizDefinition;
  answers: number[];
  questionsUsed: QuizQuestion[];
  score: number;
  level: QuizLevel;
};

export const buildReport = ({
  name,
  quiz,
  answers,
  questionsUsed,
  score,
  level,
}: BuildReportInput) => {
  const summary = getLevelSummary(level);
  const recommendations = getRecommendations(level);
  const tagStats = new Map<string, { sum: number; count: number }>();

  questionsUsed.forEach((question, index) => {
    const value = answers[index] ?? 0;
    question.tags.forEach((tag) => {
      const current = tagStats.get(tag) ?? { sum: 0, count: 0 };
      tagStats.set(tag, {
        sum: current.sum + value,
        count: current.count + 1,
      });
    });
  });

  const rankedTags = Array.from(tagStats.entries())
    .map(([tag, stat]) => ({ tag, avg: stat.sum / stat.count }))
    .sort((a, b) => b.avg - a.avg);

  const coldReading = [
    "Você tende a manter a mente ativa mesmo quando o ambiente está calmo.",
    "Pequenos imprevistos costumam reverberar mais tempo do que o esperado.",
    "Existe um padrão de antecipação que aparece em decisões do dia a dia.",
  ];

  if (rankedTags[0]?.tag === "sono") {
    coldReading.push(
      "Seu descanso não desliga totalmente o estado de alerta interno."
    );
  }
  if (rankedTags[0]?.tag === "controle") {
    coldReading.push(
      "Quando algo foge do plano, a necessidade de controle aumenta."
    );
  }
  if (rankedTags[0]?.tag === "social") {
    coldReading.push(
      "Situações sociais podem exigir mais preparo do que o normal."
    );
  }
  const detailLines = questionsUsed.map((question, index) => {
    const value = answers[index] ?? 0;
    return `${index + 1}. ${question.text} -> ${value}/4`;
  });

  return [
    `Relatório personalizado - ${quiz.title}`,
    `Nome: ${name}`,
    "",
    "Síntese:",
    summary,
    "",
    "Observações gerais:",
    ...coldReading.map((item) => `- ${item}`),
    "",
    "Recomendações iniciais:",
    ...recommendations.map((item) => `- ${item}`),
    "",
    "Direção sugerida:",
    "- Um plano guiado ajuda a reduzir picos e criar previsibilidade diária.",
    "- Materiais estruturados e passo a passo aceleram a estabilização.",
    "",
    "Detalhamento das respostas:",
    ...detailLines,
  ].join("\n");
};
