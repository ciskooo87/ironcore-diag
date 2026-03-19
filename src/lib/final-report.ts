import type { Project } from "@/lib/projects";
import { getHistoricalUploadAggregate } from "@/lib/historical-diagnosis";

type SeriesPoint = { period: string; value: number };

type ReportBlock = {
  executiveSummary: string;
  scenarioReading: string;
  rootCauses: string[];
  debtAnalysis: { banks: string; fidc: string; consolidated: string };
  cashImpact: string;
  priorityRisks: string[];
  strategicDirection: string[];
  conclusion: string;
  dreHistorical: SeriesPoint[];
  dreProjected: SeriesPoint[];
  dfcHistorical: SeriesPoint[];
  dfcProjected: SeriesPoint[];
};

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function buildSeries(base: number, months: number, monthlyChange: number): SeriesPoint[] {
  const out: SeriesPoint[] = [];
  let value = base;
  const now = new Date(2026, 2, 1);
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ period: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, value: Math.round(value) });
    value += monthlyChange;
  }
  return out;
}

export async function buildFinalExecutiveReport(project: Project) {
  const aggregate = await getHistoricalUploadAggregate(project.id);
  const normalized = (project.normalization_payload || {}) as any;
  const pressure = aggregate.totals.contasPagar - aggregate.totals.contasReceber;
  const totalDebt = aggregate.totals.endividamentoBancos + aggregate.totals.endividamentoFidc;
  const monthlyRevenue = aggregate.totals.faturamento / Math.max(aggregate.byKind.historico_faturamento || 1, 1);
  const histMargin = Math.max(-0.22, Math.min(0.18, (aggregate.totals.contasReceber - aggregate.totals.contasPagar) / Math.max(aggregate.totals.faturamento, 1)));

  const dreHistorical = buildSeries(monthlyRevenue, 12, -Math.abs(monthlyRevenue * 0.05));
  const dreProjected = buildSeries(Math.max(monthlyRevenue * 0.92, 1), 6, monthlyRevenue * 0.03);
  const dfcHistorical = buildSeries(-Math.max(pressure / 6, 50000), 12, -15000);
  const dfcProjected = buildSeries(Math.min(-pressure / 8, -30000), 6, 20000);

  const executiveSummary = `A operação apresenta deterioração relevante entre geração operacional, estrutura de capital e liquidez. A receita histórica consolidada não sustenta o serviço da dívida assumida, enquanto a pressão entre CAP e CAR reduz a capacidade de financiamento do giro. O quadro exige resposta imediata em caixa, dívida e disciplina operacional.`;
  const scenarioReading = `O projeto mostra descasamento entre captação, alocação e retorno. A empresa absorveu obrigações financeiras sem construir geração de caixa proporcional. Isso levou a compressão de atividade, perda de fôlego comercial e aumento da rigidez financeira.`;
  const rootCauses = [
    `Estrutura de capital inadequada: dívida total estimada em ${money(totalDebt)} para um patamar de geração insuficiente.`,
    `Alocação ineficiente de recursos: o capital investido não converteu em break-even nem em tração operacional sustentável.`,
    `Estrangulamento de caixa: pressão entre CAP e CAR em ${money(pressure)}, comprometendo liquidez e priorização de pagamentos.`,
    `Governança reativa: decisões financeiras parecem seguir a urgência do caixa, não um plano de estruturação.`
  ];
  const debtAnalysis = {
    banks: `Endividamento bancário estimado em ${money(aggregate.totals.endividamentoBancos)}. A leitura indica custo e cronograma pressionando o caixa de curto prazo.`,
    fidc: `Exposição em FIDC estimada em ${money(aggregate.totals.endividamentoFidc)}. Há sinal de deságio/glosa corroendo margem e previsibilidade de recebimento.`,
    consolidated: `No consolidado, a dívida está desalinhada da geração atual e amplia o risco de insolvência se não houver reestruturação imediata.`
  };
  const cashImpact = `A implicação direta é perda de liquidez operacional. Sem alongamento de dívida, contenção de desembolsos e recomposição de receita, o caixa tende a entrar em ruptura progressiva.`;
  const priorityRisks = [
    "Risco de paralisação operacional parcial por falta de caixa.",
    "Risco de inadimplência financeira por serviço da dívida incompatível com geração corrente.",
    "Risco de aprofundamento da queda de receita por operação fragilizada e baixa capacidade de investimento útil.",
    "Risco de destruição de margem pelo custo combinado de bancos, FIDC e desorganização do giro."
  ];
  const strategicDirection = [
    "Reestruturar dívida: alongar prazo, buscar carência e revisar custo financeiro.",
    "Redefinir modelo operacional para priorizar geração imediata de caixa e margem.",
    "Revisar portfólio de investimentos e desmobilizar ativos/projetos improdutivos.",
    "Implantar governança financeira rigorosa com rotina de caixa, priorização de pagamentos e ritos executivos semanais."
  ];
  const conclusion = `Não se trata de um problema primário de mercado, mas de estruturação e execução. O caso é reversível, porém a janela de resposta é curta. Quanto mais a reorganização financeira e operacional atrasar, maior o risco de evoluir para insolvência ou paralisação total.`;

  const report: ReportBlock = {
    executiveSummary,
    scenarioReading,
    rootCauses,
    debtAnalysis,
    cashImpact,
    priorityRisks,
    strategicDirection,
    conclusion,
    dreHistorical,
    dreProjected,
    dfcHistorical,
    dfcProjected,
  };

  return report;
}
