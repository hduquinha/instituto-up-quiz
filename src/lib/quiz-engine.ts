import type { QuizDefinition, QuizQuestion } from "@/lib/quizzes";

export type QuizLevel = "baixo" | "moderado" | "alto" | "muito-alto";

export const calculateScore = (answers: number[]) =>
  answers.reduce((total, value) => total + value, 0);

/* Faixas calibradas para 5 perguntas (max 20 pontos).
   Mesmo pontuações baixas apontam padrões a observar. */
export const getLevel = (score: number): QuizLevel => {
  if (score <= 5) return "baixo";
  if (score <= 10) return "moderado";
  if (score <= 15) return "alto";
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

/* ───────── Sumários por quiz ───────── */

const ansiedadeSummary: Record<QuizLevel, string> = {
  "baixo":
    "Mesmo com sinais discretos, já existem padrões de ativação que podem crescer silenciosamente se você não agir agora.",
  "moderado":
    "Seus padrões de ansiedade já estão afetando áreas do dia a dia — inclusive as que você ainda não percebeu.",
  "alto":
    "Seu nível de ansiedade já compromete descanso, decisões e relacionamentos de forma consistente.",
  "muito-alto":
    "Seu perfil é de ativação intensa e constante. Sem intervenção, esses padrões tendem a se agravar rapidamente.",
};

const comunicacaoSummary: Record<QuizLevel, string> = {
  "baixo":
    "Mesmo parecendo seguro, existem pontos cegos na sua comunicação que limitam seu potencial sem você perceber.",
  "moderado":
    "Falhas na sua oratória já estão custando oportunidades — a maioria das pessoas só descobre isso tarde demais.",
  "alto":
    "Sua comunicação ativamente prejudica sua imagem profissional e influência sobre as pessoas.",
  "muito-alto":
    "Seu nível de dificuldade com comunicação é crítico e compromete todas as áreas da sua vida profissional.",
};

const vendasSummary: Record<QuizLevel, string> = {
  "baixo":
    "Mesmo com resultados aparentemente normais, existem vazamentos no seu processo que custam vendas todos os meses.",
  "moderado":
    "Seus gaps de vendas já estão impactando seu faturamento — e a tendência é piorar sem correção.",
  "alto":
    "Seu processo de vendas tem falhas estruturais que afastam clientes e destroem margens de lucro.",
  "muito-alto":
    "Seu nível de vendas está crítico — cada abordagem reforça padrões que repelem clientes e queimam oportunidades.",
};

export const getLevelSummary = (level: QuizLevel, quizId?: string) => {
  if (quizId === "comunicacao") return comunicacaoSummary[level];
  if (quizId === "vendas") return vendasSummary[level];
  return ansiedadeSummary[level];
};

/* ───────── Recomendações por quiz ───────── */

const ansiedadeRecs: Record<QuizLevel, string[]> = {
  "baixo": [
    "Mapeie os micro-gatilhos que passam despercebidos — eles acumulam.",
    "Crie rituais de desaceleração antes de dormir para evitar picos silenciosos.",
    "Um acompanhamento especializado identifica o que a autopercepção não vê.",
  ],
  "moderado": [
    "Reduza a sobrecarga de decisões que alimenta o ciclo ansioso.",
    "Implemente técnicas de regulação emocional antes que os padrões se consolidem.",
    "Um plano guiado acelera resultados que rotinas caseiras não alcançam.",
  ],
  "alto": [
    "Rituais fixos de descompressão são urgentes para frear o ciclo atual.",
    "Reduza estímulos que mantêm seu sistema nervoso em alerta constante.",
    "Apoio profissional estruturado é a forma mais rápida de reverter esse quadro.",
  ],
  "muito-alto": [
    "Busque apoio profissional com prioridade — não espere piorar.",
    "Ative uma rede de suporte confiável para os próximos dias.",
    "Cada dia sem ação consolida o padrão. Comece agora.",
  ],
};

const comunicacaoRecs: Record<QuizLevel, string[]> = {
  "baixo": [
    "Grave e reveja suas falas — você vai notar padrões que não percebe ao vivo.",
    "Treine estruturas de fala objetiva para eliminar ruídos na mensagem.",
    "Mesmo comunicadores bons têm pontos cegos que só um diagnóstico profissional revela.",
  ],
  "moderado": [
    "Sua falta de clareza pode estar custando mais do que você imagina.",
    "Trabalhe presença corporal e tom de voz — são 93% da comunicação real.",
    "Um programa estruturado corrige em semanas o que a experiência sozinha não resolve.",
  ],
  "alto": [
    "Suas oportunidades estão sendo capturadas por pessoas que comunicam melhor — não por quem sabe mais.",
    "Priorize treinamento em oratória como investimento profissional urgente.",
    "Um mentor de comunicação encurta anos de tentativa e erro.",
  ],
  "muito-alto": [
    "Seu potencial está completamente travado pela comunicação atual.",
    "Cada apresentação, reunião ou conversa importante reforça o padrão negativo.",
    "Intervenção profissional imediata é o único caminho para destravar sua carreira.",
  ],
};

const vendasRecs: Record<QuizLevel, string[]> = {
  "baixo": [
    "Mapeie em quais etapas do funil você perde mais negócios — o problema está nos detalhes.",
    "Grave suas abordagens de vendas e identifique padrões que você não percebe ao vivo.",
    "Um diagnóstico profissional revela oportunidades que a experiência sozinha não mostra.",
  ],
  "moderado": [
    "Sua taxa de conversão está abaixo do potencial — e cada venda perdida fortalece a concorrência.",
    "Aprenda técnicas de ancoragem de valor antes de falar de preço.",
    "Um método estruturado corrige em semanas o que tentativa e erro não resolve em anos.",
  ],
  "alto": [
    "Você está competindo por preço quando deveria competir por valor — isso destrói margens.",
    "Invista em treinamento de negociação como prioridade máxima de receita.",
    "Cada mês sem ajuste representa milhares em faturamento perdido.",
  ],
  "muito-alto": [
    "Seu processo de vendas precisa de reconstrução completa — continuar assim acelera a queda.",
    "Busque mentoria especializada em vendas com urgência máxima.",
    "Cada abordagem errada reforça o padrão negativo. Pare, corrija e recomece.",
  ],
};

export const getRecommendations = (level: QuizLevel, quizId?: string) => {
  if (quizId === "comunicacao") return comunicacaoRecs[level];
  if (quizId === "vendas") return vendasRecs[level];
  return ansiedadeRecs[level];
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
  const summary = getLevelSummary(level, quiz.id);
  const recommendations = getRecommendations(level, quiz.id);
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

  const coldReading: string[] = [];

  if (quiz.id === "comunicacao") {
    coldReading.push(
      "Você transmite menos autoridade do que imagina em momentos-chave.",
      "Sua mensagem perde impacto antes de chegar ao ponto principal.",
      "Há um desalinhamento entre o que você pensa e o que as pessoas entendem."
    );
    if (rankedTags[0]?.tag === "confianca") {
      coldReading.push("A insegurança transparece na sua voz e postura mais do que você percebe.");
    }
    if (rankedTags[0]?.tag === "presenca") {
      coldReading.push("Sua presença física não reforça suas palavras — ela enfraquece.");
    }
    if (rankedTags[0]?.tag === "clareza") {
      coldReading.push("Falta de estrutura na fala faz você parecer menos preparado do que é.");
    }
    if (rankedTags[0]?.tag === "persuasao") {
      coldReading.push("Pessoas com menos conhecimento que você convencem mais — e isso tem solução.");
    }
  } else if (quiz.id === "vendas") {
    coldReading.push(
      "Você está deixando dinheiro na mesa em quase todas as negociações.",
      "Seu processo de vendas tem etapas invisíveis que afugentam clientes.",
      "A forma como você apresenta valor faz o cliente pensar em preço — não em solução."
    );
    if (rankedTags[0]?.tag === "fechamento") {
      coldReading.push("Você perde vendas no momento decisivo por não ter uma técnica de fechamento clara.");
    }
    if (rankedTags[0]?.tag === "valor") {
      coldReading.push("Seus clientes comparam você por preço porque não percebem diferença de valor.");
    }
    if (rankedTags[0]?.tag === "objecao") {
      coldReading.push("Objeções simples estão derrubando vendas que já deveriam estar fechadas.");
    }
    if (rankedTags[0]?.tag === "mentalidade") {
      coldReading.push("Sua relação com dinheiro e preço sabota suas vendas antes de você abrir a boca.");
    }
    if (rankedTags[0]?.tag === "processo") {
      coldReading.push("Sem um processo claro, cada venda depende de sorte — e sorte não escala.");
    }
  } else {
    coldReading.push(
      "Sua mente permanece em alerta mesmo quando tudo parece sob controle.",
      "Imprevistos menores ecoam dentro de você mais do que o necessário.",
      "Há um padrão de antecipação que influencia suas decisões sem você perceber."
    );
    if (rankedTags[0]?.tag === "sono") {
      coldReading.push("Seu descanso não desliga o estado de alerta — o corpo dorme, a mente não.");
    }
    if (rankedTags[0]?.tag === "controle") {
      coldReading.push("A necessidade de controle consome energia que você nem contabiliza.");
    }
    if (rankedTags[0]?.tag === "social") {
      coldReading.push("Interações sociais drenam mais energia do que deveriam.");
    }
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
    "- Um plano guiado ajuda a corrigir os padrões identificados de forma rápida e definitiva.",
    "- Materiais estruturados e acompanhamento aceleram a transformação.",
    "",
    "Detalhamento das respostas:",
    ...detailLines,
  ].join("\n");
};
