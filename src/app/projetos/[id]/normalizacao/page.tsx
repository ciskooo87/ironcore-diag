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
  if (!project) return <DiagShell user={user} title="Normatização" active="inputs"><div className="rounded-3xl border border-slate-800 bg-[#111827] p-5 text-sm text-rose-200">Projeto não encontrado.</div></DiagShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <DiagShell user={user} title="Normatização" active="inputs"><div className="rounded-3xl border border-slate-800 bg-[#111827] p-5 text-sm text-rose-200">Sem permissão.</div></DiagShell>;
  const presentation = await buildProjectPresentation(project);
  const workflow = await buildWorkflowChecklist(project);

  return (
    <DiagShell user={user} title="Normatização automática" subtitle="Aqui o sistema consolida cadastro, bases históricas e relato em uma estrutura única pronta para conferência e análise." active="inputs" project={{ name: project.name, code: project.code, client: project.legal_name, workflowState: project.workflow_state }} score={presentation.overallScore} status={project.workflow_state || "normalizacao"} cta={<Link href={`/projetos/${id}/conferencia/`} className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-400/15">Próxima etapa</Link>}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-3xl border border-slate-800 bg-[#111827] p-5 md:p-6">
          <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">Normatização</div>
          <h2 className="mt-2 text-xl font-semibold text-white">Gerar estrutura consolidada</h2>
          <p className="mt-2 text-sm text-slate-400">Esse passo prepara a leitura técnica do caso. A conferência vem logo depois para impedir que a IA rode em cima de estrutura mal fechada.</p>
          <form action={appPath(`/api/projects/${id}/normalization/run/`)} method="post" className="mt-5">
            <button type="submit" className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-400/15">Rodar normatização</button>
            {query.saved ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100 mt-3">Normatização gerada.</div> : null}
          </form>
          <div className="mt-5">
            <WorkflowChecklist items={workflow.checklist.slice(0, 5)} compact />
          </div>
          {project.ai_attention_points?.length ? <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/30 p-4 text-sm"><div className="font-medium text-white">Pontos de atenção extraídos</div><ul className="mt-3 space-y-2 text-slate-300">{project.ai_attention_points.map((item) => <li key={item}>• {item}</li>)}</ul></div> : null}
        </section>
        <StepGuidance title="Critério de saída" description="A próxima etapa é a conferência da normatização. O objetivo ali é checar se o consolidado faz sentido antes de montar o diagnóstico e chamar a IA." nextHref={`/projetos/${id}/conferencia/`} nextLabel="Ir para conferência" />
      </div>
    </DiagShell>
  );
}
