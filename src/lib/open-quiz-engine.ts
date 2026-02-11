/**
 * Motor de interpretação para questionários abertos (perguntas escritas).
 *
 * Algoritmo de análise textual:
 * 1. Normaliza o texto (lowercase, remove acentos e pontuação)
 * 2. Conta keywords negativas e positivas por pergunta
 * 3. Calcula score por pergunta (0-4) baseando-se na proporção neg/pos
 * 4. Computa tags mais afetadas para cold reading personalizado
 * 5. Gera relatório com sumário, insights e recomendações
 *
 * O viés é propositalmente negativo — o sistema detecta sinais de
 * dificuldade mesmo em respostas neutras, reforçando a necessidade
 * de acompanhamento profissional.
 */

import type { OpenQuizQuestion, QuizDefinition } from "@/lib/quizzes";
import type { QuizLevel } from "@/lib/quiz-engine";
import { getLevel, getLevelSummary, getRecommendations } from "@/lib/quiz-engine";

/* ── Normalização de texto ── */
const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // remove acentos
    .replace(/[^a-z0-9\s]/g, " ")     // remove pontuação
    .replace(/\s+/g, " ")
    .trim();

/* ── Análise de uma resposta individual ── */
export type OpenAnswerAnalysis = {
  questionId: string;
  text: string;
  negativeHits: string[];
  positiveHits: string[];
  score: number;          // 0-4
  dominantTags: string[];
};

const analyzeAnswer = (
  question: OpenQuizQuestion,
  answer: string
): OpenAnswerAnalysis => {
  const normalized = normalize(answer);
  const words = normalized.split(" ");

  /* Busca keywords (inclui bigramas para expressões compostas) */
  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(`${words[i]} ${words[i + 1]}`);
  }
  const searchPool = [...words, ...bigrams, normalized];

  const negativeHits = question.negativeKeywords.filter((kw) =>
    searchPool.some((w) => w.includes(normalize(kw)))
  );

  const positiveHits = question.positiveKeywords.filter((kw) =>
    searchPool.some((w) => w.includes(normalize(kw)))
  );

  /* Score calculado com viés negativo:
     - Sem menções → score 2 (neutro = leve preocupação)
     - Mais negativas → escala para 3-4
     - Mais positivas → escala para 0-1
     - Respostas muito curtas (<15 chars) → score 3 (evasão = sinal) */
  let score: number;

  if (answer.trim().length < 15) {
    // Resposta muito curta = evasão = sinal negativo
    score = 3;
  } else if (negativeHits.length === 0 && positiveHits.length === 0) {
    // Sem keywords identificadas → assume neutralidade com leve preocupação
    score = 2;
  } else {
    const total = negativeHits.length + positiveHits.length;
    const negRatio = negativeHits.length / total;

    if (negRatio >= 0.8) score = 4;
    else if (negRatio >= 0.6) score = 3;
    else if (negRatio >= 0.4) score = 2;
    else if (negRatio >= 0.2) score = 1;
    else score = 0;

    // Viés negativo: se a resposta é longa com poucos positivos, assume que
    // há preocupação subjacente não capturada pelas keywords
    if (answer.length > 100 && positiveHits.length <= 1 && score < 2) {
      score = 2;
    }
  }

  return {
    questionId: question.id,
    text: answer,
    negativeHits,
    positiveHits,
    score: Math.min(4, Math.max(0, score)),
    dominantTags: question.tags,
  };
};

/* ── Análise completa de todas as respostas ── */
export type OpenQuizResult = {
  analyses: OpenAnswerAnalysis[];
  totalScore: number;
  level: QuizLevel;
  tagRanking: { tag: string; avgScore: number }[];
  summary: string;
  coldReading: string[];
  recommendations: string[];
  insights: string[];
};

