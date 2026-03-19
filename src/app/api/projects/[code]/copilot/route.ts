import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { buildProjectPresentation } from "@/lib/diag-presenter";
import { deepseekChat } from "@/lib/deepseek";

export async function POST(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const user = await getSessionUser();
  const project = await getProjectByCode(code);
  if (!user || !project) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const question = String(body?.question || "").trim();
  if (!question) return NextResponse.json({ error: "question_required" }, { status: 400 });

  const presentation = await buildProjectPresentation(project);
  const context = {
    project: { name: project.name, code: project.code, summary: project.project_summary, client: project.legal_name },
    attention: presentation.attention,
    score: presentation.overallScore,
    narrative: presentation.narrative,
    normalized: presentation.normalized,
  };

  try {
    const ai = await deepseekChat([
      { role: "system", content: "Você é um copiloto de diagnóstico financeiro. Responda em português, de forma objetiva, com base apenas no contexto fornecido." },
      { role: "user", content: `Contexto do projeto: ${JSON.stringify(context)}\n\nPergunta: ${question}` },
    ]);
    return NextResponse.json({ answer: ai.content || "Sem resposta gerada.", model: ai.model, latencyMs: ai.latencyMs });
  } catch {
    return NextResponse.json({ answer: "Não consegui gerar a resposta agora. Use os pontos de atenção e o resumo executivo como base provisória.", model: "fallback", latencyMs: 0 });
  }
}
