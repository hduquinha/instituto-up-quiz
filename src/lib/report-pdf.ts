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
  if (score <= 12) return "Padrão geral estável com variações pontuais.";
  if (score <= 24) return "Padrão geral moderado com picos previsíveis.";
  if (score <= 36) return "Padrão geral elevado com impacto frequente.";
  return "Padrão geral intenso com impacto recorrente.";
};

const buildColdReading = (score: number, questions: QuizQuestion[], responses: ReportResponse[]) => {
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
    "Você tende a manter a mente ativa mesmo quando o ambiente está calmo.",
    "Pequenos imprevistos costumam reverberar mais tempo do que o esperado.",
    "Existe um padrão de antecipação que aparece em decisões do dia a dia.",
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
    statements.push("A consistência de rotina tem impacto direto no seu equilíbrio.");
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
  drawSectionTitle("Síntese");
  page.drawRectangle({
    x: margin,
    y: cursorY - 48,
    width: width - margin * 2,
    height: 58,
    color: palette.soft,
  });
  cursorY = drawWrappedText(
    page,
    getSummary(input.score),
    margin + 12,
    cursorY - 10,
    width - margin * 2,
    fontRegular,
    11,
    16,
    palette.ink
  );

  ensureSpace(80);
  drawSectionTitle("Observações gerais");
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

  ensureSpace(120);
  drawSectionTitle(`Mapa de ${input.name}`);

  const categories = buildCategoryScores(input.questions, input.responses);
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

  ensureSpace(40);
  drawSectionTitle("Direção sugerida");
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
