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
  if (!project) return <DiagShell user={user} title="Validação IA" active="document"><div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] text-sm text-[#B42318]">Projeto não encontrado.</div></DiagShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <DiagShell user={user} title="Validação IA" active="document"><div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] text-sm text-[#B42318]">Sem permissão.</div></DiagShell>;

  const presentation = await buildProjectPresentation(project);
  const latest = await getLatestHistoricalDiagnosis(project.id);
  const validations = await listHistoricalDiagnosisValidations(project.id, 10);

  return (
    <DiagShell user={user} title="Validação da leitura IA" subtitle="Aqui a leitura da IA é revisada antes de virar entrega final. O objetivo é decidir com clareza: aprovar, ajustar ou bloquear." active="document" project={{ name: project.name, code: project.code, client: project.legal_name, workflowState: project.workflow_state }} score={presentation.overallScore} status={latest ? "Leitura IA disponível" : "Sem leitura IA ainda"} cta={<Link href={`/projetos/${id}/entrega-final/`} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-[#0F172A] transition hover:border-black/15 hover:bg-[#F8FAFC]">Ir para entrega final</Link>}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] md:p-6">
          <div className="text-[11px] uppercase tracking-[0.24em] text-[#667085]">Leitura IA</div>
          <h2 className="mt-2 text-xl font-semibold text-[#101828]">Resposta mais recente do motor</h2>
          <div className="mt-4 rounded-2xl border border-black/5 bg-[#F8FAFC] p-4 text-sm whitespace-pre-wrap text-[#475467]">
            {latest?.response || "Nenhuma resposta de IA registrada ainda."}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 text-sm">
            <div className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-4"><div className="text-xs uppercase tracking-[0.18em] text-[#98A2B3]">Provider</div><div className="mt-2 text-[#101828]">{latest?.provider || '-'}</div></div>
            <div className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-4"><div className="text-xs uppercase tracking-[0.18em] text-[#98A2B3]">Modelo</div><div className="mt-2 text-[#101828]">{latest?.model || '-'}</div></div>
          </div>
        </section>
        <div className="space-y-4">
          <StepGuidance title="Como revisar" description="Confirme se a leitura executiva bate com o contexto do projeto, com os números consolidados e com a estrutura de dívida. Se não bater, a decisão deve ser ajustar ou bloquear." />
          <div className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-[#98A2B3]">Últimas decisões</div>
            <div className="mt-3 space-y-2 text-sm text-[#475467]">
              {validations.length ? validations.map((item) => <div key={item.id} className="rounded-xl border border-black/5 bg-white px-3 py-3"><div className="font-medium text-[#101828]">{item.decision}</div><div className="text-xs text-[#98A2B3]">{item.validated_at}</div><div className="mt-2">{item.summary_text || item.note || '-'}</div></div>) : <div className="text-[#667085]">Nenhuma decisão registrada ainda.</div>}
            </div>
          </div>
        </div>
      </div>
    </DiagShell>
  );
}
