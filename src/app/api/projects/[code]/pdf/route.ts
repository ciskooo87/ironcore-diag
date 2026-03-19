import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { diagnosisHtml } from "@/lib/pdf-export";

export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const user = await getSessionUser();
  const project = await getProjectByCode(code);
  if (!user || !project) return new NextResponse('forbidden', { status: 403 });
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return new NextResponse('forbidden', { status: 403 });
  const finalDiagnosis = (project.final_diagnosis || {}) as Record<string, any>;
  const html = diagnosisHtml({
    title: `Diagnóstico Final · ${project.name}`,
    projectName: project.name,
    client: project.legal_name,
    score: Number(finalDiagnosis.score || 0) || undefined,
    summary: project.project_summary || '',
    attentionPoints: project.ai_attention_points || [],
    narrative: String(finalDiagnosis.narrative || 'Diagnóstico não consolidado ainda.'),
    actions5w2h: Array.isArray(finalDiagnosis.actions5w2h) ? finalDiagnosis.actions5w2h : [],
  });
  return new NextResponse(html, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8', 'content-disposition': `inline; filename="diagnostico-${project.code}.html"` } });
}