export const analyzeOpenQuiz = (
  quiz: QuizDefinition,
  answers: Record<string, string>   // questionId → texto da resposta
): OpenQuizResult => {
  const questions = quiz.openQuestions ?? [];
  const analyses = questions.map((q) =>
    analyzeAnswer(q, answers[q.id] ?? "")
  );

  const totalScore = analyses.reduce((sum, a) => sum + a.score, 0);
  const level = getLevel(totalScore);

  /* Tag ranking */
  const tagStats = new Map<string, { sum: number; count: number }>();
  analyses.forEach((a) => {
    a.dominantTags.forEach((tag) => {
      const c = tagStats.get(tag) ?? { sum: 0, count: 0 };
      tagStats.set(tag, { sum: c.sum + a.score, count: c.count + 1 });
    });
  });

  const tagRanking = Array.from(tagStats.entries())
    .map(([tag, s]) => ({ tag, avgScore: s.sum / s.count }))
    .sort((a, b) => b.avgScore - a.avgScore);

  /* Sumário e recomendações reutilizam o motor existente */
  const summary = getLevelSummary(level, quiz.id);
  const recommendations = getRecommendations(level, quiz.id);

  /* Insights baseados na análise textual */
  const insights = generateInsights(analyses, tagRanking, quiz.id);

  /* Cold reading aprofundado baseado nas respostas escritas */
  const coldReading = generateColdReading(analyses, tagRanking, quiz.id);

  return {
    analyses,
    totalScore,
    level,
    tagRanking,
    summary,
    coldReading,
    recommendations,
    insights,
  };
};

/* ── Gerador de insights personalizados ── */
const generateInsights = (
  analyses: OpenAnswerAnalysis[],
  tagRanking: { tag: string; avgScore: number }[],
  quizId: string
): string[] => {
  const insights: string[] = [];
  const highScoreAnswers = analyses.filter((a) => a.score >= 3);
  const evasiveAnswers = analyses.filter((a) => a.text.trim().length < 15);

  if (evasiveAnswers.length >= 2) {
    insights.push(
      "Respostas curtas ou evasivas em múltiplas questões sugerem desconforto em reconhecer padrões — um sinal importante por si só."
    );
  }

  if (highScoreAnswers.length >= 3) {
    insights.push(
      "A maioria das suas respostas revela padrões consistentes de dificuldade que se reforçam mutuamente."
    );
  }

  const topTag = tagRanking[0]?.tag;
  if (topTag) {
    const tagInsights = getTagInsight(topTag, quizId);
    if (tagInsights) insights.push(tagInsights);
  }

  /* Análise de extensão das respostas */
  const avgLength = analyses.reduce((s, a) => s + a.text.length, 0) / Math.max(analyses.length, 1);
  if (avgLength > 150) {
    insights.push(
      "A extensão das suas respostas indica que esse tema ocupa um espaço significativo na sua mente — mais do que você talvez admita."
    );
  }

  if (insights.length === 0) {
    insights.push(
      "Mesmo em respostas aparentemente neutras, padrões subjacentes foram identificados que merecem atenção."
    );
  }

  return insights;
};

const getTagInsight = (tag: string, quizId: string): string | null => {
  const map: Record<string, Record<string, string>> = {
    ansiedade: {
      controle: "Sua necessidade de controle é um padrão central que consome energia emocional de forma silenciosa.",
      corpo: "Seu corpo está sinalizando sobrecarga — esses sinais físicos tendem a se intensificar.",
      foco: "O ruído mental que você descreve indica uma mente que não desliga — mesmo quando deveria.",
      sono: "A qualidade do seu descanso está comprometida, o que amplifica todos os outros padrões.",
      social: "Situações sociais estão custando mais energia do que deveriam — há um padrão de evitação se formando.",
      rotina: "A sobrecarga da rotina está criando um efeito cascata que afeta múltiplas áreas.",
    },
    comunicacao: {
      confianca: "A insegurança ao se comunicar é o fio condutor que conecta todas as dificuldades relatadas.",
      presenca: "Sua presença ao falar não reforça suas ideias — ela subtrai impacto sem que você perceba.",
      clareza: "A falta de estrutura nas suas falas faz com que mensagens importantes se percam no caminho.",
      impacto: "O impacto da sua comunicação está muito abaixo do seu potencial real.",
      persuasao: "Sua capacidade de influência está limitada por padrões que você pode não enxergar sozinho.",
      voz: "O comportamento vocal que você descreve transparece insegurança automaticamente.",
      preparo: "A falta de preparação estruturada está intensificando a ansiedade comunicativa.",
      estrutura: "Sem estrutura argumentativa, mesmo ideias brilhantes se perdem na execução.",
    },
    vendas: {
      objecao: "A forma como você lida com objeções revela um padrão de rendição que custa vendas todos os meses.",
      fechamento: "O momento do fechamento é onde você mais perde — e o padrão se repete sem correção.",
      diagnostico: "Sem diagnóstico do cliente, você vende no escuro e oferece soluções que não conectam.",
      escuta: "Você fala mais do que deveria nas interações de venda — e isso afasta clientes.",
      valor: "A dificuldade em comunicar valor faz seus clientes focarem apenas em preço.",
      posicionamento: "Sem posicionamento claro, você compete no terreno errado — onde preço é tudo.",
      processo: "A ausência de processo faz cada venda depender de sorte e estado emocional.",
      consistencia: "A falta de consistência impede previsibilidade — você não sabe de onde vem o próximo cliente.",
      mentalidade: "Sua relação emocional com vendas sabota resultados antes mesmo de começar.",
      prospeccao: "O desconforto com prospecção está limitando seu pipeline e criando dependência de poucos clientes.",
    },
  };

  return map[quizId]?.[tag] ?? null;
};

