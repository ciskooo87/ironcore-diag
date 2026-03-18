import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getProjectByCode, updateProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { publicUrl } from "@/lib/request-url";
import { buildFinalDiagnosis, logWorkflowEvent } from "@/lib/diag-workflow";
import { getUserByEmail } from "@/lib/users";

export async function POST(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const user = await getSessionUser();
  const project = await getProjectByCode(code);
  if (!user || !project) return NextResponse.redirect(publicUrl(req, `/dashboard?error=forbidden`));
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return NextResponse.redirect(publicUrl(req, `/dashboard?error=forbidden`));
  const finalDiagnosis = await buildFinalDiagnosis(project);
  await updateProjectByCode(code, { name: project.name, cnpj: project.cnpj, legalName: project.legal_name, segment: project.segment, partners: project.partners || [], timezone: project.timezone || 'America/Sao_Paulo', accountPlan: project.account_plan || [], projectSummary: project.project_summary || '', financialProfile: { tx_percent: 0, float_days: 0, tac: 0, cost_per_boleto: 0 }, supplierClasses: [], workflowState: 'entrega_final', finalDiagnosis, finalDiagnosisStatus: 'gerado' });
  const dbUser = await getUserByEmail(user.email);
  await logWorkflowEvent({ projectId: project.id, stepKey: 'entrega_final', status: 'concluido', createdBy: dbUser?.id || null });
  return NextResponse.redirect(publicUrl(req, `/projetos/${code}/entrega-final/?saved=entrega`));
}
