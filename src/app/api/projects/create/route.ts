import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getUserByEmail } from "@/lib/users";
import { createProject } from "@/lib/projects";
import { uniqueProjectCodeFromName } from "@/lib/slug";
import { dbQuery } from "@/lib/db";
import { publicUrl } from "@/lib/request-url";
import { logWorkflowEvent } from "@/lib/diag-workflow";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.redirect(publicUrl(req, "/login"));

  const form = await req.formData();
  const name = String(form.get("name") || "").trim();
  const cnpj = String(form.get("cnpj") || "").trim();
  const legalName = String(form.get("legal_name") || "").trim();
  const segment = String(form.get("segment") || "").trim();
  const partners = String(form.get("partners") || "").split(",").map((s) => s.trim()).filter(Boolean);
  const projectSummary = String(form.get("project_summary") || "").trim();

  if (!name || !cnpj || !legalName || !segment) {
    return NextResponse.redirect(publicUrl(req, "/projetos?error=required"));
  }

  const code = await uniqueProjectCodeFromName(name);
  const created = await createProject({
    code,
    name,
    cnpj,
    legalName,
    segment,
    partners,
    timezone: "America/Sao_Paulo",
    accountPlan: [],
    projectSummary,
  });

  const dbUser = await getUserByEmail(user.email);
  if (dbUser?.id && created?.id) {
    await dbQuery(
      "insert into project_permissions(user_id, project_id, can_edit) values($1,$2,true) on conflict do nothing",
      [dbUser.id, created.id]
    ).catch(() => null);
    await logWorkflowEvent({ projectId: created.id, stepKey: "novo_projeto", status: "concluido", payload: { code, name }, createdBy: dbUser.id });
  }

  return NextResponse.redirect(publicUrl(req, `/projetos/${code}/cadastro/?saved=project_created`));
}
