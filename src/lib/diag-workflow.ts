import { dbQuery } from "@/lib/db";
import type { Project } from "@/lib/projects";
import { getHistoricalUploadAggregate, getLatestHistoricalDiagnosis } from "@/lib/historical-diagnosis";

export const DIAG_BASE_KINDS = [
  "historico_faturamento",
  "historico_contas_receber",
  "historico_contas_pagar",
  "historico_endividamento_bancos",
  "historico_endividamento_fidc",
] as const;

export type WorkflowStepKey =
  | "novo_projeto"
  | "cadastro"
  | "upload_historico"
  | "relato_historico"
  | "normalizacao"
  | "conferencia_normalizacao"
  | "montagem_diagnostico"
  | "analise_ia"
  | "validacao_humana"
  | "entrega_final";

export const WORKFLOW_STEPS: Array<{ key: WorkflowStepKey; label: string }> = [
  { key: "novo_projeto", label: "Novo projeto" },
  { key: "cadastro", label: "Cadastro" },
  { key: "upload_historico", label: "Upload histórico" },
  { key: "relato_historico", label: "Relato do projeto" },
  { key: "normalizacao", label: "Normatização automática" },
  { key: "conferencia_normalizacao", label: "Conferência" },
  { key: "montagem_diagnostico", label: "Montagem do diagnóstico" },
  { key: "analise_ia", label: "Análise IA" },
  { key: "validacao_humana", label: "Validação humana" },
  { key: "entrega_final", label: "Entrega final" },
];

export async function logWorkflowEvent(input: { projectId: string; stepKey: WorkflowStepKey; status: string; payload?: Record<string, unknown>; createdBy?: string | null }) {
  await dbQuery(
    `insert into project_workflow_events(project_id, step_key, status, payload, created_by) values($1,$2,$3,$4::jsonb,$5)`,
    [input.projectId, input.stepKey, input.status, JSON.stringify(input.payload || {}), input.createdBy || null]
  ).catch(() => null);
}

export async function listWorkflowEvents(projectId: string) {
  const q = await dbQuery<{ id: string; step_key: WorkflowStepKey; status: string; payload: Record<string, unknown>; created_at: string }>(
    `select id, step_key, status, payload, created_at::text from project_workflow_events where project_id=$1 order by created_at desc limit 50`,
    [projectId]
  ).catch(() => ({ rows: [] as any[] }));
  return q.rows;
}

export function getWorkflowStepLabel(step?: string | null) {
  return WORKFLOW_STEPS.find((item) => item.key === step)?.label || "Novo projeto";
}

export async function buildWorkflowChecklist(project: Project) {
  const aggregate = await getHistoricalUploadAggregate(project.id);
  const normalized = (project.normalization_payload || {}) as any;
  const latestDiagnosis = await getLatestHistoricalDiagnosis(project.id);
  const validationsQ = await dbQuery<{ total: string }>(
    `select count(*)::text as total from historical_diagnosis_validations where project_id=$1`,
    [project.id]
  ).catch(() => ({ rows: [{ total: "0" }] }));
  const validations = Number(validationsQ.rows[0]?.total || 0);
  const kinds = new Set(Object.keys(aggregate.byKind || {}));
  const missingKinds = DIAG_BASE_KINDS.filter((kind) => !kinds.has(kind));
  const finalDiagnosis = (project.final_diagnosis || {}) as Record<string, any>;

  const checklist = [
    { key: "cadastro", label: "Cadastro essencial preenchido", done: Boolean(project.name && project.cnpj && project.legal_name && project.segment && project.project_summary) },
    { key: "upload_historico", label: "5 bases históricas obrigatórias enviadas", done: missingKinds.length === 0, detail: missingKinds.length ? `Faltando: ${missingKinds.join(", ")}` : `Cobertura completa com ${aggregate.totalUploads} uploads.` },
    { key: "relato_historico", label: "Relato do projeto registrado", done: Boolean(project.historical_context?.trim()) },
    { key: "normalizacao", label: "Normatização automática gerada", done: project.normalization_status === "gerado" || project.normalization_status === "confirmado", detail: normalized?.uploads?.total ? `${normalized.uploads.total} uploads consolidados.` : undefined },
    { key: "conferencia_normalizacao", label: "Conferência da normatização concluída", done: project.normalization_status === "confirmado" },
    { key: "analise_ia", label: "Análise IA executada", done: Boolean(latestDiagnosis), detail: latestDiagnosis ? `Última execução: ${latestDiagnosis.provider}/${latestDiagnosis.model || "n/a"}` : undefined },
    { key: "validacao_humana", label: "Validação humana registrada", done: validations > 0, detail: validations > 0 ? `${validations} decisão(ões) registradas.` : undefined },
    { key: "entrega_final", label: "Documento final consolidado", done: Boolean(finalDiagnosis.executiveReport), detail: finalDiagnosis.executiveReport ? "Tela e documento preparados para exportação." : undefined },
  ];

  return {
    aggregate,
    missingKinds,
    latestDiagnosis,
    validations,
    checklist,
    progressPercent: Math.round((checklist.filter((item) => item.done).length / checklist.length) * 100),
    readyForAi: missingKinds.length === 0 && Boolean(project.historical_context?.trim()) && project.normalization_status === "confirmado",
    readyForFinalDelivery: Boolean(latestDiagnosis) && validations > 0,
  };
}

