import { dbQuery } from "@/lib/db";
import { deepseekChat } from "@/lib/deepseek";

export type DebtRow = {
  type: "fidc" | "bancario";
  group: string;
  modality: string;
  overdue: number;
  upcoming: number;
  total: number;
};

export type HistoricalUploadAggregate = {
  totalUploads: number;
  byKind: Record<string, number>;
  totals: {
    faturamento: number;
    contasReceber: number;
    contasPagar: number;
    extratoBancario: number;
    duplicatas: number;
    endividamentoBancos: number;
    endividamentoFidc: number;
  };
  latestBusinessDate: string | null;
  debtRows: DebtRow[];
};

function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export async function getHistoricalUploadAggregate(projectId: string): Promise<HistoricalUploadAggregate> {
  const q = await dbQuery<{ business_date: string; payload: Record<string, unknown> }>(
    `select business_date::text, payload
     from daily_entries
     where project_id=$1
       and source_type='upload'
       and coalesce(payload->>'notes','') ilike '%upload_kind:historico_%'
     order by business_date desc, created_at desc`,
    [projectId]
  );

  const byKind: Record<string, number> = {};
  const seenKinds = new Set<string>();
  const seenSignatures = new Set<string>();
  const totals = {
    faturamento: 0,
    contasReceber: 0,
    contasPagar: 0,
    extratoBancario: 0,
    duplicatas: 0,
    endividamentoBancos: 0,
    endividamentoFidc: 0,
  };
  const debtMap = new Map<string, DebtRow>();

  for (const row of q.rows) {
    const payload = row.payload || {};
    const notes = String(payload.notes || "");
    const match = notes.match(/upload_kind:([a-z_]+)/i);
    const kind = match?.[1] || "historico_indefinido";
    const signature = [
      row.business_date,
      kind,
      Number(payload.faturamento || 0),
      Number(payload.contas_receber || 0),
      Number(payload.contas_pagar || 0),
      Number(payload.extrato_bancario || 0),
      Number(payload.duplicatas || 0),
      Array.isArray(payload.debt_rows) ? payload.debt_rows.length : 0,
    ].join("::");
    if (seenKinds.has(kind) || seenSignatures.has(signature)) continue;
    seenKinds.add(kind);
    seenSignatures.add(signature);
    byKind[kind] = (byKind[kind] || 0) + 1;

    totals.faturamento += Number(payload.faturamento || 0);
    totals.contasReceber += Number(payload.contas_receber || 0);
    totals.contasPagar += Number(payload.contas_pagar || 0);
    totals.extratoBancario += Number(payload.extrato_bancario || 0);
    totals.duplicatas += Number(payload.duplicatas || 0);

    const debtRows = Array.isArray(payload.debt_rows) ? (payload.debt_rows as Record<string, unknown>[]) : [];
    let debtTotalForRow = 0;
    for (const item of debtRows) {
      const type = String(item.type || (kind === "historico_endividamento_fidc" ? "fidc" : "bancario")) as "fidc" | "bancario";
      const group = String(item.group || "Não classificado");
      const modality = String(item.modality || "Não classificado");
      const overdue = Number(item.overdue || 0);
      const upcoming = Number(item.upcoming || 0);
      const total = Number(item.total || overdue + upcoming || 0);
      debtTotalForRow += total;
      const key = `${type}::${group}::${modality}`;
      const current = debtMap.get(key) || { type, group, modality, overdue: 0, upcoming: 0, total: 0 };
      current.overdue += overdue;
      current.upcoming += upcoming;
      current.total += total;
      debtMap.set(key, current);
    }

    if (kind === "historico_endividamento_bancos") {
      totals.endividamentoBancos += debtRows.length ? debtTotalForRow : Number(payload.contas_pagar || payload.duplicatas || 0);
    }
    if (kind === "historico_endividamento_fidc") {
      totals.endividamentoFidc += debtRows.length ? debtTotalForRow : Number(payload.contas_receber || payload.extrato_bancario || 0);
    }
  }

  return {
    totalUploads: q.rows.length,
    byKind,
    totals,
    latestBusinessDate: q.rows[0]?.business_date || null,
    debtRows: Array.from(debtMap.values()).sort((a, b) => a.type.localeCompare(b.type) || a.group.localeCompare(b.group) || a.modality.localeCompare(b.modality)),
  };
}

