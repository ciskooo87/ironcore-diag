import Link from "next/link";
import { DiagShell } from "@/components/DiagShell";
import { ExecutiveNarrative, AttentionList, RightRail } from "@/components/diag-panels";
import { requireUser } from "@/lib/guards";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { appPath } from "@/lib/app-path";
import { buildProjectPresentation } from "@/lib/diag-presenter";

export default async function DiagnosticoPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const project = await getProjectByCode(id);
  if (!project) return <DiagShell user={user} title="Diagnóstico IA" active="ia"><div className="rounded-3xl border border-slate-800 bg-[#111827] p-5 text-sm text-rose-200">Projeto não encontrado.</div></DiagShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <DiagShell user={user} title="Diagnóstico IA" active="ia"><div className="rounded-3xl border border-slate-800 bg-[#111827] p-5 text-sm text-rose-200">Sem permissão.</div></DiagShell>;
  const presentation = await buildProjectPresentation(project);

  return (
    <DiagShell
      user={user}
      title="Diagnóstico IA"
      subtitle="Estrutura financeira, fluxo de caixa, gargalos operacionais e riscos com apoio de IA e evidência do dado."
      active="ia"
      project={{ name: project.name, code: project.code, client: project.legal_name, workflowState: project.workflow_state }}
      score={presentation.overallScore}
      status={project.workflow_state === "montagem_diagnostico" ? "Em análise IA" : project.workflow_state || "Em análise"}
      cta={<form action={appPath(`/api/projects/${id}/historical-diagnosis/run/`)} method="post"><button type="submit" className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-400/15">Gerar versão final</button></form>}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          {query.saved ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">Análise IA gerada com sucesso.</div> : null}
          {query.error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">Erro: {query.error}</div> : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <ExecutiveNarrative title="Estrutura financeira">
              <p>A IA consolida faturamento, CAR, CAP e endividamento para gerar uma leitura financeira inicial do projeto.</p>
              <p>{presentation.narrative}</p>
            </ExecutiveNarrative>
            <ExecutiveNarrative title="Fluxo de caixa e gargalos operacionais">
              <p>O motor cruza pressão de caixa, cobertura de base e contexto do cliente para sugerir causas raiz e riscos prováveis.</p>
              <p>O objetivo aqui não é chatbot. É copiloto de diagnóstico com evidência.</p>
            </ExecutiveNarrative>
          </div>

          <AttentionList items={presentation.attention} />
        </div>

        <RightRail title="Interação com IA">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Perguntas sugeridas</div>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <div className="rounded-xl border border-slate-800 px-3 py-2">Explique melhor a causa raiz</div>
              <div className="rounded-xl border border-slate-800 px-3 py-2">Simule um cenário com redução de caixa</div>
              <div className="rounded-xl border border-slate-800 px-3 py-2">Quais evidências sustentam o alerta crítico?</div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Confiança do dado</div>
            <div className="mt-2 text-3xl font-semibold text-white">{Math.min(95, 50 + presentation.aggregate.totalUploads * 8)}%</div>
            <div className="mt-2 text-sm text-slate-400">Score de confiabilidade baseado em cobertura das bases, contexto e consistência do pipeline.</div>
          </div>
          <Link href={`/projetos/${project.code}/entrega-final/`} className="block rounded-2xl border border-slate-800 bg-slate-950/30 px-4 py-3 text-sm text-slate-200 hover:border-slate-700">Ir para validação e documento final</Link>
        </RightRail>
      </div>
    </DiagShell>
  );
}
