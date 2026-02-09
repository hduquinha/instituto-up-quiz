import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { QuizQuestion } from "@/lib/quizzes";

export type ReportResponse = {
  id: string;
  value: number;
};

type ReportPdfInput = {
  name: string;
  quizTitle: string;
  score: number;
  responses: ReportResponse[];
  questions: QuizQuestion[];
};

const getSummary = (score: number) => {
  if (score <= 12) return "Ritmo emocional estável, com oscilações bem localizadas.";
  if (score <= 24) return "Ritmo moderado, com picos que aparecem em momentos específicos.";
  if (score <= 36) return "Ritmo elevado, com impacto mais frequente no dia a dia.";
  return "Ritmo intenso, com recorrência que pede ajustes estruturais.";
};

const getScoreProfile = (score: number) => {
  if (score <= 12) {
    return {
      label: "Ritmo estável",
      description: "Há boa capacidade de estabilização e recuperação após variações.",
    };
  }
  if (score <= 24) {
    return {
      label: "Ritmo oscilante",
      description: "Oscilações aparecem, mas ainda respondem bem a ajustes simples.",
    };
  }
  if (score <= 36) {
    return {
      label: "Ritmo elevado",
      description: "Sinais ficam mais presentes e pedem atenção contínua.",
    };
  }
  return {
    label: "Ritmo intenso",
    description: "Há recorrência alta e a rotina ganha papel essencial.",
  };
};

const buildColdReading = (
  score: number,
  questions: QuizQuestion[],
  responses: ReportResponse[]
) => {
  const tagStats = new Map<string, { sum: number; count: number }>();
  responses.forEach((response, index) => {
    const question = questions[index];
    question.tags.forEach((tag) => {
      const current = tagStats.get(tag) ?? { sum: 0, count: 0 };
      tagStats.set(tag, { sum: current.sum + response.value, count: current.count + 1 });
    });
  });

  const rankedTags = Array.from(tagStats.entries())
    .map(([tag, stat]) => ({ tag, avg: stat.sum / stat.count }))
    .sort((a, b) => b.avg - a.avg);

  const statements = [
    "A mente permanece em alerta mesmo quando tudo parece sob controle.",
    "Imprevistos menores costumam ecoar mais do que o necessário.",
    "Há um padrão de antecipação que influencia decisões cotidianas.",
  ];

  if (rankedTags[0]?.tag === "sono") {
    statements.push("O descanso nem sempre reduz completamente a carga interna.");
  }
  if (rankedTags[0]?.tag === "controle") {
    statements.push("A necessidade de controle aumenta quando algo foge do plano.");
  }
  if (rankedTags[0]?.tag === "social") {
    statements.push("Interações sociais podem exigir preparo acima do normal.");
  }

  if (score >= 24) {
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
  responses: ReportResponse[]
) => {
  const categoryMap: Record<string, string> = {
    controle: "Controle e previsibilidade",
    foco: "Foco e ruído mental",
    corpo: "Sinais físicos",
    sono: "Ritmo de descanso",
    social: "Interações sociais",
    rotina: "Carga e rotina",
  };

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

const buildActionPlan = (categories: { category: string; average: number }[]) => {
  const tipsByCategory: Record<string, string[]> = {
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
  const profile = getScoreProfile(input.score);
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
    `${profile.label}. ${getSummary(input.score)}`,
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
  buildColdReading(input.score, input.questions, input.responses).forEach((item) => {
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

  const categories = buildCategoryScores(input.questions, input.responses);
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
  buildActionPlan(categories).forEach((item) => {
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
  cursorY = drawWrappedText(
    page,
    "Planos guiados e materiais estruturados costumam reduzir picos e estabilizar a rotina. Se deseja acelerar resultados, priorize um passo a passo com foco em ansiedade.",
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
