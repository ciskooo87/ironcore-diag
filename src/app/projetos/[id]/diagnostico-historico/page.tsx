import Link from "next/link";
import { DiagShell } from "@/components/DiagShell";
import { StepGuidance } from "@/components/diag-workflow-ui";
import { requireUser } from "@/lib/guards";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { buildProjectPresentation } from "@/lib/diag-presenter";
import { getLatestHistoricalDiagnosis } from "@/lib/historical-diagnosis";
import { listHistoricalDiagnosisValidations } from "@/lib/historical-validation";

export default async function DiagnosticoHistoricoPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const project = await getProjectByCode(id);
  if (!project) return <DiagShell user={user} title="Validação IA" active="document"><div className="rounded-3xl border border-slate-800 bg-[#111827] p-5 text-sm text-rose-200">Projeto não encontrado.</div></DiagShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <DiagShell user={user} title="Validação IA" active="document"><div className="rounded-3xl border border-slate-800 bg-[#111827] p-5 text-sm text-rose-200">Sem permissão.</div></DiagShell>;

  const presentation = await buildProjectPresentation(project);
  const latest = await getLatestHistoricalDiagnosis(project.id);
  const validations = await listHistoricalDiagnosisValidations(project.id, 10);

  return (
    <DiagShell user={user} title="Validação da leitura IA" subtitle="Aqui a leitura da IA é revisada antes de virar entrega final. O objetivo é decidir com clareza: aprovar, ajustar ou bloquear." active="document" project={{ name: project.name, code: project.code, client: project.legal_name, workflowState: project.workflow_state }} score={presentation.overallScore} status={latest ? "Leitura IA disponível" : "Sem leitura IA ainda"} cta={<Link href={`/projetos/${id}/entrega-final/`} className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-400/15">Ir para entrega final</Link>}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-3xl border border-slate-800 bg-[#111827] p-5 md:p-6">
          <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">Leitura IA</div>
          <h2 className="mt-2 text-xl font-semibold text-white">Resposta mais recente do motor</h2>
          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/30 p-4 text-sm text-slate-300 whitespace-pre-wrap">
            {latest?.response || "Nenhuma resposta de IA registrada ainda."}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 text-sm">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">Provider</div><div className="mt-2 text-white">{latest?.provider || '-'}</div></div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">Modelo</div><div className="mt-2 text-white">{latest?.model || '-'}</div></div>
          </div>
        </section>
        <div className="space-y-4">
          <StepGuidance title="Como revisar" description="Confirme se a leitura executiva bate com o contexto do projeto, com os números consolidados e com a estrutura de dívida. Se não bater, a decisão deve ser ajustar ou bloquear." />
          <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Últimas decisões</div>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              {validations.length ? validations.map((item) => <div key={item.id} className="rounded-xl border border-slate-800 px-3 py-3"><div className="font-medium text-white">{item.decision}</div><div className="text-xs text-slate-500">{item.validated_at}</div><div className="mt-2">{item.summary_text || item.note || '-'}</div></div>) : <div className="text-slate-400">Nenhuma decisão registrada ainda.</div>}
            </div>
          </div>
        </div>
      </div>
    </DiagShell>
  );
}
