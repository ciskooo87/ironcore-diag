import Link from "next/link";
import { DiagShell } from "@/components/DiagShell";
import { requireUser } from "@/lib/guards";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { appPath } from "@/lib/app-path";
import { buildProjectPresentation } from "@/lib/diag-presenter";

export default async function NormalizacaoPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const project = await getProjectByCode(id);
  if (!project) return <DiagShell user={user} title="Normatização" active="inputs"><div className="rounded-3xl border border-slate-800 bg-[#111827] p-5 text-sm text-rose-200">Projeto não encontrado.</div></DiagShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <DiagShell user={user} title="Normatização" active="inputs"><div className="rounded-3xl border border-slate-800 bg-[#111827] p-5 text-sm text-rose-200">Sem permissão.</div></DiagShell>;
  const presentation = await buildProjectPresentation(project);

  return (
    <DiagShell user={user} title="Estruturação" subtitle="Normatização automática com conferência posterior. Aqui o dado vira estrutura utilizável pelo diagnóstico." active="inputs" project={{ name: project.name, code: project.code, client: project.legal_name, workflowState: project.workflow_state }} score={presentation.overallScore} status={project.workflow_state || 'normalizacao'} cta={<Link href={`/projetos/${id}/conferencia/`} className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-400/15">Próxima etapa</Link>}>
      <section className="rounded-3xl border border-slate-800 bg-[#111827] p-5 md:p-6">
        <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">Estruturação</div>
        <h2 className="mt-2 text-xl font-semibold text-white">Gerar normatização automática</h2>
        <p className="mt-2 text-sm text-slate-400">O sistema consolida cadastro, contexto e bases históricas em uma estrutura única pronta para análise.</p>
        <form action={appPath(`/api/projects/${id}/normalization/run/`)} method="post" className="mt-5">
          <button type="submit" className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-400/15">Rodar normatização</button>
          {query.saved ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100 mt-3">Normatização gerada.</div> : null}
        </form>
        {project.ai_attention_points?.length ? <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/30 p-4 text-sm"><div className="font-medium text-white">Pontos de atenção extraídos</div><ul className="mt-3 space-y-2 text-slate-300">{project.ai_attention_points.map((item) => <li key={item}>• {item}</li>)}</ul></div> : null}
      </section>
    </DiagShell>
  );
}
