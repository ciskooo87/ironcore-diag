import { DiagShell } from "@/components/DiagShell";
import { StepGuidance } from "@/components/diag-workflow-ui";
import { requireUser } from "@/lib/guards";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { buildProjectPresentation } from "@/lib/diag-presenter";
import { getWorkflowStepLabel, listWorkflowEvents } from "@/lib/diag-workflow";

export default async function HistoricoPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const project = await getProjectByCode(id);
  if (!project) return <DiagShell user={user} title="Histórico" active="history"><div className="rounded-3xl border border-slate-800 bg-[#111827] p-5 text-sm text-rose-200">Projeto não encontrado.</div></DiagShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <DiagShell user={user} title="Histórico" active="history"><div className="rounded-3xl border border-slate-800 bg-[#111827] p-5 text-sm text-rose-200">Sem permissão.</div></DiagShell>;
  const presentation = await buildProjectPresentation(project);
  const events = await listWorkflowEvents(project.id);

  return <DiagShell user={user} title="Histórico do diagnóstico" subtitle="Linha de eventos, decisões e marcos do workflow. Aqui fica a trilha auditável do projeto, do cadastro até a entrega final." active="history" project={{ name: project.name, code: project.code, client: project.legal_name, workflowState: project.workflow_state }} score={presentation.overallScore} status={getWorkflowStepLabel(project.workflow_state)}><div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]"><section className="rounded-3xl border border-slate-800 bg-[#111827] p-5 md:p-6"><div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">Trilha auditável</div><h2 className="mt-2 text-xl font-semibold text-white">Eventos do projeto</h2><div className="mt-5 space-y-3 text-sm">{events.length ? events.map((event) => <div key={event.id} className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div className="font-medium text-white">{getWorkflowStepLabel(event.step_key)}</div><div className="text-xs text-slate-500">{event.created_at}</div></div><div className="mt-2 text-slate-300">Status: {event.status}</div><pre className="mt-3 whitespace-pre-wrap text-xs text-slate-400">{JSON.stringify(event.payload || {}, null, 2)}</pre></div>) : <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4 text-slate-400">Sem eventos registrados ainda.</div>}</div></section><StepGuidance title="Como usar este histórico" description="Use esta tela para conferir em que ordem o fluxo andou, quais validações já foram registradas e o que foi consolidado em cada etapa. Ela serve como trilha de decisão, não como tela operacional principal." /></div></DiagShell>;
}
