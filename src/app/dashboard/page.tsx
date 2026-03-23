import Link from "next/link";
import { DiagShell } from "@/components/DiagShell";
import { ExecutiveNarrative, ScoreCard, AttentionList, TimelineCard, RightRail } from "@/components/diag-panels";
import { WorkflowChecklist } from "@/components/diag-workflow-ui";
import { requireUser } from "@/lib/guards";
import { listProjectsForUser } from "@/lib/projects";
import { appPath } from "@/lib/app-path";
import { buildProjectPresentation } from "@/lib/diag-presenter";
import { buildWorkflowChecklist, getWorkflowStepLabel } from "@/lib/diag-workflow";

export default async function DashboardPage() {
  const user = await requireUser();
  const projects = await listProjectsForUser(user.email, user.role);
  const project = projects[0];
  const presentation = project ? await buildProjectPresentation(project) : null;
  const workflow = project ? await buildWorkflowChecklist(project) : null;

  return (
    <DiagShell
      user={user}
      title="Diagnóstico do dado à decisão"
      subtitle="O /diag foi desenhado como uma jornada única: cadastro, bases, relato, normatização, conferência, análise IA, validação humana e entrega final."
      active="overview"
      project={project ? { name: project.name, code: project.code, client: project.legal_name, workflowState: project.workflow_state } : undefined}
      score={presentation?.overallScore || 0}
      status={project ? getWorkflowStepLabel(project.workflow_state) : "Sem projeto ativo"}
      cta={<Link href={project ? `/projetos/${project.code}/entrega-final/` : appPath("/projetos/novo/")} className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-400/15">{project ? "Abrir entrega final" : "Criar projeto"}</Link>}
    >
      {!project || !presentation || !workflow ? (
        <section className="rounded-3xl border border-slate-800 bg-[#111827] p-8 text-sm text-slate-300">
          Nenhum projeto ativo. <Link className="text-cyan-300" href="/projetos/novo/">Crie um novo projeto</Link> para iniciar a jornada completa do diagnóstico.
        </section>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
              <ExecutiveNarrative title="Resumo executivo do projeto ativo">
                <p>{presentation.executiveSummary}</p>
                <p>{presentation.narrative}</p>
                <p>O projeto está em <strong>{getWorkflowStepLabel(project.workflow_state)}</strong> e já percorreu aproximadamente <strong>{workflow.progressPercent}%</strong> da jornada.</p>
              </ExecutiveNarrative>
              <section className="rounded-3xl border border-slate-800 bg-[#111827] p-5 md:p-6">
                <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">Score do projeto</div>
                <h2 className="mt-2 text-xl font-semibold text-white">Breakdown executivo</h2>
                <div className="mt-4 grid gap-3">
                  {presentation.scoreBreakdown.map((item) => (
                    <ScoreCard key={item.title} title={item.title} value={item.value} tone={item.tone} hint={item.hint} />
                  ))}
                </div>
              </section>
            </div>

            <section className="rounded-3xl border border-slate-800 bg-[#111827] p-5 md:p-6">
              <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">Fluxo</div>
              <h2 className="mt-2 text-xl font-semibold text-white">Checklist da jornada</h2>
              <div className="mt-4">
                <WorkflowChecklist items={workflow.checklist} />
              </div>
            </section>

            <AttentionList items={presentation.attention} />
            <TimelineCard current={presentation.stageLabel} />
          </div>

          <RightRail title="Próximas ações">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Projeto ativo</div>
              <div className="mt-2 font-medium text-white">{project.name}</div>
              <div className="mt-1 text-sm text-slate-400">{project.legal_name}</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Próxima decisão</div>
              <div className="mt-2 text-sm text-slate-300">{project.workflow_state === "entrega_final" ? "Revisar entrega final, validar narrativa e compartilhar documento." : `Avançar para ${getWorkflowStepLabel(project.workflow_state) === "Entrega final" ? "documento final" : "a próxima etapa do fluxo"}.`}</div>
            </div>
            <div className="space-y-2">
              <Link href={`/projetos/${project.code}/cadastro/`} className="block rounded-2xl border border-slate-800 bg-slate-950/30 px-4 py-3 text-sm text-slate-200 hover:border-slate-700">Abrir cadastro</Link>
              <Link href={`/projetos/${project.code}/upload-historico/`} className="block rounded-2xl border border-slate-800 bg-slate-950/30 px-4 py-3 text-sm text-slate-200 hover:border-slate-700">Abrir bases históricas</Link>
              <Link href={`/projetos/${project.code}/diagnostico/`} className="block rounded-2xl border border-slate-800 bg-slate-950/30 px-4 py-3 text-sm text-slate-200 hover:border-slate-700">Abrir diagnóstico IA</Link>
              <Link href={`/projetos/${project.code}/entrega-final/`} className="block rounded-2xl border border-slate-800 bg-slate-950/30 px-4 py-3 text-sm text-slate-200 hover:border-slate-700">Abrir entrega final</Link>
            </div>
          </RightRail>
        </div>
      )}
    </DiagShell>
  );
}
