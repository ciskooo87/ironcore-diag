import Link from "next/link";
import { DiagShell } from "@/components/DiagShell";
import { StepGuidance, WorkflowChecklist } from "@/components/diag-workflow-ui";
import { requireUser } from "@/lib/guards";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { appPath } from "@/lib/app-path";
import { buildProjectPresentation } from "@/lib/diag-presenter";
import { buildWorkflowChecklist } from "@/lib/diag-workflow";

export default async function NormalizacaoPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const project = await getProjectByCode(id);
  if (!project) return <DiagShell user={user} title="Normatização" active="inputs"><div className="rounded-[28px] border border-black/5 bg-white p-5 surface-elevated text-sm text-[#B42318]">Projeto não encontrado.</div></DiagShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <DiagShell user={user} title="Normatização" active="inputs"><div className="rounded-[28px] border border-black/5 bg-white p-5 surface-elevated text-sm text-[#B42318]">Sem permissão.</div></DiagShell>;
  const presentation = await buildProjectPresentation(project);
  const workflow = await buildWorkflowChecklist(project);

  return (
    <DiagShell user={user} title="Normatização automática" subtitle="Aqui o sistema consolida cadastro, bases históricas e relato em uma estrutura única pronta para conferência e análise." active="inputs" project={{ name: project.name, code: project.code, client: project.legal_name, workflowState: project.workflow_state }} score={presentation.overallScore} status={project.workflow_state || "normalizacao"} cta={<Link href={`/projetos/${id}/conferencia/`} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-[#0F172A] transition hover:-translate-y-0.5 hover:border-black/15 hover:bg-[#F8FAFC]">Próxima etapa</Link>}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-[28px] border border-black/5 bg-white p-6 surface-elevated md:p-7">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#98A2B3]">Normatização</div>
          <h2 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.03em] text-[#101828]">Gerar estrutura consolidada</h2>
          <p className="mt-3 text-sm leading-7 text-[#667085]">Esse passo prepara a leitura técnica do caso. A conferência vem logo depois para impedir que a IA rode em cima de estrutura mal fechada.</p>
          <form action={appPath(`/api/projects/${id}/normalization/run/`)} method="post" className="mt-5">
            <button type="submit" className="rounded-2xl bg-[#0F172A] px-4 py-3 text-sm font-medium text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)] hover:-translate-y-0.5 hover:bg-[#111827]">Rodar normatização</button>
            {query.saved ? <div className="rounded-2xl border border-[#ABEFC6] bg-[#ECFDF3] px-4 py-3 text-sm text-[#027A48] mt-3">Normatização gerada.</div> : null}
          </form>
          <div className="mt-5">
            <WorkflowChecklist items={workflow.checklist.slice(0, 5)} compact />
          </div>
          {project.ai_attention_points?.length ? <div className="mt-5 rounded-2xl border border-black/5 bg-[#F8FAFC] p-4 md:p-5 text-sm"><div className="font-medium text-[#101828]">Pontos de atenção extraídos</div><ul className="mt-3 space-y-2 text-[#475467]">{project.ai_attention_points.map((item) => <li key={item}>• {item}</li>)}</ul></div> : null}
        </section>
        <StepGuidance title="Critério de saída" description="A próxima etapa é a conferência da normatização. O objetivo ali é checar se o consolidado faz sentido antes de montar o diagnóstico e chamar a IA." nextHref={`/projetos/${id}/conferencia/`} nextLabel="Ir para conferência" />
      </div>
    </DiagShell>
  );
}
