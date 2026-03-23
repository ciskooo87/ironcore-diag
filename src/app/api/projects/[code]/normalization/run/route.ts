import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getProjectByCode, updateProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { publicUrl } from "@/lib/request-url";
import { buildNormalization, logWorkflowEvent } from "@/lib/diag-workflow";
import { getUserByEmail } from "@/lib/users";

export async function POST(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const user = await getSessionUser();
  const project = await getProjectByCode(code);
  if (!user || !project) return NextResponse.redirect(publicUrl(req, `/dashboard?error=forbidden`));
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return NextResponse.redirect(publicUrl(req, `/dashboard?error=forbidden`));

  try {
    const normalized = await buildNormalization(project);
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
      workflowState: "conferencia_normalizacao",
      normalizationPayload: normalized,
      normalizationStatus: "gerado",
    });
    const dbUser = await getUserByEmail(user.email);
    await logWorkflowEvent({ projectId: project.id, stepKey: "normalizacao", status: "concluido", payload: normalized as Record<string, unknown>, createdBy: dbUser?.id || null });
    return NextResponse.redirect(publicUrl(req, `/projetos/${code}/conferencia/?saved=normalizacao`));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "normalization_error";
    if (msg.startsWith("normalization_missing_inputs:")) return NextResponse.redirect(publicUrl(req, `/projetos/${code}/normalizacao/?error=missing_inputs`));
    if (msg === "normalization_missing_context") return NextResponse.redirect(publicUrl(req, `/projetos/${code}/normalizacao/?error=missing_context`));
    return NextResponse.redirect(publicUrl(req, `/projetos/${code}/normalizacao/?error=normalization_error`));
  }
}
