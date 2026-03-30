import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getProjectByCode, restoreProjectByCode } from "@/lib/projects";
import { publicUrl } from "@/lib/request-url";
import { getUserByEmail } from "@/lib/users";
import { dbQuery } from "@/lib/db";

export async function POST(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const user = await getSessionUser();
  if (!user || user.role !== "admin_master") {
    return NextResponse.redirect(publicUrl(req, "/projetos?error=forbidden"));
  }

  const project = await getProjectByCode(code, true);
  if (!project) {
    return NextResponse.redirect(publicUrl(req, "/projetos?error=not_found"));
  }

  const dbUser = await getUserByEmail(user.email);
  await dbQuery(
    `insert into audit_log(project_id, actor_user_id, action, entity, entity_id, before_data)
     values($1,$2,$3,$4,$5,$6::jsonb)`,
    [project.id, dbUser?.id || null, "project.restore", "projects", project.id, JSON.stringify({ code: project.code, name: project.name })]
  ).catch(() => null);

  await restoreProjectByCode(code);
  return NextResponse.redirect(publicUrl(req, "/projetos?restored=1"));
}
