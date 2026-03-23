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
};

type Action5w2h = { what?: string; why?: string; who?: string; when?: string; where?: string; how?: string; howMuch?: string };

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function tableFromDebt(rows: DebtTableRow[]) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: ["Tipo", "Projeto", "Modalidade", "Vencido", "A Vencer", "Total"].map((h) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })] })) }),
      ...rows.map((row) => new TableRow({ children: [row.type, row.group, row.modality, money(row.overdue), money(row.upcoming), money(row.total)].map((v) => new TableCell({ children: [new Paragraph(String(v))] })) })),
    ],
  });
}

export async function buildExecutiveDocx(input: { projectName: string; client?: string; score?: number; report?: Report; actions5w2h?: Action5w2h[] }) {
  const report = input.report || {};
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ text: "Diagnóstico Executivo Final", heading: HeadingLevel.TITLE }),
        new Paragraph({ children: [new TextRun({ text: `Cliente: ${input.client || input.projectName}`, bold: true })] }),
        new Paragraph({ children: [new TextRun({ text: `Projeto: ${input.projectName}`, bold: true })] }),
        new Paragraph({ text: `Score: ${input.score || "-"}` }),
        new Paragraph({ text: "" }),
        new Paragraph({ text: "Resumo Executivo", heading: HeadingLevel.HEADING_1 }),
        new Paragraph(String(report.executiveSummary || "-")),
        new Paragraph({ text: "Leitura do Cenário", heading: HeadingLevel.HEADING_1 }),
        new Paragraph(String(report.scenarioReading || "-")),
        new Paragraph({ text: "Causas Raiz", heading: HeadingLevel.HEADING_1 }),
        ...(report.rootCauses || []).map((item) => new Paragraph({ text: item, bullet: { level: 0 } })),
        new Paragraph({ text: "Endividamento Analítico", heading: HeadingLevel.HEADING_1 }),
        tableFromDebt(report.debtTable || []),
        new Paragraph({ text: "Impacto em Caixa", heading: HeadingLevel.HEADING_1 }),
        new Paragraph(String(report.cashImpact || "-")),
        new Paragraph({ text: "Riscos Prioritários", heading: HeadingLevel.HEADING_1 }),
        ...(report.priorityRisks || []).map((item) => new Paragraph({ text: item, bullet: { level: 0 } })),
        new Paragraph({ text: "Direcionamento Estratégico", heading: HeadingLevel.HEADING_1 }),
        ...(report.strategicDirection || []).map((item) => new Paragraph({ text: item, bullet: { level: 0 } })),
        new Paragraph({ text: "Fluxo de Caixa Projetado", heading: HeadingLevel.HEADING_1 }),
        ...((report.projectedCashflowStatement?.rows || []).map((row) => new Paragraph(`${row.label}: ${row.values.map(money).join(" | ")}`))),
        new Paragraph({ text: "Plano 5W2H", heading: HeadingLevel.HEADING_1 }),
        ...((input.actions5w2h || []).flatMap((a) => [
          new Paragraph({ text: String(a.what || "-"), heading: HeadingLevel.HEADING_2 }),
          new Paragraph(`Why: ${a.why || "-"}`),
          new Paragraph(`Who: ${a.who || "-"} | When: ${a.when || "-"}`),
          new Paragraph(`Where: ${a.where || "-"}`),
          new Paragraph(`How: ${a.how || "-"}`),
          new Paragraph(`How much: ${a.howMuch || "-"}`),
        ])),
        new Paragraph({ text: "Conclusão", heading: HeadingLevel.HEADING_1 }),
        new Paragraph(String(report.conclusion || "-")),
      ],
    }],
  });

  return Packer.toBuffer(doc);
}
