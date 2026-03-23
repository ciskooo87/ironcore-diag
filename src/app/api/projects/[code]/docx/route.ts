import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { buildExecutiveDocx } from "@/lib/export-docx";

type FinalDiagnosisPayload = { score?: number; executiveReport?: Record<string, unknown>; actions5w2h?: Array<Record<string, unknown>> };

export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const user = await getSessionUser();
  const project = await getProjectByCode(code);
  if (!user || !project) return new NextResponse("forbidden", { status: 403 });
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return new NextResponse("forbidden", { status: 403 });
  const finalDiagnosis = (project.final_diagnosis || {}) as FinalDiagnosisPayload;
  const report = finalDiagnosis.executiveReport || {};
  const actions5w2h = Array.isArray(finalDiagnosis.actions5w2h) ? finalDiagnosis.actions5w2h : [];
  const buffer = await buildExecutiveDocx({ projectName: project.name, client: project.legal_name, score: Number(finalDiagnosis.score || 0) || undefined, report, actions5w2h });
  return new NextResponse(buffer as BodyInit, { status: 200, headers: { "content-type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "content-disposition": `attachment; filename="diagnostico-${project.code}.docx"` } });
}
