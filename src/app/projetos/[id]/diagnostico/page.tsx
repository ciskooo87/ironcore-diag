import Link from "next/link";
import { DiagShell } from "@/components/DiagShell";
import { ExecutiveNarrative, AttentionList, RightRail } from "@/components/diag-panels";
import { WorkflowChecklist } from "@/components/diag-workflow-ui";
import { CopilotPanel } from "@/components/CopilotPanel";
import { StatusCallout } from "@/components/StatusCallout";
import { requireUser } from "@/lib/guards";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { appPath } from "@/lib/app-path";
import { buildProjectPresentation } from "@/lib/diag-presenter";
import { buildWorkflowChecklist } from "@/lib/diag-workflow";

export default async function DiagnosticoPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const project = await getProjectByCode(id);
  if (!project) return <DiagShell user={user} title="Diagnóstico IA" active="ia"><div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] text-sm text-[#B42318]">Projeto não encontrado.</div></DiagShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <DiagShell user={user} title="Diagnóstico IA" active="ia"><div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] text-sm text-[#B42318]">Sem permissão.</div></DiagShell>;
  const presentation = await buildProjectPresentation(project);
  const workflow = await buildWorkflowChecklist(project);

  return (
    <DiagShell
      user={user}
      title="Montagem do diagnóstico e análise IA"
      subtitle="Aqui o caso vira leitura executiva: consolidação do histórico, hipótese de causa, pressão de caixa, dívida, risco e direção recomendada."
      active="ia"
      project={{ name: project.name, code: project.code, client: project.legal_name, workflowState: project.workflow_state }}
      score={presentation.overallScore}
      status={workflow.latestDiagnosis ? "Análise IA gerada" : workflow.readyForAi ? "Pronto para rodar IA" : "Aguardando fechamento das etapas anteriores"}
      cta={<form action={appPath(`/api/projects/${id}/historical-diagnosis/run/`)} method="post"><button type="submit" className="rounded-2xl bg-[#0F172A] px-4 py-3 text-sm font-medium text-white hover:bg-[#111827]">Rodar análise IA</button></form>}
    >
      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          {query.saved ? <StatusCallout tone="success">Análise IA gerada com sucesso.</StatusCallout> : null}
          {query.error ? <StatusCallout tone="error">Erro ao gerar análise IA: {query.error}</StatusCallout> : null}

          <div className="grid gap-4 2xl:grid-cols-2">
            <ExecutiveNarrative title="Montagem do caso">
              <p>O diagnóstico junta cadastro, relato, bases históricas, normatização e conferência em uma leitura única.</p>
              <p>{presentation.narrative}</p>
            </ExecutiveNarrative>
            <ExecutiveNarrative title="Leitura assistida por IA">
              <p>A IA entra depois da estruturação correta, não antes. O papel dela aqui é acelerar a análise, não inventar conclusão em cima de base incompleta.</p>
              <p>{workflow.latestDiagnosis?.response || "Nenhuma análise IA registrada ainda para este projeto."}</p>
            </ExecutiveNarrative>
          </div>

          <AttentionList items={presentation.attention} />
        </div>

        <RightRail title="Prontidão para validação">
          <div className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-[#98A2B3]">Checklist do fluxo</div>
            <div className="mt-3">
              <WorkflowChecklist items={workflow.checklist.slice(0, 7)} compact />
            </div>
          </div>
          <CopilotPanel endpoint={appPath(`/api/projects/${id}/copilot/`)} />
          <Link href={`/projetos/${project.code}/entrega-final/`} className="block rounded-2xl border border-black/5 bg-[#F8FAFC] px-4 py-3 text-sm text-[#344054] hover:border-black/10 hover:text-[#101828]">Ir para validação e entrega final</Link>
        </RightRail>
      </div>
    </DiagShell>
  );
}
