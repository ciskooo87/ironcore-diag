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

export async function buildExecutivePptx(input: { projectName: string; client?: string; score?: number; report?: Report }) {
  const report = input.report || {};
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Ironclaw";
  pptx.subject = "Diagnóstico Executivo Final";
  pptx.title = `Diagnóstico Final - ${input.projectName}`;

  let slide = pptx.addSlide();
  slide.addText("Diagnóstico Executivo Final", { x: 0.5, y: 0.4, w: 8.5, h: 0.5, fontSize: 26, bold: true, color: "0F172A" });
  slide.addText(`Cliente: ${input.client || input.projectName}\nProjeto: ${input.projectName}\nScore: ${input.score || "-"}`, { x: 0.5, y: 1.1, w: 5.5, h: 1.2, fontSize: 16, color: "334155" });

  slide = pptx.addSlide();
  slide.addText("Resumo Executivo", { x: 0.5, y: 0.4, w: 5, h: 0.4, fontSize: 22, bold: true });
  slide.addText(String(report.executiveSummary || "-"), { x: 0.5, y: 1.0, w: 12, h: 2.2, fontSize: 15, color: "334155", breakLine: false });
  slide.addText("KPIs", { x: 0.5, y: 3.5, w: 2, h: 0.3, fontSize: 18, bold: true });
  (report.kpis || []).slice(0, 4).forEach((kpi, i) => {
    slide.addText(`${kpi.label}\n${kpi.value}`, { x: 0.5 + i * 3.1, y: 4.0, w: 2.8, h: 1.0, fontSize: 14, bold: true, fill: { color: "E2E8F0" }, margin: 0.12 });
  });

  slide = pptx.addSlide();
  slide.addText("Endividamento Analítico", { x: 0.5, y: 0.4, w: 6, h: 0.4, fontSize: 22, bold: true });
  const debtRows = [["Tipo", "Projeto", "Modalidade", "Vencido", "A Vencer", "Total"], ...((report.debtTable || []).map((row) => [row.type, row.group, row.modality, money(row.overdue), money(row.upcoming), money(row.total)]))];
  slide.addTable(debtRows as any, { x: 0.5, y: 1.0, w: 12.2, h: 4.8, fontSize: 10, border: { pt: 1, color: "CBD5E1" } });

  slide = pptx.addSlide();
  slide.addText("Riscos e Direcionamento", { x: 0.5, y: 0.4, w: 6, h: 0.4, fontSize: 22, bold: true });
  slide.addText((report.priorityRisks || []).map((x) => `• ${x}`).join("\n") || "-", { x: 0.5, y: 1.0, w: 5.8, h: 4.5, fontSize: 14, color: "7F1D1D" });
  slide.addText((report.strategicDirection || []).map((x) => `• ${x}`).join("\n") || "-", { x: 6.8, y: 1.0, w: 5.8, h: 4.5, fontSize: 14, color: "0F172A" });

  slide = pptx.addSlide();
  slide.addText("Fluxo de Caixa Projetado", { x: 0.5, y: 0.4, w: 6, h: 0.4, fontSize: 22, bold: true });
  const cashRows = [["Linha", ...((report.projectedCashflowStatement?.periods || []))], ...((report.projectedCashflowStatement?.rows || []).map((row) => [row.label, ...row.values.map(money)]))];
  slide.addTable(cashRows as any, { x: 0.5, y: 1.0, w: 12.2, h: 4.8, fontSize: 10, border: { pt: 1, color: "CBD5E1" } });

  slide = pptx.addSlide();
  slide.addText("Conclusão", { x: 0.5, y: 0.4, w: 3, h: 0.4, fontSize: 22, bold: true });
  slide.addText(String(report.conclusion || "-"), { x: 0.5, y: 1.0, w: 12, h: 3.0, fontSize: 18, color: "334155" });

  return pptx.write({ outputType: "nodebuffer" }) as Promise<Buffer>;
}