/* ── Cold reading baseado nas respostas abertas ── */
const generateColdReading = (
  analyses: OpenAnswerAnalysis[],
  tagRanking: { tag: string; avgScore: number }[],
  quizId: string
): string[] => {
  const statements: string[] = [];
  const topTags = tagRanking.slice(0, 3).map((t) => t.tag);

  if (quizId === "comunicacao") {
    statements.push(
      "Suas palavras revelam uma desconexão entre o que você quer transmitir e o que os outros percebem.",
      "Há um padrão de autocrítica nas suas respostas que intensifica a insegurança comunicativa."
    );
    if (topTags.includes("confianca")) statements.push("A insegurança que você descreve não é só emocional — ela se manifesta na voz, postura e escolha de palavras.");
    if (topTags.includes("clareza")) statements.push("A dificuldade de organizar pensamentos durante a fala cria a impressão de despreparo — mesmo quando você domina o assunto.");
  } else if (quizId === "vendas") {
    statements.push(
      "O vocabulário que você usa ao descrever vendas revela crenças limitantes sobre dinheiro e valor.",
      "Há um padrão de evitação nos pontos críticos do processo — exatamente onde a venda se decide."
    );
    if (topTags.includes("fechamento")) statements.push("A forma como você descreve o momento de fechar revela desconforto que o cliente percebe — e usa contra você.");
    if (topTags.includes("valor")) statements.push("Suas respostas mostram que você vende características quando deveria vender transformação.");
  } else {
    statements.push(
      "A forma como você descreve suas reações indica que o estado de alerta é mais constante do que você reconhece.",
      "Há uma camada de normalização nas suas respostas — você se acostumou com um nível de tensão que não deveria ser normal."
    );
    if (topTags.includes("corpo")) statements.push("Os sinais físicos que você menciona são a forma do corpo pedir pausa — ele já está no limite.");
    if (topTags.includes("sono")) statements.push("O padrão de sono que você descreve é incompatível com recuperação real — sua mente não desliga.");
  }

  /* Insights baseados em negativos encontrados nas respostas */
  const totalNegHits = analyses.reduce((s, a) => s + a.negativeHits.length, 0);
  if (totalNegHits >= 8) {
    statements.push("A quantidade de sinais identificados nas suas respostas indica um padrão estabelecido que demanda ação imediata.");
  } else if (totalNegHits >= 4) {
    statements.push("Padrões em formação foram detectados — agir agora evita que se consolidem.");
  }

  return statements;
};

/* ── Construir relatório textual ── */
export const buildOpenReport = (
  name: string,
  quiz: QuizDefinition,
  result: OpenQuizResult
): string => {
  const lines: string[] = [];

  lines.push(`RELATÓRIO DE ANÁLISE ESCRITA — ${quiz.title}`);
  lines.push(`Nome: ${name}`);
  lines.push(`Nível: ${result.level.toUpperCase()}`);
  lines.push(`Score: ${result.totalScore}/20`);
  lines.push("");
  lines.push("RESUMO:");
  lines.push(result.summary);
  lines.push("");
  lines.push("OBSERVAÇÕES PRINCIPAIS:");
  result.coldReading.forEach((s) => lines.push(`• ${s}`));
  lines.push("");
  lines.push("INSIGHTS DA ANÁLISE:");
  result.insights.forEach((s) => lines.push(`• ${s}`));
  lines.push("");
  lines.push("RECOMENDAÇÕES:");
  result.recommendations.forEach((r) => lines.push(`• ${r}`));
  lines.push("");
  lines.push("ANÁLISE POR RESPOSTA:");
  result.analyses.forEach((a, i) => {
    const q = quiz.openQuestions?.[i];
    lines.push(`${i + 1}. ${q?.text ?? ""}`);
    lines.push(`   Resposta: "${a.text.substring(0, 200)}${a.text.length > 200 ? "..." : ""}"`);
    lines.push(`   Score: ${a.score}/4 | Sinais: neg=${a.negativeHits.length}, pos=${a.positiveHits.length}`);
    lines.push("");
  });

  return lines.join("\n");
};
