import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { QuizQuestion } from "@/lib/quizzes";

export type ReportResponse = {
  id: string;
  value: number;
};

type ReportPdfInput = {
  name: string;
  quizTitle: string;
  quizId?: string;
  score: number;
  responses: ReportResponse[];
  questions: QuizQuestion[];
};

const getSummary = (score: number, quizId?: string) => {
  if (quizId === "vendas") {
    if (score <= 5) return "Existem vazamentos sutis no seu processo que custam vendas todos os meses.";
    if (score <= 10) return "Gaps no processo de vendas já impactam faturamento e conversão de forma visível.";
    if (score <= 15) return "Falhas estruturais nas vendas estão destruindo margens e afastando clientes.";
    return "Nível crítico — cada abordagem reforça padrões que repelem clientes e queimam pipeline.";
  }
  if (quizId === "comunicacao") {
    if (score <= 5) return "Existem falhas sutis na comunicação que limitam seu potencial percebido.";
    if (score <= 10) return "Sua oratória apresenta gaps intermediários que afastam oportunidades.";
    if (score <= 15) return "A comunicação compromete consistentemente sua presença e influência.";
    return "Nível crítico — a comunicação está travando seu crescimento em todas as frentes.";
  }
  if (score <= 5) return "Padrões sutis de ativação já existem e tendem a crescer silenciosamente.";
  if (score <= 10) return "Ritmo moderado, com picos que já afetam decisões e descanso.";
  if (score <= 15) return "Ritmo elevado, com impacto frequente na rotina e relacionamentos.";
  return "Ritmo intenso, com recorrência que exige intervenção estruturada.";
};

const getScoreProfile = (score: number, quizId?: string) => {
  if (quizId === "vendas") {
    if (score <= 5) return { label: "Vendas com vazamentos ocultos", description: "Pequenas falhas no processo acumulam perdas significativas ao longo dos meses." };
    if (score <= 10) return { label: "Vendas oscilantes", description: "O desempenho depende de fatores aleatórios em vez de um método consistente." };
    if (score <= 15) return { label: "Vendas comprometidas", description: "Gaps estruturais impedem crescimento e corroem a margem de lucro." };
    return { label: "Vendas em estado crítico", description: "O processo atual repele clientes e desperdiça oportunidades sistematicamente." };
  }
  if (quizId === "comunicacao") {
    if (score <= 5) return { label: "Comunicação com lacunas ocultas", description: "Pontos cegos existem mesmo quando você acredita estar se comunicando bem." };
    if (score <= 10) return { label: "Comunicação oscilante", description: "A mensagem chega, mas perde impacto nos momentos que mais importam." };
    if (score <= 15) return { label: "Comunicação limitante", description: "Falhas na oratória estão ativamente custando oportunidades profissionais." };
    return { label: "Comunicação crítica", description: "Há uma desconexão profunda entre o que você quer transmitir e o que as pessoas absorvem." };
  }
  if (score <= 5) return { label: "Padrões iniciais detectados", description: "Mesmo com sinais leves, os padrões identificados merecem atenção preventiva." };
  if (score <= 10) return { label: "Ritmo oscilante", description: "Oscilações aparecem e já demandam ajustes para evitar escalada." };
  if (score <= 15) return { label: "Ritmo elevado", description: "Sinais consistentes que pedem atenção contínua e estruturada." };
  return { label: "Ritmo intenso", description: "Recorrência alta que exige ação imediata e suporte profissional." };
};

