import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getProjectByCode, updateProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { publicUrl } from "@/lib/request-url";
import { getUserByEmail } from "@/lib/users";
import { logWorkflowEvent } from "@/lib/diag-workflow";

function parseNumber(raw: FormDataEntryValue | null, fallback = 0) {
  const text = String(raw || "").replace(",", ".").trim();
  if (!text) return fallback;
  const value = Number(text);
  return Number.isFinite(value) ? value : fallback;
}

function parsePercent(raw: FormDataEntryValue | null, fallback = 0) {
  const value = parseNumber(raw, fallback * 100);
  return value / 100;
}

function inRange(value: number, min: number, max: number) {
  return Number.isFinite(value) && value >= min && value <= max;
}

export async function POST(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const user = await getSessionUser();
  const project = await getProjectByCode(code);
  if (!user || !project) return NextResponse.redirect(publicUrl(req, `/projetos?error=forbidden`));
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return NextResponse.redirect(publicUrl(req, `/projetos?error=forbidden`));

  const form = await req.formData();
  const name = String(form.get("name") || "").trim();
  const cnpj = String(form.get("cnpj") || "").trim();
  const legalName = String(form.get("legal_name") || "").trim();
  const segment = String(form.get("segment") || "").trim();
  const partners = String(form.get("partners") || "").split(",").map((s) => s.trim()).filter(Boolean);
  const projectSummary = String(form.get("project_summary") || "").trim();

  const params = {
    tx_percent: parseNumber(form.get("tx_percent")),
    float_days: parseNumber(form.get("float_days")),
    tac: parseNumber(form.get("tac")),
    cost_per_boleto: parseNumber(form.get("cost_per_boleto")),
    tax_rate: parsePercent(form.get("tax_rate"), 0.08),
    hist_cost_rate: parsePercent(form.get("hist_cost_rate"), 0.62),
    hist_opex_rate: parsePercent(form.get("hist_opex_rate"), 0.24),
    hist_finance_rate: parsePercent(form.get("hist_finance_rate"), 0.07),
    proj_cost_rate: parsePercent(form.get("proj_cost_rate"), 0.58),
    proj_opex_rate: parsePercent(form.get("proj_opex_rate"), 0.21),
    proj_finance_rate: parsePercent(form.get("proj_finance_rate"), 0.055),
    hist_collection_rate: parsePercent(form.get("hist_collection_rate"), 0.78),
    hist_payment_rate: parsePercent(form.get("hist_payment_rate"), 0.83),
    hist_invest_rate: parsePercent(form.get("hist_invest_rate"), 0.05),
    proj_collection_rate: parsePercent(form.get("proj_collection_rate"), 0.86),
    proj_payment_rate: parsePercent(form.get("proj_payment_rate"), 0.74),
    proj_invest_rate: parsePercent(form.get("proj_invest_rate"), 0.04),
    opening_cash: parseNumber(form.get("opening_cash"), 280000),
  };

  const percentFields = [
    params.tax_rate,
    params.hist_cost_rate,
    params.hist_opex_rate,
    params.hist_finance_rate,
    params.proj_cost_rate,
    params.proj_opex_rate,
    params.proj_finance_rate,
    params.hist_collection_rate,
    params.hist_payment_rate,
    params.hist_invest_rate,
    params.proj_collection_rate,
    params.proj_payment_rate,
    params.proj_invest_rate,
  ];
  if (!percentFields.every((v) => inRange(v, 0, 1.5)) || !inRange(params.opening_cash, 0, 1_000_000_000) || !inRange(params.float_days, 0, 3650)) {
    return NextResponse.redirect(publicUrl(req, `/projetos/${code}/cadastro/?error=limites_invalidos`));
  }

  await updateProjectByCode(code, {
    name,
    cnpj,
    legalName,
    segment,
    partners,
    timezone: project.timezone || "America/Sao_Paulo",
    accountPlan: project.account_plan || [],
    projectSummary,
    financialProfile: params,
    supplierClasses: project.supplier_classes || [],
    workflowState: "upload_historico",
  });

  const dbUser = await getUserByEmail(user.email);
  await logWorkflowEvent({ projectId: project.id, stepKey: "cadastro", status: "concluido", payload: { name, cnpj }, createdBy: dbUser?.id || null });
  return NextResponse.redirect(publicUrl(req, `/projetos/${code}/upload-historico/?saved=cadastro`));
}
