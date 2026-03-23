import ExcelJS from "exceljs";

type StatementRow = { label: string; values: number[] };
type DebtTableRow = { type: "fidc" | "bancario"; group: string; modality: string; overdue: number; upcoming: number; total: number };
type Report = {
  executiveSummary?: string;
  scenarioReading?: string;
  rootCauses?: string[];
  debtAnalysis?: { banks?: string; fidc?: string; consolidated?: string };
  debtTable?: DebtTableRow[];
  cashImpact?: string;
  priorityRisks?: string[];
  strategicDirection?: string[];
  conclusion?: string;
  dreHistoricalStatement?: { periods: string[]; rows: StatementRow[] };
  dreProjectedStatement?: { periods: string[]; rows: StatementRow[] };
  dfcHistoricalStatement?: { periods: string[]; rows: StatementRow[] };
  dfcProjectedStatement?: { periods: string[]; rows: StatementRow[] };
  projectedCashflowStatement?: { periods: string[]; rows: StatementRow[] };
  kpis?: { label: string; value: string; tone: string }[];
};

type Action5w2h = { what?: string; why?: string; who?: string; when?: string; where?: string; how?: string; howMuch?: string };

function addStatementSheet(wb: ExcelJS.Workbook, name: string, statement?: { periods: string[]; rows: StatementRow[] }) {
  const ws = wb.addWorksheet(name);
  if (!statement) {
    ws.addRow([name]);
    ws.addRow([]);
    ws.addRow(["Demonstrativo não consolidado"]);
    return;
  }
  ws.addRow(["Linha", ...statement.periods]);
  statement.rows.forEach((row) => ws.addRow([row.label, ...row.values]));
  ws.columns = [{ width: 28 }, ...statement.periods.map(() => ({ width: 16 }))];
}

export async function buildExecutiveWorkbook(input: {
  projectName: string;
  client?: string;
  score?: number;
  report?: Report;
  actions5w2h?: Action5w2h[];
}) {
  const wb = new ExcelJS.Workbook();
  const report = input.report || {};

  let ws = wb.addWorksheet("Resumo Executivo");
  ws.addRows([
    ["Diagnóstico Executivo Final"],
    [],
    ["Cliente", input.client || input.projectName],
    ["Projeto", input.projectName],
    ["Score", input.score || "-"],
    [],
    ["Resumo executivo", report.executiveSummary || "-"],
    [],
    ["Leitura do cenário", report.scenarioReading || "-"],
    [],
    ["Conclusão", report.conclusion || "-"],
  ]);
  ws.columns = [{ width: 22 }, { width: 110 }];

  ws = wb.addWorksheet("KPIs");
  ws.addRow(["Indicador", "Valor", "Tom"]);
  (report.kpis || []).forEach((item) => ws.addRow([item.label, item.value, item.tone]));
  ws.columns = [{ width: 38 }, { width: 22 }, { width: 12 }];

  ws = wb.addWorksheet("Endividamento");
  ws.addRow(["Tipo", "Projeto", "Modalidade", "Vencido", "A Vencer", "Total"]);
  (report.debtTable || []).forEach((row) => ws.addRow([row.type, row.group, row.modality, row.overdue, row.upcoming, row.total]));
  ws.columns = [{ width: 14 }, { width: 28 }, { width: 28 }, { width: 16 }, { width: 16 }, { width: 16 }];

  addStatementSheet(wb, "DRE Histórico", report.dreHistoricalStatement);
  addStatementSheet(wb, "DRE Projetado", report.dreProjectedStatement);
  addStatementSheet(wb, "DFC Histórico", report.dfcHistoricalStatement);
  addStatementSheet(wb, "DFC Projetado", report.dfcProjectedStatement);
  addStatementSheet(wb, "Fluxo Caixa", report.projectedCashflowStatement);

  ws = wb.addWorksheet("Plano 5W2H");
  ws.addRow(["What", "Why", "Who", "When", "Where", "How", "How much"]);
  (input.actions5w2h || []).forEach((a) => ws.addRow([a.what || '-', a.why || '-', a.who || '-', a.when || '-', a.where || '-', a.how || '-', a.howMuch || '-']));
  ws.columns = [{ width: 28 }, { width: 42 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 36 }, { width: 22 }];

  return Buffer.from(await wb.xlsx.writeBuffer());
}
