import PptxGenJS from "pptxgenjs";

type StatementRow = { label: string; values: number[] };
type DebtTableRow = { type: "fidc" | "bancario"; group: string; modality: string; overdue: number; upcoming: number; total: number };
type Report = {
  executiveSummary?: string;
  scenarioReading?: string;
  rootCauses?: string[];
  debtTable?: DebtTableRow[];
  cashImpact?: string;
  priorityRisks?: string[];
  strategicDirection?: string[];
  conclusion?: string;
  kpis?: { label: string; value: string; tone: string }[];
  projectedCashflowStatement?: { periods: string[]; rows: StatementRow[] };
};

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function addTitle(slide: PptxGenJS.Slide, title: string, subtitle?: string) {
  slide.addShape("rect", { x: 0, y: 0, w: 13.33, h: 0.8, fill: { color: "0F172A" }, line: { color: "0F172A" } });
  slide.addText(title, { x: 0.45, y: 0.18, w: 8, h: 0.3, fontSize: 24, bold: true, color: "FFFFFF" });
  if (subtitle) slide.addText(subtitle, { x: 0.45, y: 0.95, w: 9, h: 0.35, fontSize: 12, color: "475569" });
}

export async function buildExecutivePptx(input: { projectName: string; client?: string; score?: number; report?: Report }) {
  const report = input.report || {};
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Ironclaw";
  pptx.subject = "Diagnóstico Executivo Final";
  pptx.title = `Diagnóstico Final - ${input.projectName}`;
  pptx.theme = {
    headFontFace: "Aptos",
    bodyFontFace: "Aptos",
  };

  let slide = pptx.addSlide();
  slide.background = { color: "F8FAFC" };
  slide.addShape("rect", { x: 0, y: 0, w: 13.33, h: 7.5, fill: { color: "F8FAFC" }, line: { color: "F8FAFC" } });
  slide.addText("Diagnóstico Executivo Final", { x: 0.6, y: 1.0, w: 7, h: 0.6, fontSize: 26, bold: true, color: "0F172A" });
  slide.addText(`Cliente: ${input.client || input.projectName}\nProjeto: ${input.projectName}\nScore geral: ${input.score || "-"}`, { x: 0.6, y: 1.9, w: 5.5, h: 1.4, fontSize: 17, color: "334155", breakLine: false });
  slide.addShape("roundRect", { x: 8.2, y: 1.1, w: 4.2, h: 1.6, fill: { color: "DBEAFE" }, line: { color: "BFDBFE" } });
  slide.addText("Entrega consultiva\nFinanceira + executiva", { x: 8.45, y: 1.45, w: 3.6, h: 0.8, fontSize: 18, bold: true, color: "1D4ED8", align: "center" });
  slide.addText(String(report.executiveSummary || "-"), { x: 0.6, y: 4.0, w: 12, h: 2.4, fontSize: 18, color: "334155" });

  slide = pptx.addSlide();
  slide.background = { color: "FFFFFF" };
  addTitle(slide, "Resumo executivo", "Síntese do caso e principais indicadores");
  slide.addText(String(report.executiveSummary || "-"), { x: 0.5, y: 1.45, w: 12.1, h: 1.45, fontSize: 16, color: "334155", margin: 0.04 });
  (report.kpis || []).slice(0, 4).forEach((kpi, i) => {
    slide.addShape("roundRect", { x: 0.5 + i * 3.15, y: 3.25, w: 2.85, h: 1.2, fill: { color: "EFF6FF" }, line: { color: "DBEAFE" } });
    slide.addText(kpi.label, { x: 0.68 + i * 3.15, y: 3.45, w: 2.45, h: 0.25, fontSize: 10, color: "475569", bold: true, align: "center" });
    slide.addText(kpi.value, { x: 0.68 + i * 3.15, y: 3.8, w: 2.45, h: 0.35, fontSize: 18, color: "0F172A", bold: true, align: "center" });
  });
  slide.addText(String(report.scenarioReading || "-"), { x: 0.5, y: 5.0, w: 12.1, h: 1.6, fontSize: 15, color: "334155" });

  slide = pptx.addSlide();
  slide.background = { color: "FFFFFF" };
  addTitle(slide, "Endividamento analítico", "Estrutura consolidada por tipo, projeto e modalidade");
  const debtRows = [["Tipo", "Projeto", "Modalidade", "Vencido", "A Vencer", "Total"], ...((report.debtTable || []).map((row) => [row.type.toUpperCase(), row.group, row.modality, money(row.overdue), money(row.upcoming), money(row.total)]))];
  slide.addTable(debtRows as any, {
    x: 0.45, y: 1.35, w: 12.4, h: 5.4, fontSize: 10,
    border: { pt: 1, color: "CBD5E1" },
  });

  slide = pptx.addSlide();
  slide.background = { color: "FFFFFF" };
  addTitle(slide, "Riscos e direcionamento", "Principais tensões e resposta executiva sugerida");
  slide.addShape("roundRect", { x: 0.55, y: 1.4, w: 5.9, h: 4.9, fill: { color: "FEF2F2" }, line: { color: "FECACA" } });
  slide.addShape("roundRect", { x: 6.85, y: 1.4, w: 5.9, h: 4.9, fill: { color: "F0FDF4" }, line: { color: "BBF7D0" } });
  slide.addText("Riscos prioritários", { x: 0.8, y: 1.65, w: 2.5, h: 0.3, fontSize: 18, bold: true, color: "991B1B" });
  slide.addText((report.priorityRisks || []).map((x) => `• ${x}`).join("\n") || "-", { x: 0.8, y: 2.05, w: 5.1, h: 3.8, fontSize: 14, color: "7F1D1D", breakLine: false });
  slide.addText("Direcionamento estratégico", { x: 7.1, y: 1.65, w: 3.6, h: 0.3, fontSize: 18, bold: true, color: "166534" });
  slide.addText((report.strategicDirection || []).map((x) => `• ${x}`).join("\n") || "-", { x: 7.1, y: 2.05, w: 5.1, h: 3.8, fontSize: 14, color: "166534", breakLine: false });

  slide = pptx.addSlide();
  slide.background = { color: "FFFFFF" };
  addTitle(slide, "Fluxo de caixa projetado", "Visão gerencial do comportamento futuro de caixa");
  const cashRows = [["Linha", ...((report.projectedCashflowStatement?.periods || []))], ...((report.projectedCashflowStatement?.rows || []).map((row) => [row.label, ...row.values.map(money)]))];
  slide.addTable(cashRows as any, { x: 0.45, y: 1.35, w: 12.4, h: 5.4, fontSize: 10, border: { pt: 1, color: "CBD5E1" } });

  slide = pptx.addSlide();
  slide.background = { color: "FFFFFF" };
  addTitle(slide, "Conclusão", "Síntese final para tomada de decisão");
  slide.addShape("roundRect", { x: 0.7, y: 1.6, w: 11.9, h: 4.8, fill: { color: "F8FAFC" }, line: { color: "E2E8F0" } });
  slide.addText(String(report.conclusion || "-"), { x: 1.0, y: 2.0, w: 11.2, h: 3.6, fontSize: 20, color: "334155", valign: "middle" });

  return pptx.write({ outputType: "nodebuffer" }) as Promise<Buffer>;
}
