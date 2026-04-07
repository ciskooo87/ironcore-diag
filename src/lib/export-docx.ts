import { Document, Packer, Paragraph, HeadingLevel, TextRun, Table, TableRow, TableCell, WidthType } from "docx";

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
  projectedCashflowStatement?: { periods: string[]; rows: StatementRow[] };
  kpis?: { label: string; value: string; tone: string }[];
};

type Action5w2h = { what?: string; why?: string; who?: string; when?: string; where?: string; how?: string; howMuch?: string };

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function sectionTitle(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 260, after: 120 },
    children: [new TextRun({ text, bold: true, color: "0F172A", size: 28 })],
  });
}

function body(text: string) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, color: "334155", size: 22 })],
  });
}

function bullet(text: string) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, color: "334155", size: 22 })],
  });
}

function tableFromDebt(rows: DebtTableRow[]) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: ["Tipo", "Projeto", "Modalidade", "Vencido", "A Vencer", "Total"].map((h) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "0F172A" })] })] })) }),
      ...rows.map((row) => new TableRow({ children: [row.type.toUpperCase(), row.group, row.modality, money(row.overdue), money(row.upcoming), money(row.total)].map((v) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(v), color: "334155" })] })] })) })),
    ],
  });
}

export async function buildExecutiveDocx(input: { projectName: string; client?: string; score?: number; report?: Report; actions5w2h?: Action5w2h[] }) {
  const report = input.report || {};
  const kpis = report.kpis || [];

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ children: [new TextRun({ text: "IRONCORE DIAG", bold: true, color: "667085", size: 20 })], spacing: { after: 120 } }),
        new Paragraph({ text: "Diagnóstico Executivo Final", heading: HeadingLevel.TITLE }),
        body(`Cliente: ${input.client || input.projectName}`),
        body(`Projeto: ${input.projectName}`),
        body(`Score geral: ${input.score || "-"}`),

        sectionTitle("Resumo executivo"),
        body(String(report.executiveSummary || "-")),

        sectionTitle("Leitura do cenário"),
        body(String(report.scenarioReading || "-")),

        ...(kpis.length ? [sectionTitle("KPIs executivos"), ...kpis.flatMap((item) => [
          new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: item.label, bold: true, color: "0F172A", size: 22 })] }),
          body(String(item.value || "-")),
        ])] : []),

        sectionTitle("Causas raiz"),
        ...((report.rootCauses || []).length ? (report.rootCauses || []).map(bullet) : [body("Não consolidado.")]),

        sectionTitle("Riscos prioritários"),
        ...((report.priorityRisks || []).length ? (report.priorityRisks || []).map(bullet) : [body("Não consolidado.")]),

        sectionTitle("Endividamento analítico"),
        tableFromDebt(report.debtTable || []),

        sectionTitle("Impacto em caixa"),
        body(String(report.cashImpact || "-")),

        sectionTitle("Direcionamento estratégico"),
        ...((report.strategicDirection || []).length ? (report.strategicDirection || []).map(bullet) : [body("Não consolidado.")]),

        sectionTitle("Fluxo de caixa projetado"),
        ...((report.projectedCashflowStatement?.rows || []).length
          ? (report.projectedCashflowStatement?.rows || []).map((row) => body(`${row.label}: ${row.values.map(money).join(" | ")}`))
          : [body("Fluxo projetado não consolidado.")]),

        sectionTitle("Plano de ação 5W2H"),
        ...((input.actions5w2h || []).length
          ? (input.actions5w2h || []).flatMap((a) => [
              new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: String(a.what || "-"), bold: true, color: "0F172A", size: 24 })], spacing: { before: 180, after: 80 } }),
              body(`Why: ${a.why || "-"}`),
              body(`Who: ${a.who || "-"} | When: ${a.when || "-"}`),
              body(`Where: ${a.where || "-"}`),
              body(`How: ${a.how || "-"}`),
              body(`How much: ${a.howMuch || "-"}`),
            ])
          : [body("Nenhuma ação estruturada ainda.")]),

        sectionTitle("Conclusão"),
        body(String(report.conclusion || "-")),
      ],
    }],
  });

  return Packer.toBuffer(doc);
}
