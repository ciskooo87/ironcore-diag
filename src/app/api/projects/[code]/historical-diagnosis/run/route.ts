import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getProjectByCode, updateProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { publicUrl } from "@/lib/request-url";
import { getUserByEmail } from "@/lib/users";
import { dbQuery } from "@/lib/db";
import { createHistoricalDiagnosis } from "@/lib/historical-diagnosis";
import { logWorkflowEvent } from "@/lib/diag-workflow";

export async function POST(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const user = await getSessionUser();
  const project = await getProjectByCode(code);
  if (!user || !project) return NextResponse.redirect(publicUrl(req, `/projetos/${code}/diagnostico/?error=forbidden`));
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return NextResponse.redirect(publicUrl(req, `/projetos/${code}/diagnostico/?error=forbidden`));
  try {
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
      workflowState: "analise_ia",
    });

    const dbUser = await getUserByEmail(user.email);
    const out = await createHistoricalDiagnosis({ projectId: project.id, projectCode: project.code, projectName: project.name, projectSummary: project.project_summary || "" });
    await dbQuery("insert into audit_log(project_id, actor_user_id, action, entity, entity_id, after_data) values($1,$2,$3,$4,$5,$6::jsonb)", [project.id, dbUser?.id || null, "historical.diagnosis.run", "ai_inference_runs", String(out.inferenceId || ""), JSON.stringify(out)]);
    await logWorkflowEvent({ projectId: project.id, stepKey: "analise_ia", status: "concluido", payload: { inferenceId: out.inferenceId, provider: out.provider, model: out.model, status: out.status }, createdBy: dbUser?.id || null });
    return NextResponse.redirect(publicUrl(req, `/projetos/${code}/diagnostico/?saved=historical_diagnosis`));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "historical_diagnosis_error";
    if (msg === "historical_upload_missing") return NextResponse.redirect(publicUrl(req, `/projetos/${code}/diagnostico/?error=historical_upload_missing`));
    return NextResponse.redirect(publicUrl(req, `/projetos/${code}/diagnostico/?error=historical_diagnosis_error`));
  }
}
