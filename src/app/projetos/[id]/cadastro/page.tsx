import Link from "next/link";
import { DiagShell } from "@/components/DiagShell";
import { requireUser } from "@/lib/guards";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { appPath } from "@/lib/app-path";
import { buildProjectPresentation } from "@/lib/diag-presenter";

export default async function CadastroPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const project = await getProjectByCode(id);
  if (!project) return <DiagShell user={user} title="Cadastro" active="overview"><div className="rounded-3xl border border-slate-800 bg-[#111827] p-5 text-sm text-rose-200">Projeto não encontrado.</div></DiagShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <DiagShell user={user} title="Cadastro" active="overview"><div className="rounded-3xl border border-slate-800 bg-[#111827] p-5 text-sm text-rose-200">Sem permissão.</div></DiagShell>;
  const presentation = await buildProjectPresentation(project);
  return <DiagShell user={user} title="Cadastro do projeto" subtitle="Dados-base do cliente e do projeto para abrir a jornada diagnóstica." active="overview" project={{ name: project.name, code: project.code, client: project.legal_name, workflowState: project.workflow_state }} score={presentation.overallScore} status={project.workflow_state || 'cadastro'} cta={<Link href={`/projetos/${id}/upload-historico/`} className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-400/15">Próxima etapa</Link>}><section className="rounded-3xl border border-slate-800 bg-[#111827] p-5 md:p-6"><div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">Visão Geral</div><h2 className="mt-2 text-xl font-semibold text-white">Cadastro do projeto</h2><p className="mt-2 text-sm text-slate-400">Essa etapa estrutura a base do diagnóstico e contextualiza o projeto no pipeline.</p><form action={appPath(`/api/projects/${id}/cadastro/save/`)} method="post" className="mt-5 grid gap-3 text-sm md:grid-cols-2"><input name="name" defaultValue={project.name} placeholder="Nome" required className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" /><input name="cnpj" defaultValue={project.cnpj} placeholder="CNPJ" required className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" /><input name="legal_name" defaultValue={project.legal_name} placeholder="Razão social" required className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2 md:col-span-2" /><input name="segment" defaultValue={project.segment} placeholder="Segmento" required className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" /><input name="partners" defaultValue={(project.partners || []).join(', ')} placeholder="Sócios" className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" /><textarea name="project_summary" defaultValue={project.project_summary} placeholder="Resumo do projeto" className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2 min-h-32 md:col-span-2" /><button type="submit" className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-400/15 md:col-span-2">Salvar cadastro</button>{query.saved ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100 md:col-span-2">Projeto criado. Revise e avance.</div> : null}</form></section></DiagShell>;
}
