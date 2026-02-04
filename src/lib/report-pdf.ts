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

const drawBar = (
  page: any,
  x: number,
  y: number,
  value: number,
  maxValue = 4
) => {
  const width = 180;
  const height = 8;
  const filled = maxValue === 0 ? 0 : (value / maxValue) * width;
  page.drawRectangle({ x, y, width, height, color: rgb(0.9, 0.91, 0.93) });
  page.drawRectangle({ x, y, width: filled, height, color: rgb(0.06, 0.09, 0.16) });
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
  color = rgb(0.2, 0.24, 0.31)
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

  const drawHeading = (text: string) => {
    page.drawText(text, {
      x: margin,
      y: cursorY,
      size: 18,
      font: fontBold,
      color: rgb(0.06, 0.09, 0.16),
    });
    cursorY -= 22;
  };

  const drawSectionTitle = (text: string) => {
    page.drawText(text, {
      x: margin,
      y: cursorY,
      size: 12,
      font: fontBold,
      color: rgb(0.06, 0.09, 0.16),
    });
    cursorY -= 16;
  };

  const ensureSpace = (space: number) => {
    if (cursorY - space < margin) {
      page = pdfDoc.addPage();
      cursorY = height - margin;
    }
  };

  drawHeading("Relatório reservado");
  cursorY = drawWrappedText(
    page,
    "Documento confidencial gerado automaticamente.",
    margin,
    cursorY,
    width - margin * 2,
    fontRegular,
    10,
    14,
    rgb(0.2, 0.24, 0.31)
  );

  ensureSpace(80);
  drawSectionTitle("Identificação");
  cursorY = drawWrappedText(
    page,
    `Nome: ${input.name}`,
    margin,
    cursorY,
    width - margin * 2,
    fontRegular,
    10,
    14
  );
  cursorY = drawWrappedText(
    page,
    `Quiz: ${input.quizTitle}`,
    margin,
    cursorY,
    width - margin * 2,
    fontRegular,
    10,
    18
  );

  ensureSpace(80);
  drawSectionTitle("Síntese");
  cursorY = drawWrappedText(
    page,
    getSummary(input.score),
    margin,
    cursorY,
    width - margin * 2,
    fontRegular,
    11,
    16
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
      16
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
      rgb(0.06, 0.09, 0.16)
    );
    drawBar(page, margin, cursorY - 6, item.average, 4);
    cursorY -= 18;
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
    rgb(0.4, 0.45, 0.52)
  );

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};
