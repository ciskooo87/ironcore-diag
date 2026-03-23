import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getProjectByCode, updateProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { publicUrl } from "@/lib/request-url";
import { buildFinalDiagnosis, logWorkflowEvent } from "@/lib/diag-workflow";
import { buildFinalExecutiveReport } from "@/lib/final-report";
import { buildProjectPresentation } from "@/lib/diag-presenter";
import { getUserByEmail } from "@/lib/users";
import { getNextDeliveryVersion, insertDeliveryVersion } from "@/lib/delivery-versions";

export async function POST(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const user = await getSessionUser();
  const project = await getProjectByCode(code);

  if (!user || !project) {
    return NextResponse.redirect(publicUrl(req, `/projetos/${code}/entrega-final/?error=forbidden`));
  }

  const allowed = await canAccessProject(user, project.id);
  if (!allowed) {
    return NextResponse.redirect(publicUrl(req, `/projetos/${code}/entrega-final/?error=forbidden`));
  }

  const validationsQ = await import('@/lib/db').then(({ dbQuery }) => dbQuery<{ total: string }>(`select count(*)::text as total from historical_diagnosis_validations where project_id=$1`, [project.id]));
  const validations = Number(validationsQ.rows[0]?.total || 0);
  if (validations === 0) {
    return NextResponse.redirect(publicUrl(req, `/projetos/${code}/entrega-final/?error=missing_validation`));
  }

  const latestDiagnosis = await import('@/lib/historical-diagnosis').then(({ getLatestHistoricalDiagnosis }) => getLatestHistoricalDiagnosis(project.id));
  if (!latestDiagnosis) {
    return NextResponse.redirect(publicUrl(req, `/projetos/${code}/entrega-final/?error=missing_ai`));
  }

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

  const dbUser = await getUserByEmail(user.email);
  await insertDeliveryVersion({ projectId: project.id, versionNo, finalDiagnosis: mergedFinal, generatedBy: dbUser?.id || null });
  await logWorkflowEvent({
    projectId: project.id,
    stepKey: "entrega_final",
    status: "concluido",
    payload: { score: presentation.overallScore, actions5w2h: actions5w2h.length, versionNo },
    createdBy: dbUser?.id || null,
  });

  return NextResponse.redirect(publicUrl(req, `/projetos/${code}/entrega-final/?saved=entrega`));
}