const buildColdReading = (
  score: number,
  questions: QuizQuestion[],
  responses: ReportResponse[],
  quizId?: string
) => {
  const tagStats = new Map<string, { sum: number; count: number }>();
  responses.forEach((response, index) => {
    const question = questions[index];
    if (!question) return;
    question.tags.forEach((tag) => {
      const current = tagStats.get(tag) ?? { sum: 0, count: 0 };
      tagStats.set(tag, { sum: current.sum + response.value, count: current.count + 1 });
    });
  });

  const rankedTags = Array.from(tagStats.entries())
    .map(([tag, stat]) => ({ tag, avg: stat.sum / stat.count }))
    .sort((a, b) => b.avg - a.avg);

  const statements: string[] = [];

  if (quizId === "comunicacao") {
    statements.push(
      "Você transmite menos autoridade do que imagina em momentos decisivos.",
      "Sua mensagem perde força antes de chegar ao ponto principal.",
      "Existe um desalinhamento entre intenção e percepção na sua comunicação."
    );
    if (rankedTags[0]?.tag === "confianca") statements.push("A insegurança transparece na voz e postura mais do que você percebe.");
    if (rankedTags[0]?.tag === "presenca") statements.push("Sua presença corporal enfraquece a mensagem verbal.");
    if (rankedTags[0]?.tag === "clareza") statements.push("Falta de estrutura faz você parecer menos preparado do que realmente é.");
    if (rankedTags[0]?.tag === "persuasao") statements.push("Pessoas menos capazes que você convencem mais — por falhas na sua oratória.");
  } else if (quizId === "vendas") {
    statements.push(
      "Você está deixando dinheiro na mesa em quase todas as negociações.",
      "Seu processo de vendas tem etapas que afugentam clientes sem você perceber.",
      "A forma como você apresenta valor faz o cliente focar em preço — não em solução."
    );
    if (rankedTags[0]?.tag === "fechamento") statements.push("Vendas que deveriam fechar morrem no momento decisivo por falta de técnica.");
    if (rankedTags[0]?.tag === "valor") statements.push("Clientes comparam por preço porque não percebem sua diferença de valor.");
    if (rankedTags[0]?.tag === "objecao") statements.push("Objeções simples derrubam negociações que já deveriam estar fechadas.");
    if (rankedTags[0]?.tag === "mentalidade") statements.push("Sua relação com preço sabota vendas antes mesmo de você apresentar a proposta.");
    if (rankedTags[0]?.tag === "processo") statements.push("Sem processo claro, cada venda depende de sorte — e sorte não escala.");
  } else {
    statements.push(
      "A mente permanece em alerta mesmo quando tudo parece sob controle.",
      "Imprevistos menores costumam ecoar mais do que o necessário.",
      "Há um padrão de antecipação que influencia decisões cotidianas."
    );
    if (rankedTags[0]?.tag === "sono") statements.push("O descanso não desliga completamente o estado de alerta interno.");
    if (rankedTags[0]?.tag === "controle") statements.push("A necessidade de controle consome energia que você nem contabiliza.");
    if (rankedTags[0]?.tag === "social") statements.push("Interações sociais drenam mais energia do que deveriam.");
  }

  if (score >= 10) {
    statements.push("A consistência da rotina impacta diretamente o seu equilíbrio.");
  }

  return statements;
};

const palette = {
  ink: rgb(0.06, 0.09, 0.16),
  muted: rgb(0.4, 0.45, 0.52),
  soft: rgb(0.93, 0.94, 0.96),
  accent: rgb(0.16, 0.2, 0.28),
  light: rgb(0.98, 0.98, 0.99),
};

const drawBar = (
  page: any,
  x: number,
  y: number,
  value: number,
  maxValue = 4
) => {
  const width = 210;
  const height = 8;
  const filled = maxValue === 0 ? 0 : (value / maxValue) * width;
  page.drawRectangle({ x, y, width, height, color: palette.soft });
  page.drawRectangle({ x, y, width: filled, height, color: palette.accent });
};

