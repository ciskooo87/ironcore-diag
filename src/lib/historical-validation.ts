import { dbQuery } from "@/lib/db";

export type HistoricalDiagnosisValidation = {
  id: string;
  decision: "aprovado" | "ajustar" | "bloquear";
  note: string | null;
  summary_text: string | null;
  validated_at: string;
};

export async function listHistoricalDiagnosisValidations(projectId: string, limit = 20) {
  const q = await dbQuery<HistoricalDiagnosisValidation>(
    `select id, decision, note, summary_text, validated_at::text
     from historical_diagnosis_validations
     where project_id=$1
     order by validated_at desc
     limit $2`,
    [projectId, limit]
  ).catch(() => ({ rows: [] as HistoricalDiagnosisValidation[] }));
  return q.rows;
}

export function buildHistoricalValidationSummary(input: {
  projectCode: string;
  decision: string;
  note?: string;
  provider?: string;
  model?: string;
  createdAt?: string;
  response?: string;
}) {
  const responseSnippet = String(input.response || '').replace(/\s+/g, ' ').slice(0, 180);
  return [
    `Projeto: ${input.projectCode}`,
    `Decisão: ${input.decision}`,
    `IA: ${input.provider || '-'} / ${input.model || '-'}`,
    `Gerado em: ${input.createdAt || '-'}`,
    `Leitura: ${responseSnippet || '-'}`,
    `Nota humana: ${input.note || '-'}`,
  ].join(' | ');
}
