import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getProjectByCode, updateProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { publicUrl } from "@/lib/request-url";
import { getUserByEmail } from "@/lib/users";
import { logWorkflowEvent } from "@/lib/diag-workflow";

export async function POST(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const user = await getSessionUser();
  const project = await getProjectByCode(code);
  if (!user || !project) return NextResponse.redirect(publicUrl(req, `/dashboard?error=forbidden`));
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return NextResponse.redirect(publicUrl(req, `/dashboard?error=forbidden`));

  const form = await req.formData();
  const name = String(form.get("name") || "").trim();
  const cnpj = String(form.get("cnpj") || "").trim();
  const legalName = String(form.get("legal_name") || "").trim();
  const segment = String(form.get("segment") || "").trim();
  const partners = String(form.get("partners") || "").split(",").map((s) => s.trim()).filter(Boolean);
  const projectSummary = String(form.get("project_summary") || "").trim();

  await updateProjectByCode(code, {
    name, cnpj, legalName, segment, partners,
    timezone: project.timezone || "America/Sao_Paulo",
    accountPlan: project.account_plan || [],
    projectSummary,
    financialProfile: { tx_percent: 0, float_days: 0, tac: 0, cost_per_boleto: 0 },
    supplierClasses: [],
    workflowState: "upload_historico",
  });
  const dbUser = await getUserByEmail(user.email);
  await logWorkflowEvent({ projectId: project.id, stepKey: "cadastro", status: "concluido", payload: { name, cnpj }, createdBy: dbUser?.id || null });
  return NextResponse.redirect(publicUrl(req, `/projetos/${code}/upload-historico/?saved=cadastro`));
}