export async function createHistoricalDiagnosis(input: { projectId: string; projectCode: string; projectName: string; projectSummary: string; }) {
  const aggregate = await getHistoricalUploadAggregate(input.projectId);
  if (aggregate.totalUploads === 0) throw new Error("historical_upload_missing");

  const pressure = aggregate.totals.contasPagar - aggregate.totals.contasReceber;
  const totalDebt = aggregate.totals.endividamentoBancos + aggregate.totals.endividamentoFidc;
  const overdueDebt = aggregate.debtRows.reduce((sum, row) => sum + row.overdue, 0);
  const prompt = {
    projectCode: input.projectCode,
    projectName: input.projectName,
    projectSummary: input.projectSummary,
    aggregate,
    metrics: {
      pressure,
      totalDebt,
      overdueDebt,
    },
  };
  const fallback = JSON.stringify({
    diagnosis: pressure > 0
      ? "A operação entrou numa zona de tensão financeira relevante. O ponto crítico não está apenas no resultado contábil, mas na incapacidade de converter atividade operacional em liquidez sustentável, o que exige reorganização imediata do caixa e do passivo."
      : "A leitura histórica não mostra ruptura aguda de capital de giro, mas ainda indica a necessidade de revisão executiva antes de qualquer conclusão definitiva.",
    risks: [
      pressure > 0
        ? "Risco de compressão de liquidez no curto prazo caso a pressão entre contas a pagar e contas a receber siga sem intervenção gerencial."
        : "Risco moderado condicionado à qualidade e profundidade da cobertura histórica.",
      totalDebt > 0
        ? "Risco de deterioração adicional de margem e caixa pelo peso da estrutura de dívida atual sobre a operação."
        : "Estrutura de dívida ainda demanda validação consolidada antes de leitura conclusiva.",
    ],
    recommendations: [
      "Conectar caixa, dívida e operação numa leitura única para orientar a decisão executiva.",
      "Definir resposta objetiva para capital de giro e passivo financeiro antes de escalar qualquer decisão operacional.",
      "Traduzir os achados em plano curto com responsável, prazo e impacto esperado.",
    ],
    executiveSummary: `O caso exige intervenção executiva sobre liquidez, estrutura de dívida e geração operacional. A pressão consolidada entre CAP e CAR é de ${money(pressure)} e a dívida total estimada atinge ${money(totalDebt)}.`,
  });

  let provider = "fallback";
  let model = "local-fallback";
  let latencyMs = 0;
  let response = fallback;
  let status: "ok" | "error" = "ok";
  let error = "";

  try {
    const ai = await deepseekChat([
      {
        role: "system",
        content:
          "Você é o motor de diagnóstico histórico do IronCore. Responda apenas JSON válido. Escreva em português do Brasil, com linguagem de diretoria e tom consultivo premium. Evite jargão de IA, frases vazias e obviedades. Estruture a resposta com os campos diagnosis, risks, recommendations e executiveSummary. diagnosis deve ser um parecer executivo curto, risks deve listar riscos concretos e objetivos, recommendations deve trazer direcionamentos acionáveis, executiveSummary deve ser uma síntese firme e clara. Sempre conecte problema, impacto e decisão.",
      },
      {
        role: "user",
        content: `Gere o diagnóstico histórico executivo do projeto com base no contexto abaixo. Foque em caixa, dívida, capital de giro, consistência operacional e implicações para decisão:\n${JSON.stringify(prompt)}`,
      },
    ]);
    provider = "deepseek";
    model = ai.model;
    latencyMs = ai.latencyMs;
    response = ai.content || fallback;
  } catch (e) {
    status = "error";
    error = String(e);
  }

  const insert = await dbQuery<{ id: number }>(
    `insert into ai_inference_runs(project_id, provider, model, latency_ms, status, prompt, response, error)
     values($1,$2,$3,$4,$5,$6::jsonb,$7,$8)
     returning id`,
    [input.projectId, provider, model, latencyMs, status, JSON.stringify(prompt), response, error || null]
  );

  return { inferenceId: insert.rows[0]?.id || null, provider, model, latencyMs, status, aggregate, response };
}

export async function getLatestHistoricalDiagnosis(projectId: string) {
  const q = await dbQuery<{
    id: number;
    provider: string;
    model: string | null;
    status: "ok" | "error";
    response: string | null;
    error: string | null;
    created_at: string;
    prompt: Record<string, unknown>;
  }>(
    `select id, provider, model, status, response, error, created_at::text, prompt
     from ai_inference_runs
     where project_id=$1 and routine_run_id is null
     order by created_at desc
     limit 1`,
    [projectId]
  );

  return q.rows[0] || null;
}
