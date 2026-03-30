import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getProjectByCode, updateProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { validateCsrf } from "@/lib/csrf";
import { publicUrl } from "@/lib/request-url";
import { getUserByEmail } from "@/lib/users";
import { dbQuery } from "@/lib/db";
import { buildHistoricalValidationSummary } from "@/lib/historical-validation";
import { buildFinalDiagnosis, logWorkflowEvent } from "@/lib/diag-workflow";
import { buildFinalExecutiveReport } from "@/lib/final-report";
import { buildProjectPresentation } from "@/lib/diag-presenter";
import { getNextDeliveryVersion, insertDeliveryVersion } from "@/lib/delivery-versions";

export async function POST(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const user = await getSessionUser();
  const project = await getProjectByCode(code);
  if (!user || !project) return NextResponse.redirect(publicUrl(req, `/projetos/${code}/diagnostico-historico/?error=forbidden`));
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return NextResponse.redirect(publicUrl(req, `/projetos/${code}/diagnostico-historico/?error=forbidden`));
  const form = await req.formData();
  const csrfOk = await validateCsrf(form);
  if (!csrfOk) return NextResponse.redirect(publicUrl(req, `/projetos/${code}/entrega-final/?error=csrf`));
  const inferenceRunId = String(form.get("inference_run_id") || "").trim();
  const decision = String(form.get("decision") || "").trim();
  const note = String(form.get("note") || "").trim();
  if (!inferenceRunId || !decision) return NextResponse.redirect(publicUrl(req, `/projetos/${code}/diagnostico-historico/?error=required`));
  const dbUser = await getUserByEmail(user.email);
  const runQ = await dbQuery<{ provider: string; model: string | null; created_at: string; response: string | null }>(`select provider, model, created_at::text, response from ai_inference_runs where id=$1 and project_id=$2 limit 1`, [inferenceRunId, project.id]);
  const run = runQ.rows[0];
  const summaryText = buildHistoricalValidationSummary({ projectCode: project.code, decision, note, provider: run?.provider, model: run?.model || undefined, createdAt: run?.created_at, response: run?.response || undefined });
  await dbQuery(`insert into historical_diagnosis_validations(project_id, inference_run_id, decision, note, summary_text, validated_by) values($1,$2,$3,$4,$5,$6)`, [project.id, inferenceRunId, decision, note || null, summaryText, dbUser?.id || null]);
  await dbQuery(`insert into audit_log(project_id, actor_user_id, action, entity, entity_id, after_data) values($1,$2,$3,$4,$5,$6::jsonb)`, [project.id, dbUser?.id || null, 'historical.diagnosis.validate', 'ai_inference_runs', inferenceRunId, JSON.stringify({ decision, note, summaryText })]);
  await dbQuery(`update projects set workflow_state=case when final_diagnosis_status='gerado' then 'entrega_final' else 'validacao_humana' end, updated_at=now() where id=$1`, [project.id]);
  await logWorkflowEvent({ projectId: project.id, stepKey: "validacao_humana", status: "concluido", payload: { inferenceRunId, decision }, createdBy: dbUser?.id || null });

  if (decision === "aprovado") {
    const finalDiagnosis = await buildFinalDiagnosis(project);
    const executiveReport = await buildFinalExecutiveReport(project);
    const refreshedProject = (await getProjectByCode(code)) || project;
    const presentation = await buildProjectPresentation(refreshedProject);
    const actions5w2h = presentation.attention
      .map((item) => ("action5w2h" in item ? item.action5w2h : null))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    const versionNo = await getNextDeliveryVersion(project.id);
    const mergedFinal = {
      ...finalDiagnosis,
      executiveReport,
      actions5w2h,
      score: presentation.overallScore,
      generatedAt: new Date().toISOString(),
      versionNo,
    };

    await updateProjectByCode(code, {
      name: project.name,
      cnpj: project.cnpj,
      legalName: project.legal_name,
      segment: project.segment,
      partners: project.partners || [],
      timezone: project.timezone || "America/Sao_Paulo",
      accountPlan: project.account_plan || [],
      projectSummary: project.project_summary || "",
      financialProfile: { tx_percent: 0, float_days: 0, tac: 0, cost_per_boleto: 0 },
      supplierClasses: [],
      workflowState: "entrega_final",
      finalDiagnosis: mergedFinal,
      finalDiagnosisStatus: "gerado",
    });

    await insertDeliveryVersion({ projectId: project.id, versionNo, finalDiagnosis: mergedFinal, generatedBy: dbUser?.id || null });
    await logWorkflowEvent({
      projectId: project.id,
      stepKey: "entrega_final",
      status: "concluido",
      payload: { score: presentation.overallScore, actions5w2h: actions5w2h.length, versionNo, via: "validation_auto_finalize" },
      createdBy: dbUser?.id || null,
    });

    return NextResponse.redirect(publicUrl(req, `/projetos/${code}/entrega-final/?saved=entrega`));
  }

  return NextResponse.redirect(publicUrl(req, `/projetos/${code}/entrega-final/?saved=historical_validation`));
}