const buildCategoryScores = (
  questions: QuizQuestion[],
  responses: ReportResponse[],
  quizId?: string
) => {
  const ansiedadeCategoryMap: Record<string, string> = {
    controle: "Controle e previsibilidade",
    foco: "Foco e ruído mental",
    corpo: "Sinais físicos",
    sono: "Ritmo de descanso",
    social: "Interações sociais",
    rotina: "Carga e rotina",
  };

  const comunicacaoCategoryMap: Record<string, string> = {
    presenca: "Presença e linguagem corporal",
    impacto: "Impacto da mensagem",
    clareza: "Clareza e estrutura",
    confianca: "Confiança e segurança",
    persuasao: "Persuasão e influência",
    voz: "Controle de voz",
    preparo: "Preparo e organização",
    estrutura: "Estrutura argumentativa",
  };

  const vendasCategoryMap: Record<string, string> = {
    objecao: "Tratamento de objeções",
    fechamento: "Técnicas de fechamento",
    diagnostico: "Diagnóstico do cliente",
    escuta: "Escuta ativa",
    valor: "Comunicação de valor",
    posicionamento: "Posicionamento de mercado",
    processo: "Processo de vendas",
    consistencia: "Consistência e previsibilidade",
    mentalidade: "Mentalidade de vendas",
    "prospecção": "Prospecção e pipeline",
  };

  const categoryMap = quizId === "vendas" ? vendasCategoryMap : quizId === "comunicacao" ? comunicacaoCategoryMap : ansiedadeCategoryMap;

  const categoryTotals = new Map<string, { sum: number; count: number }>();

  responses.forEach((response, index) => {
    const question = questions[index];
    question.tags.forEach((tag) => {
      const category = categoryMap[tag] ?? tag;
      const current = categoryTotals.get(category) ?? { sum: 0, count: 0 };
      categoryTotals.set(category, {
        sum: current.sum + response.value,
        count: current.count + 1,
      });
    });
  });

  return Array.from(categoryTotals.entries())
    .map(([category, stat]) => ({
      category,
      average: stat.count === 0 ? 0 : stat.sum / stat.count,
    }))
    .sort((a, b) => b.average - a.average);
};

const buildHighlights = (categories: { category: string; average: number }[]) => {
  const ordered = [...categories].sort((a, b) => b.average - a.average);
  const attention = ordered.slice(0, 2);
  const strengths = ordered.slice(-2).reverse();

  return {
    attention: attention.map(
      (item) => `${item.category}: picos mais frequentes e impacto mais visível.`
    ),
    strengths: strengths.map(
      (item) => `${item.category}: maior estabilidade e recuperação mais rápida.`
    ),
  };
};

