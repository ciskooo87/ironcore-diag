import * as XLSX from "xlsx";

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

function sheetFromStatement(title: string, statement?: { periods: string[]; rows: StatementRow[] }) {
  if (!statement) return XLSX.utils.aoa_to_sheet([[title], [], ["Demonstrativo não consolidado"]]);
  const aoa: (string | number)[][] = [[title], []];
  aoa.push(["Linha", ...statement.periods]);
  for (const row of statement.rows) aoa.push([row.label, ...row.values]);
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [{ wch: 28 }, ...statement.periods.map(() => ({ wch: 16 }))];
  return ws;
}

export function buildExecutiveWorkbook(input: {
  projectName: string;
  client?: string;
  score?: number;
  report?: Report;
  actions5w2h?: Action5w2h[];
}) {
  const wb = XLSX.utils.book_new();
  const report = input.report || {};

  const resumo = XLSX.utils.aoa_to_sheet([
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
  resumo['!cols'] = [{ wch: 22 }, { wch: 110 }];
  XLSX.utils.book_append_sheet(wb, resumo, 'Resumo Executivo');

  const kpis = XLSX.utils.aoa_to_sheet([
    ["Indicador", "Valor", "Tom"],
    ...((report.kpis || []).map((item) => [item.label, item.value, item.tone]))
  ]);
  kpis['!cols'] = [{ wch: 38 }, { wch: 22 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, kpis, 'KPIs');

  const debtRows = report.debtTable || [];
  const debt = XLSX.utils.aoa_to_sheet([
    ["Tipo", "Projeto", "Modalidade", "Vencido", "A Vencer", "Total"],
    ...debtRows.map((row) => [row.type, row.group, row.modality, row.overdue, row.upcoming, row.total])
  ]);
  debt['!cols'] = [{ wch: 14 }, { wch: 28 }, { wch: 28 }, { wch: 16 }, { wch: 16 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, debt, 'Endividamento');

  XLSX.utils.book_append_sheet(wb, sheetFromStatement('DRE Histórico', report.dreHistoricalStatement), 'DRE Histórico');
  XLSX.utils.book_append_sheet(wb, sheetFromStatement('DRE Projetado', report.dreProjectedStatement), 'DRE Projetado');
  XLSX.utils.book_append_sheet(wb, sheetFromStatement('DFC Histórico', report.dfcHistoricalStatement), 'DFC Histórico');
  XLSX.utils.book_append_sheet(wb, sheetFromStatement('DFC Projetado', report.dfcProjectedStatement), 'DFC Projetado');
  XLSX.utils.book_append_sheet(wb, sheetFromStatement('Fluxo de Caixa Projetado', report.projectedCashflowStatement), 'Fluxo Caixa');

  const actions = XLSX.utils.aoa_to_sheet([
    ["What", "Why", "Who", "When", "Where", "How", "How much"],
    ...((input.actions5w2h || []).map((a) => [a.what || '-', a.why || '-', a.who || '-', a.when || '-', a.where || '-', a.how || '-', a.howMuch || '-']))
  ]);
  actions['!cols'] = [{ wch: 28 }, { wch: 42 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 36 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, actions, 'Plano 5W2H');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}
