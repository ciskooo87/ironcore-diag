import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { buildExecutivePptx } from "@/lib/export-pptx";

type FinalDiagnosisPayload = { score?: number; executiveReport?: Record<string, unknown> };

export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const user = await getSessionUser();
  const project = await getProjectByCode(code);
  if (!user || !project) return new NextResponse("forbidden", { status: 403 });
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return new NextResponse("forbidden", { status: 403 });
  const finalDiagnosis = (project.final_diagnosis || {}) as FinalDiagnosisPayload;
  if (!finalDiagnosis.executiveReport) return new NextResponse("entrega_final_pendente", { status: 409 });
  const report = finalDiagnosis.executiveReport || {};
  const buffer = await buildExecutivePptx({ projectName: project.name, client: project.legal_name, score: Number(finalDiagnosis.score || 0) || undefined, report });
  return new NextResponse(buffer as BodyInit, { status: 200, headers: { "content-type": "application/vnd.openxmlformats-officedocument.presentationml.presentation", "content-disposition": `attachment; filename="diagnostico-${project.code}.pptx"` } });
}
