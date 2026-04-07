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
  if (!project) return <DiagShell user={user} title="Histórico" active="history"><div className="rounded-[28px] border border-black/5 bg-white p-5 surface-elevated text-sm text-[#B42318]">Projeto não encontrado.</div></DiagShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <DiagShell user={user} title="Histórico" active="history"><div className="rounded-[28px] border border-black/5 bg-white p-5 surface-elevated text-sm text-[#B42318]">Sem permissão.</div></DiagShell>;
  const presentation = await buildProjectPresentation(project);
  const events = await listWorkflowEvents(project.id);

  return <DiagShell user={user} title="Histórico do diagnóstico" subtitle="Linha de eventos, decisões e marcos do workflow. Aqui fica a trilha auditável do projeto, do cadastro até a entrega final." active="history" project={{ name: project.name, code: project.code, client: project.legal_name, workflowState: project.workflow_state }} score={presentation.overallScore} status={getWorkflowStepLabel(project.workflow_state)}><div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]"><section className="rounded-[28px] border border-black/5 bg-white p-6 surface-elevated md:p-7"><div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#98A2B3]">Trilha auditável</div><h2 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.03em] text-[#101828]">Eventos do projeto</h2><div className="mt-5 space-y-3 text-sm">{events.length ? events.map((event) => <div key={event.id} className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-4 md:p-5"><div className="flex flex-wrap items-center justify-between gap-2"><div className="font-medium text-[#101828]">{getWorkflowStepLabel(event.step_key)}</div><div className="text-xs text-[#98A2B3]">{event.created_at}</div></div><div className="mt-2 text-[#475467]">Status: {event.status}</div><pre className="mt-3 whitespace-pre-wrap text-xs text-[#667085]">{JSON.stringify(event.payload || {}, null, 2)}</pre></div>) : <div className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-4 md:p-5 text-[#667085]">Sem eventos registrados ainda.</div>}</div></section><StepGuidance title="Como usar este histórico" description="Use esta tela para conferir em que ordem o fluxo andou, quais validações já foram registradas e o que foi consolidado em cada etapa. Ela serve como trilha de decisão, não como tela operacional principal." /></div></DiagShell>;
}
