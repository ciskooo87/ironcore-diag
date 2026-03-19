import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { diagnosisHtml } from "@/lib/pdf-export";

type FinalDiagnosisPayload = {
  score?: number;
  narrative?: string;
  executiveReport?: {
    executiveSummary?: string;
    scenarioReading?: string;
    rootCauses?: string[];
    debtAnalysis?: { banks?: string; fidc?: string; consolidated?: string };
    cashImpact?: string;
    priorityRisks?: string[];
    strategicDirection?: string[];
    conclusion?: string;
  };
  actions5w2h?: Array<Record<string, unknown>>;
};

export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const user = await getSessionUser();
  const project = await getProjectByCode(code);
  if (!user || !project) return new NextResponse("forbidden", { status: 403 });
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return new NextResponse("forbidden", { status: 403 });
  const finalDiagnosis = (project.final_diagnosis || {}) as FinalDiagnosisPayload;
  const report = finalDiagnosis.executiveReport || {};
  const html = diagnosisHtml({
    title: `Diagnóstico Final · ${project.name}`,
    projectName: project.name,
    client: project.legal_name,
    score: Number(finalDiagnosis.score || 0) || undefined,
    summary: String(report.executiveSummary || project.project_summary || ""),
    attentionPoints: Array.isArray(report.priorityRisks) ? report.priorityRisks : (project.ai_attention_points || []),
    narrative: String(report.conclusion || finalDiagnosis.narrative || "Diagnóstico não consolidado ainda."),
    actions5w2h: Array.isArray(finalDiagnosis.actions5w2h)
      ? finalDiagnosis.actions5w2h.map((item) => ({
          what: String(item.what || "-"),
          why: String(item.why || "-"),
          who: String(item.who || "-"),
          when: String(item.when || "-"),
          where: String(item.where || "-"),
          how: String(item.how || "-"),
          howMuch: String(item.howMuch || "-"),
        }))
      : [],
    report,
  });
  return new NextResponse(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8", "content-disposition": `inline; filename="diagnostico-${project.code}.html"` } });
}