export async function buildNormalization(project: Project) {
  const aggregate = await getHistoricalUploadAggregate(project.id);
  const pressure = aggregate.totals.contasPagar - aggregate.totals.contasReceber;
  const baseKinds = Object.keys(aggregate.byKind || {});
  const normalized = {
    project: {
      code: project.code,
      name: project.name,
      cnpj: project.cnpj,
      legalName: project.legal_name,
      segment: project.segment,
      partners: project.partners || [],
      summary: project.project_summary || "",
      context: (project as any).historical_context || "",
    },
    uploads: {
      total: aggregate.totalUploads,
      latestBusinessDate: aggregate.latestBusinessDate,
      coverageKinds: baseKinds,
      missingKinds: DIAG_BASE_KINDS.filter((kind) => !baseKinds.includes(kind)),
    },
    financials: {
      faturamento: aggregate.totals.faturamento,
      contasReceber: aggregate.totals.contasReceber,
      contasPagar: aggregate.totals.contasPagar,
      endividamentoBancos: aggregate.totals.endividamentoBancos,
      endividamentoFidc: aggregate.totals.endividamentoFidc,
      pressure,
    },
    checkpoints: {
      hasContext: Boolean((project as any).historical_context?.trim()),
      readyForAi: aggregate.totalUploads > 0 && Boolean((project as any).historical_context?.trim()),
    },
  };

  await dbQuery(`update projects set normalization_payload=$2::jsonb, normalization_status='gerado', updated_at=now() where id=$1`, [project.id, JSON.stringify(normalized)]);
  return normalized;
}

export async function extractAttentionPoints(project: Project) {
  const aggregate = await getHistoricalUploadAggregate(project.id);
  const context = String((project as any).historical_context || "").trim();
  const baseKinds = Object.keys(aggregate.byKind || {});
  const missingKinds = DIAG_BASE_KINDS.filter((kind) => !baseKinds.includes(kind));
  const points = [
    aggregate.totals.contasPagar > aggregate.totals.contasReceber ? "Pressão de caixa histórica: CAP acima de CAR." : "Sem pressão histórica dominante entre CAR e CAP na consolidação simples.",
    missingKinds.length ? `Cobertura histórica incompleta: faltam ${missingKinds.join(", ")}.` : "Cobertura histórica principal recebida.",
    context ? `Relato do projeto registrado: ${context.slice(0, 220)}` : "Relato histórico ainda não preenchido.",
  ];
  await dbQuery(`update projects set ai_attention_points=$2::jsonb, updated_at=now() where id=$1`, [project.id, JSON.stringify(points)]);
  return points;
}

export async function buildFinalDiagnosis(project: Project) {
  const normalizedQ = await dbQuery<{ normalization_payload: Record<string, unknown>; ai_attention_points: string[] }>(
    `select normalization_payload, ai_attention_points from projects where id=$1 limit 1`,
    [project.id]
  );
  const row = normalizedQ.rows[0] || { normalization_payload: {}, ai_attention_points: [] };
  const latestDiagnosis = await getLatestHistoricalDiagnosis(project.id);
  const finalDiagnosis = {
    project: { name: project.name, code: project.code, cnpj: project.cnpj, legalName: project.legal_name },
    narrative: latestDiagnosis?.response || "Diagnóstico ainda não gerado por IA.",
    normalized: row.normalization_payload || {},
    attentionPoints: row.ai_attention_points || [],
    readyForHumanValidation: Boolean(latestDiagnosis),
  };
  await dbQuery(`update projects set final_diagnosis=$2::jsonb, final_diagnosis_status='gerado', updated_at=now() where id=$1`, [project.id, JSON.stringify(finalDiagnosis)]);
  return finalDiagnosis;
}