const buildActionPlan = (categories: { category: string; average: number }[], quizId?: string) => {
  const ansiedadeTips: Record<string, string[]> = {
    "Controle e previsibilidade": [
      "Crie uma janela diária de planejamento de 15 minutos.",
      "Escolha um único ponto de decisão para evitar ajustes contínuos.",
    ],
    "Foco e ruído mental": [
      "Agrupe tarefas similares em blocos de 25 minutos.",
      "Anote pensamentos repetitivos para descarregar a mente.",
    ],
    "Sinais físicos": [
      "Observe sinais no corpo antes que eles se intensifiquem.",
      "Inclua pausas curtas com respiração 4-6-8 ao longo do dia.",
    ],
    "Ritmo de descanso": [
      "Defina um horário fixo de desaceleração noturna.",
      "Evite telas nos 40 minutos antes de dormir.",
    ],
    "Interações sociais": [
      "Planeje com antecedência situações sociais mais exigentes.",
      "Dê preferência a encontros com duração definida.",
    ],
    "Carga e rotina": [
      "Reduza tarefas paralelas e finalize uma por vez.",
      "Revise compromissos semanais e elimine o que não é essencial.",
    ],
  };

  const comunicacaoTips: Record<string, string[]> = {
    "Presença e linguagem corporal": [
      "Grave-se falando e analise postura, gestos e contato visual.",
      "Mantenha os pés firmes e ombros abertos ao falar.",
    ],
    "Impacto da mensagem": [
      "Comece sempre pela conclusão — depois explique.",
      "Use histórias e exemplos concretos para fixar a mensagem.",
    ],
    "Clareza e estrutura": [
      "Estruture falas em 3 blocos: contexto, ponto principal e ação.",
      "Elimine palavras de preenchimento como 'tipo', 'então', 'né'.",
    ],
    "Confiança e segurança": [
      "Pratique improviso com temas aleatórios por 2 minutos diários.",
      "Prepare 3 pontos-chave antes de qualquer conversa importante.",
    ],
    "Persuasão e influência": [
      "Estude gatilhos de persuasão e aplique em apresentações.",
      "Valide a perspectiva do outro antes de apresentar a sua.",
    ],
    "Controle de voz": [
      "Pratique variação de tom — monotonia mata a atenção.",
      "Faça exercícios de projeção vocal por 5 minutos diários.",
    ],
    "Preparo e organização": [
      "Nunca entre em reunião sem saber seus 3 pontos centrais.",
      "Ensaie a abertura e o fechamento da sua fala.",
    ],
    "Estrutura argumentativa": [
      "Use a estrutura Problema-Causa-Solução para argumentar.",
      "Antecipe objeções e prepare respostas antes da conversa.",
    ],
  };

  const vendasTips: Record<string, string[]> = {
    "Tratamento de objeções": [
      "Antecipe as 5 objeções mais comuns e prepare respostas antes da reunião.",
      "Use a técnica 'sinto, senti, descobri' para desarmar resistências.",
    ],
    "Técnicas de fechamento": [
      "Pratique o fechamento assumido — pare de pedir permissão para vender.",
      "Defina gatilhos de urgência legítimos na sua proposta.",
    ],
    "Diagnóstico do cliente": [
      "Faça pelo menos 5 perguntas antes de falar da sua solução.",
      "Identifique a dor real — ela raramente é o que o cliente diz primeiro.",
    ],
    "Escuta ativa": [
      "Fale no máximo 30% do tempo em reuniões de vendas.",
      "Repita o que o cliente disse antes de oferecer soluções.",
    ],
    "Comunicação de valor": [
      "Apresente resultados e transformação — nunca características.",
      "Use casos de sucesso com números reais para ancorar valor.",
    ],
    "Posicionamento de mercado": [
      "Defina por que o cliente deve escolher você e não o concorrente.",
      "Pare de competir por preço — reposicione sua oferta.",
    ],
    "Processo de vendas": [
      "Documente cada etapa do seu funil e meça conversão em cada uma.",
      "Crie um script flexível para as 3 etapas críticas da venda.",
    ],
    "Consistência e previsibilidade": [
      "Defina metas diárias de prospecção e siga sem exceção.",
      "Acompanhe métricas semanais — o que não é medido não melhora.",
    ],
    "Mentalidade de vendas": [
      "Separe seu valor pessoal do resultado de cada venda.",
      "Trate rejeição como feedback de processo — não como fracasso pessoal.",
    ],
    "Prospecção e pipeline": [
      "Mantenha no mínimo 3x mais leads do que sua meta exige.",
      "Diversifique canais de aquisição — não dependa de um único.",
    ],
  };

  const tipsByCategory = quizId === "vendas" ? vendasTips : quizId === "comunicacao" ? comunicacaoTips : ansiedadeTips;

  const ordered = [...categories].sort((a, b) => b.average - a.average);
  const focus = ordered.slice(0, 2);
  const plan: string[] = [];

  focus.forEach((item) => {
    const tips = tipsByCategory[item.category] ?? [];
    tips.forEach((tip) => {
      if (!plan.includes(tip)) plan.push(tip);
    });
  });

  if (plan.length < 4) {
    plan.push(
      "Inclua uma pausa intencional entre blocos de atividade.",
      "Use lembretes visuais para manter o ritmo ao longo do dia."
    );
  }

  return plan.slice(0, 5);
};

