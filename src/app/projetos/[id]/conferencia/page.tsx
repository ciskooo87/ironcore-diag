import Link from "next/link";
import { DiagShell } from "@/components/DiagShell";
import { requireUser } from "@/lib/guards";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { appPath } from "@/lib/app-path";
import { buildProjectPresentation } from "@/lib/diag-presenter";

export default async function ConferenciaPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const project = await getProjectByCode(id);
  if (!project) return <DiagShell user={user} title="Conferência" active="alerts"><div className="rounded-3xl border border-slate-800 bg-[#111827] p-5 text-sm text-rose-200">Projeto não encontrado.</div></DiagShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <DiagShell user={user} title="Conferência" active="alerts"><div className="rounded-3xl border border-slate-800 bg-[#111827] p-5 text-sm text-rose-200">Sem permissão.</div></DiagShell>;
  const presentation = await buildProjectPresentation(project);
  return <DiagShell user={user} title="Pontos de atenção" subtitle="Conferência da normatização e leitura dos alertas antes de entrar na análise IA." active="alerts" project={{ name: project.name, code: project.code, client: project.legal_name, workflowState: project.workflow_state }} score={presentation.overallScore} status={project.workflow_state || 'conferencia_normalizacao'} cta={<Link href={`/projetos/${id}/diagnostico/`} className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-400/15">Próxima etapa</Link>}><section className="rounded-3xl border border-slate-800 bg-[#111827] p-5 md:p-6"><div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">Backlog crítico</div><h2 className="mt-2 text-xl font-semibold text-white">Pontos de atenção e conferência da normatização</h2><div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]"><pre className="overflow-auto rounded-2xl border border-slate-800 bg-slate-950/30 p-4 text-xs text-slate-300">{JSON.stringify(project.normalization_payload || {}, null, 2)}</pre><div className="space-y-3">{presentation.attention.map((item) => <div key={item.title} className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4 text-sm"><div className="font-medium text-white">{item.title}</div><div className="mt-2 text-slate-400">{item.recommendation}</div></div>)}</div></div><form action={appPath(`/api/projects/${id}/normalization/confirm/`)} method="post" className="mt-4"><button type="submit" className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-400/15">Confirmar normatização</button>{query.saved ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100 mt-3">Conferência registrada.</div> : null}</form></section></DiagShell>;
}
