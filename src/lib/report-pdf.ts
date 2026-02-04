import PDFDocument from "pdfkit";
import type PDFKit from "pdfkit";
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
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  value: number
) => {
  const width = 140;
  const height = 8;
  const filled = (value / 4) * width;
  doc.roundedRect(x, y, width, height, 4).fill("#E5E7EB");
  doc.roundedRect(x, y, filled, height, 4).fill("#111827");
};

export const generateReportPdf = (input: ReportPdfInput) => {
  const doc = new PDFDocument({ margin: 48 });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk) => chunks.push(chunk));

  doc.fontSize(20).fillColor("#0F172A").text("Relatório reservado", {
    align: "left",
  });

  doc.moveDown(0.5);
  doc
    .fontSize(12)
    .fillColor("#334155")
    .text("Documento confidencial gerado automaticamente.");

  doc.moveDown(1.5);
  doc.fontSize(14).fillColor("#0F172A").text("Identificação");
  doc
    .fontSize(11)
    .fillColor("#475569")
    .text(`Nome: ${input.name}`)
    .text(`Quiz: ${input.quizTitle}`)
    .text(`Data: ${input.createdAt.toLocaleString("pt-BR")}`);

  doc.moveDown(1.5);
  doc.fontSize(14).fillColor("#0F172A").text("Leitura fria");
  doc
    .fontSize(11)
    .fillColor("#475569")
    .text(getColdSummary(input.score));

  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .fillColor("#0F172A")
    .text(`Classificação interna: ${input.levelLabel}`);

  doc.moveDown(1.5);
  doc.fontSize(14).fillColor("#0F172A").text("Sinais observados");
  buildInsights(input.score).forEach((item) => {
    doc.moveDown(0.4);
    doc.fontSize(11).fillColor("#475569").text(`• ${item}`);
  });

  doc.moveDown(1.5);
  doc.fontSize(14).fillColor("#0F172A").text("Mapa de respostas");
  doc.moveDown(0.5);

  input.responses.forEach((response, index) => {
    const question = input.questions[index];
    doc
      .fontSize(10)
      .fillColor("#0F172A")
      .text(`${index + 1}. ${question.text}`, { continued: false });
    drawBar(doc, doc.x, doc.y + 4, response.value);
    doc.moveDown(1.2);
  });

  doc.moveDown(1.5);
  doc
    .fontSize(10)
    .fillColor("#64748B")
    .text(
      "Este relatório é informativo e não substitui avaliação profissional.",
      { align: "left" }
    );

  doc.end();

  return new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
};