const drawWrappedText = (
  page: any,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  font: any,
  fontSize: number,
  lineHeight: number,
  color = palette.muted
) => {
  const words = text.split(" ");
  let line = "";
  let cursorY = y;

  words.forEach((word, index) => {
    const testLine = line ? `${line} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width > maxWidth && line) {
      page.drawText(line, { x, y: cursorY, size: fontSize, font, color });
      cursorY -= lineHeight;
      line = word;
    } else {
      line = testLine;
    }

    if (index === words.length - 1) {
      page.drawText(line, { x, y: cursorY, size: fontSize, font, color });
      cursorY -= lineHeight;
    }
  });

  return cursorY;
};

export const generateReportPdf = async (input: ReportPdfInput) => {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const margin = 48;
  let cursorY = height - margin;

  const drawHeader = (title: string, subtitle: string) => {
    page.drawRectangle({ x: 0, y: height - 140, width, height: 140, color: palette.ink });
    page.drawText(title, {
      x: margin,
      y: height - 68,
      size: 20,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    page.drawText(subtitle, {
      x: margin,
      y: height - 92,
      size: 10,
      font: fontRegular,
      color: rgb(0.85, 0.88, 0.92),
    });
    cursorY = height - 160;
  };

  const drawSectionTitle = (text: string) => {
    page.drawText(text, {
      x: margin,
      y: cursorY,
      size: 11,
      font: fontBold,
      color: palette.ink,
    });
    cursorY -= 14;
  };

  const ensureSpace = (space: number) => {
    if (cursorY - space < margin) {
      page = pdfDoc.addPage();
      cursorY = height - margin;
    }
  };

  drawHeader("Relatório reservado", "Análise personalizada e confidencial");

  ensureSpace(80);
  drawSectionTitle("Identificação");
  page.drawRectangle({
    x: margin,
    y: cursorY - 40,
    width: width - margin * 2,
    height: 48,
    color: palette.light,
  });
  cursorY = drawWrappedText(
    page,
    `Nome: ${input.name}`,
    margin,
    cursorY - 12,
    width - margin * 2,
    fontRegular,
    10,
    14,
    palette.ink
  );
  cursorY = drawWrappedText(
    page,
    `Quiz: ${input.quizTitle}`,
    margin,
    cursorY,
    width - margin * 2,
    fontRegular,
    10,
    18,
    palette.muted
  );

  ensureSpace(80);
  const quizId = input.quizId;
  const profile = getScoreProfile(input.score, quizId);
  drawSectionTitle("Resumo executivo");
  page.drawRectangle({
    x: margin,
    y: cursorY - 48,
    width: width - margin * 2,
    height: 58,
    color: palette.soft,
  });
  cursorY = drawWrappedText(
    page,
    `${profile.label}. ${getSummary(input.score, quizId)}`,
    margin + 12,
    cursorY - 10,
    width - margin * 2,
    fontRegular,
    11,
    16,
    palette.ink
  );
  cursorY = drawWrappedText(
    page,
    profile.description,
    margin + 12,
    cursorY + 2,
    width - margin * 2,
    fontRegular,
    10,
    14,
    palette.muted
  );

  ensureSpace(80);
  drawSectionTitle("Observações principais");
  buildColdReading(input.score, input.questions, input.responses, quizId).forEach((item) => {
    cursorY = drawWrappedText(
      page,
      `• ${item}`,
      margin,
      cursorY,
      width - margin * 2,
      fontRegular,
      10,
      16,
      palette.muted
    );
  });

  const categories = buildCategoryScores(input.questions, input.responses, quizId);
  const highlights = buildHighlights(categories);

  ensureSpace(90);
  drawSectionTitle("Pontos fortes");
  highlights.strengths.forEach((item) => {
    cursorY = drawWrappedText(
      page,
      `• ${item}`,
      margin,
      cursorY,
      width - margin * 2,
      fontRegular,
      10,
      16,
      palette.muted
    );
  });

  ensureSpace(90);
  drawSectionTitle("Pontos de atenção");
  highlights.attention.forEach((item) => {
    cursorY = drawWrappedText(
      page,
      `• ${item}`,
      margin,
      cursorY,
      width - margin * 2,
      fontRegular,
      10,
      16,
      palette.muted
    );
  });

  ensureSpace(120);
  drawSectionTitle(`Mapa de ${input.name}`);
  categories.forEach((item) => {
    ensureSpace(40);
    cursorY = drawWrappedText(
      page,
      item.category,
      margin,
      cursorY,
      width - margin * 2,
      fontRegular,
      10,
      14,
      palette.ink
    );
    drawBar(page, margin, cursorY - 6, item.average, 4);
    cursorY -= 20;
  });

  ensureSpace(80);
  drawSectionTitle("Plano prático sugerido");
  buildActionPlan(categories, quizId).forEach((item) => {
    cursorY = drawWrappedText(
      page,
      `• ${item}`,
      margin,
      cursorY,
      width - margin * 2,
      fontRegular,
      10,
      16,
      palette.muted
    );
  });

  ensureSpace(40);
  drawSectionTitle("Direção recomendada");
  const directionText = quizId === "vendas"
    ? "Um programa estruturado de vendas corrige gaps que custam milhares por mês. Cada semana sem ajuste é receita perdida para sempre."
    : quizId === "comunicacao"
    ? "Um programa estruturado de oratória corrige em semanas o que a experiência sozinha não resolve em anos. Invista na sua comunicação agora."
    : "Planos guiados e materiais estruturados costumam reduzir picos e estabilizar a rotina. Priorize um acompanhamento com foco nos padrões identificados.";
  cursorY = drawWrappedText(
    page,
    directionText,
    margin,
    cursorY,
    width - margin * 2,
    fontRegular,
    10,
    16
  );
  ensureSpace(40);
  cursorY = drawWrappedText(
    page,
    "Este relatório é informativo e não substitui avaliação profissional.",
    margin,
    cursorY,
    width - margin * 2,
    fontRegular,
    9,
    14,
    palette.muted
  );

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

/* ═══════════════════════════════════════════════════════════
   PDF para questionários ABERTOS (respostas escritas)
   Recebe o relatório de texto gerado pelo open-quiz-engine
   ═══════════════════════════════════════════════════════════ */

type OpenReportPdfInput = {
  name: string;
  quizTitle: string;
  quizId: string;
  score: number;
  reportText: string;
};

export const generateOpenReportPdf = async (input: OpenReportPdfInput) => {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const margin = 48;
  let cursorY = height - margin;

  const ensureSpace = (space: number) => {
    if (cursorY - space < margin) {
      page = pdfDoc.addPage();
      cursorY = height - margin;
    }
  };

  /* Header */
  page.drawRectangle({ x: 0, y: height - 140, width, height: 140, color: palette.ink });
  page.drawText("Relatório de Análise Escrita", {
    x: margin,
    y: height - 68,
    size: 20,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  page.drawText("Análise personalizada e confidencial", {
    x: margin,
    y: height - 92,
    size: 10,
    font: fontRegular,
    color: rgb(0.85, 0.88, 0.92),
  });
  cursorY = height - 160;

  /* Identificação */
  ensureSpace(60);
  page.drawText("Identificação", { x: margin, y: cursorY, size: 11, font: fontBold, color: palette.ink });
  cursorY -= 16;
  cursorY = drawWrappedText(page, `Nome: ${input.name}`, margin, cursorY, width - margin * 2, fontRegular, 10, 14, palette.ink);
  cursorY = drawWrappedText(page, `Quiz: ${input.quizTitle} (versão escrita)`, margin, cursorY, width - margin * 2, fontRegular, 10, 14, palette.muted);
  cursorY = drawWrappedText(page, `Score: ${input.score}/20`, margin, cursorY, width - margin * 2, fontRegular, 10, 14, palette.muted);
  cursorY -= 8;

  /* Conteúdo do relatório — formata cada linha */
  const lines = input.reportText.split("\n");

  for (const line of lines) {
    if (!line.trim()) {
      cursorY -= 8;
      continue;
    }

    ensureSpace(30);

    /* Detectar títulos de seção (em maiúsculas ou com ":") */
    const isTitle = line === line.toUpperCase() && line.length > 3 && !line.startsWith("•") && !line.startsWith("   ");

    if (isTitle) {
      cursorY -= 6;
      page.drawText(line.replace(":", ""), {
        x: margin,
        y: cursorY,
        size: 11,
        font: fontBold,
        color: palette.ink,
      });
      cursorY -= 16;
    } else if (line.startsWith("•") || line.startsWith("   ")) {
      cursorY = drawWrappedText(
        page,
        line,
        margin + (line.startsWith("   ") ? 12 : 0),
        cursorY,
        width - margin * 2 - 12,
        fontRegular,
        9,
        14,
        palette.muted
      );
    } else {
      cursorY = drawWrappedText(
        page,
        line,
        margin,
        cursorY,
        width - margin * 2,
        fontRegular,
        10,
        14,
        palette.ink
      );
    }
  }

  /* Disclaimer */
  ensureSpace(40);
  cursorY -= 10;
  cursorY = drawWrappedText(
    page,
    "Este relatório é informativo e não substitui avaliação profissional.",
    margin,
    cursorY,
    width - margin * 2,
    fontRegular,
    9,
    14,
    palette.muted
  );

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};