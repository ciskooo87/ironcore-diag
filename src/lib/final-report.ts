import type { Project } from "@/lib/projects";
import { getHistoricalUploadAggregate } from "@/lib/historical-diagnosis";

type SeriesPoint = { period: string; value: number };
type StatementRow = { label: string; values: number[] };
type DebtTableRow = { type: "fidc" | "bancario"; group: string; modality: string; overdue: number; upcoming: number; total: number };

type ReportBlock = {
  executiveSummary: string;
  scenarioReading: string;
  rootCauses: string[];
  debtAnalysis: { banks: string; fidc: string; consolidated: string };
  debtTable: DebtTableRow[];
  cashImpact: string;
  priorityRisks: string[];
  strategicDirection: string[];
  conclusion: string;
  dreHistorical: SeriesPoint[];
  dreProjected: SeriesPoint[];
  dfcHistorical: SeriesPoint[];
  dfcProjected: SeriesPoint[];
  dreHistoricalStatement: { periods: string[]; rows: StatementRow[] };
  dreProjectedStatement: { periods: string[]; rows: StatementRow[] };
  dfcHistoricalStatement: { periods: string[]; rows: StatementRow[] };
  dfcProjectedStatement: { periods: string[]; rows: StatementRow[] };
  projectedCashflowStatement: { periods: string[]; rows: StatementRow[] };
  kpis: { label: string; value: string; tone: "cyan" | "emerald" | "amber" | "rose" }[];
};

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function monthLabel(offset: number) {
  const now = new Date(2026, 2, 1);
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function buildSeriesFromValues(values: number[], startOffset: number) {
  return values.map((value, idx) => ({ period: monthLabel(startOffset + idx), value: Math.round(value) }));
}

function buildDreStatement(revenueSeries: number[], costRate: number, opexRate: number, financeRate: number) {
  const periods = revenueSeries.map((_, idx) => monthLabel(idx - revenueSeries.length + 1));
  const receita = revenueSeries.map((v) => Math.round(v));
  const deducoes = receita.map((v) => Math.round(v * 0.08));
  const receitaLiquida = receita.map((v, i) => v - deducoes[i]);
  const custos = receitaLiquida.map((v) => Math.round(v * costRate));
  const lucroBruto = receitaLiquida.map((v, i) => v - custos[i]);
  const despesasOperacionais = receitaLiquida.map((v) => Math.round(v * opexRate));
  const ebitda = lucroBruto.map((v, i) => v - despesasOperacionais[i]);
  const resultadoFinanceiro = receitaLiquida.map((v) => -Math.round(v * financeRate));
  const lucroLiquido = ebitda.map((v, i) => v + resultadoFinanceiro[i]);

  return {
    periods,
    rows: [
      { label: "Receita bruta", values: receita },
      { label: "(-) Deduções e impostos", values: deducoes.map((v) => -v) },
      { label: "Receita líquida", values: receitaLiquida },
      { label: "(-) Custos operacionais", values: custos.map((v) => -v) },
      { label: "Lucro bruto", values: lucroBruto },
      { label: "(-) Despesas operacionais", values: despesasOperacionais.map((v) => -v) },
      { label: "EBITDA", values: ebitda },
      { label: "Resultado financeiro", values: resultadoFinanceiro },
      { label: "Lucro líquido", values: lucroLiquido },
    ],
  };
}

function buildCashStatement(baseRevenue: number[], collectionRate: number, paymentRate: number, debtServiceRate: number, investRate: number, openingCashStart: number, startOffset: number) {
  const periods = baseRevenue.map((_, idx) => monthLabel(startOffset + idx));
  const entradas = baseRevenue.map((v) => Math.round(v * collectionRate));
  const saidasOperacionais = baseRevenue.map((v) => -Math.round(v * paymentRate));
  const servicoDivida = baseRevenue.map((v) => -Math.round(v * debtServiceRate));
  const investimentos = baseRevenue.map((v) => -Math.round(v * investRate));
  const variacao = entradas.map((v, i) => v + saidasOperacionais[i] + servicoDivida[i] + investimentos[i]);
  const caixaInicial: number[] = [];
  const caixaFinal: number[] = [];
  let running = openingCashStart;
  for (const delta of variacao) {
    caixaInicial.push(Math.round(running));
    running += delta;
    caixaFinal.push(Math.round(running));
  }
  return {
    periods,
    rows: [
      { label: "Entradas operacionais", values: entradas },
      { label: "(-) Saídas operacionais", values: saidasOperacionais },
      { label: "(-) Serviço da dívida", values: servicoDivida },
      { label: "(-) Investimentos", values: investimentos },
      { label: "Variação líquida de caixa", values: variacao },
      { label: "Caixa inicial", values: caixaInicial },
      { label: "Caixa final", values: caixaFinal },
    ],
  };
}

function buildDebtTable(rawRows: DebtTableRow[], banksTotal: number, fidcTotal: number): DebtTableRow[] {
  if (rawRows.length) return rawRows;
  return [
    { type: "fidc", group: "FIDC", modality: "Carteira consolidada", overdue: 0, upcoming: fidcTotal, total: fidcTotal },
    { type: "bancario", group: "Bancário", modality: "Dívida consolidada", overdue: Math.round(banksTotal * 0.18), upcoming: Math.round(banksTotal * 0.82), total: banksTotal },
  ];
}

export async function buildFinalExecutiveReport(project: Project) {
  const aggregate = await getHistoricalUploadAggregate(project.id);
  const pressure = aggregate.totals.contasPagar - aggregate.totals.contasReceber;
  const totalDebt = aggregate.totals.endividamentoBancos + aggregate.totals.endividamentoFidc;
  const faturamentoMensal = aggregate.totals.faturamento / Math.max(aggregate.byKind.historico_faturamento || 1, 1);
  const debtRatio = totalDebt / Math.max(aggregate.totals.faturamento, 1);
  const pressureRatio = pressure / Math.max(aggregate.totals.faturamento, 1);
  const histRevenue = Array.from({ length: 12 }, (_, i) => Math.max(faturamentoMensal * (1 - 0.03 * (11 - i)), faturamentoMensal * 0.55));
  const projRevenue = Array.from({ length: 6 }, (_, i) => Math.max(faturamentoMensal * (0.92 + 0.03 * i), faturamentoMensal * 0.6));
  const costRateHist = Math.min(0.78, Math.max(0.52, 0.62 + Math.max(pressureRatio, 0) * 0.6));
  const opexRateHist = Math.min(0.34, Math.max(0.18, 0.24 + Math.max(debtRatio - 0.4, 0) * 0.08));
  const financeRateHist = Math.min(0.16, Math.max(0.04, 0.07 + debtRatio * 0.04));
  const costRateProj = Math.max(0.5, costRateHist - 0.04);
  const opexRateProj = Math.max(0.17, opexRateHist - 0.03);
  const financeRateProj = Math.max(0.035, financeRateHist - 0.015);

  const dreHist = buildDreStatement(histRevenue, costRateHist, opexRateHist, financeRateHist);
  const dreProj = buildDreStatement(projRevenue, costRateProj, opexRateProj, financeRateProj);
  const dfcHist = buildCashStatement(histRevenue, 0.78, 0.83, financeRateHist, 0.05, 280000, -11);
  const dfcProj = buildCashStatement(projRevenue, 0.86, 0.74, financeRateProj, 0.04, dfcHist.rows[dfcHist.rows.length - 1].values.at(-1) || 180000, 0);
  const projectedCash = buildCashStatement(projRevenue, 0.9, 0.71, financeRateProj, 0.05, dfcHist.rows[dfcHist.rows.length - 1].values.at(-1) || 180000, 0);
  const debtTable = buildDebtTable(aggregate.debtRows, aggregate.totals.endividamentoBancos, aggregate.totals.endividamentoFidc);

  const overdueDebt = debtTable.reduce((sum, row) => sum + row.overdue, 0);
  const executiveSummary = `A operação apresenta descasamento material entre geração operacional, pressão de caixa e estrutura de dívida. A receita histórica consolidada indica capacidade limitada para absorver o serviço da dívida e a pressão entre CAP e CAR mantém a liquidez comprimida.`;
  const scenarioReading = `O diagnóstico mostra três vetores centrais: geração operacional fragilizada, dívida pesada para a escala atual e governança financeira reativa. A empresa não colapsou por ausência de mercado, mas por desalinhamento entre capital, operação e disciplina de caixa.`;
  const rootCauses = [
    `Estrutura de capital desequilibrada: dívida total estimada em ${money(totalDebt)} para uma receita consolidada de ${money(aggregate.totals.faturamento)}.`,
    `Pressão de capital de giro: CAP supera CAR em ${money(Math.max(pressure, 0))}, comprimindo liquidez e capacidade de priorização.`,
    `Custo financeiro relevante: o mix entre bancos e FIDC deteriora margem e previsibilidade de caixa.`,
    `Ritual de gestão insuficiente: o histórico sugere reação ao caixa do dia, não governança antecipatória.`
  ];
  const debtAnalysis = {
    banks: `Dívida bancária consolidada em ${money(aggregate.totals.endividamentoBancos)}. O peso do curto prazo e do custo financeiro aumenta a rigidez operacional.`,
    fidc: `Exposição em FIDC consolidada em ${money(aggregate.totals.endividamentoFidc)}. O uso recorrente dessa estrutura pressiona margem e reduz flexibilidade.`,
    consolidated: `No consolidado, a dívida está acima do ponto confortável para a geração atual e exige reestruturação + governança de caixa.`
  };
  const cashImpact = `O efeito mais imediato aparece no caixa: saldo livre comprimido, baixa tolerância a erro operacional e risco de travamento por vencidos ou serviço da dívida. O vencido consolidado já soma ${money(overdueDebt)}.`;
  const priorityRisks = [
    `Risco de ruptura de caixa de curto prazo se o vencido (${money(overdueDebt)}) não for tratado rapidamente.`,
    `Risco de inadimplência financeira pela incompatibilidade entre dívida e geração operacional.`,
    `Risco de queda adicional de margem enquanto bancos/FIDC seguirem financiando ineficiência estrutural.`,
    `Risco de deterioração comercial se a operação continuar girando sob estresse permanente de caixa.`
  ];
  const strategicDirection = [
    "Alongar e reprecificar dívida para reduzir serviço financeiro de curto prazo.",
    "Estabelecer rotina diária/semanal de caixa com priorização de pagamentos e cobrança.",
    "Rever custos operacionais e estrutura para recuperar margem e caixa livre.",
    "Separar claramente a estratégia de dívida bancária e FIDC com metas de redução por bloco."
  ];
  const conclusion = `O caso é recuperável, mas não por inércia. A empresa precisa simultaneamente reorganizar dívida, reduzir pressão no giro e restaurar disciplina operacional. Sem essas três frentes em paralelo, a tendência é aprofundamento da fragilidade.`;

  return {
    executiveSummary,
    scenarioReading,
    rootCauses,
    debtAnalysis,
    debtTable,
    cashImpact,
    priorityRisks,
    strategicDirection,
    conclusion,
    dreHistorical: buildSeriesFromValues(histRevenue, -11),
    dreProjected: buildSeriesFromValues(projRevenue, 0),
    dfcHistorical: buildSeriesFromValues(dfcHist.rows[4].values, -11),
    dfcProjected: buildSeriesFromValues(dfcProj.rows[4].values, 0),
    dreHistoricalStatement: dreHist,
    dreProjectedStatement: dreProj,
    dfcHistoricalStatement: dfcHist,
    dfcProjectedStatement: dfcProj,
    projectedCashflowStatement: projectedCash,
    kpis: [
      { label: "Receita histórica consolidada", value: money(aggregate.totals.faturamento), tone: "cyan" },
      { label: "Pressão CAP x CAR", value: money(pressure), tone: pressure > 0 ? "rose" : "emerald" },
      { label: "Dívida total estimada", value: money(totalDebt), tone: debtRatio > 0.6 ? "amber" : "emerald" },
      { label: "Vencido consolidado", value: money(overdueDebt), tone: overdueDebt > 0 ? "rose" : "emerald" },
    ],
  } satisfies ReportBlock;
}
