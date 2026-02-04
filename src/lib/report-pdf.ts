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
  levelLabel: string;
  createdAt: Date;
  responses: ReportResponse[];
  questions: QuizQuestion[];
};

const getColdSummary = (score: number) => {
  if (score <= 12) return "Leitura estável com variações pontuais.";
  if (score <= 24) return "Leitura moderada com picos previsíveis.";
  if (score <= 36) return "Leitura elevada com impacto frequente.";
  return "Leitura crítica com impacto recorrente.";
};

const buildInsights = (score: number) => {
  if (score <= 12)
    return [
      "Ritmo mental tende a estabilizar rápido após estímulos.",
      "Ruído interno pontual, sem padrão contínuo.",
      "Rotina atual sustenta equilíbrio." 
    ];
  if (score <= 24)
    return [
      "Oscilações aparecem em períodos de demanda.",
      "Há sinais de sobrecarga em ciclos curtos.",
      "Ajustes simples podem reduzir picos." 
    ];
  if (score <= 36)
    return [
      "Picos de alerta se repetem com frequência.",
      "Há tendência de antecipação mental constante.",
      "A rotina atual amplia o estado de alerta." 
    ];
  return [
    "O sistema permanece em alerta por longos períodos.",
    "Rotina não está compensando a carga interna.",
    "Intervenção imediata é recomendada." 
  ];
};

const drawBar = (
  page: any,
  x: number,
  y: number,
  value: number
) => {
  const width = 180;
  const height = 8;
  const filled = (value / 4) * width;
  page.drawRectangle({ x, y, width, height, color: rgb(0.9, 0.91, 0.93) });
  page.drawRectangle({ x, y, width: filled, height, color: rgb(0.06, 0.09, 0.16) });
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
    14
  );
  cursorY = drawWrappedText(
    page,
    `Data: ${input.createdAt.toLocaleString("pt-BR")}`,
    margin,
    cursorY,
    width - margin * 2,
    fontRegular,
    10,
    18
  );

  ensureSpace(80);
  drawSectionTitle("Leitura fria");
  cursorY = drawWrappedText(
    page,
    getColdSummary(input.score),
    margin,
    cursorY,
    width - margin * 2,
    fontRegular,
    11,
    16
  );
  cursorY = drawWrappedText(
    page,
    `Classificação interna: ${input.levelLabel}`,
    margin,
    cursorY,
    width - margin * 2,
    fontRegular,
    10,
    18,
    rgb(0.06, 0.09, 0.16)
  );

  ensureSpace(80);
  drawSectionTitle("Sinais observados");
  buildInsights(input.score).forEach((item) => {
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
  drawSectionTitle("Mapa de respostas");

  input.responses.forEach((response, index) => {
    ensureSpace(60);
    const question = input.questions[index];
    cursorY = drawWrappedText(
      page,
      `${index + 1}. ${question.text}`,
      margin,
      cursorY,
      width - margin * 2,
      fontRegular,
      9,
      14,
      rgb(0.06, 0.09, 0.16)
    );
    drawBar(page, margin, cursorY - 6, response.value);
    cursorY -= 20;
  });

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
