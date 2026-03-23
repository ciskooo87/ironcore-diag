import Link from "next/link";
import { DiagShell } from "@/components/DiagShell";
import { StepGuidance } from "@/components/diag-workflow-ui";
import { requireUser } from "@/lib/guards";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { appPath } from "@/lib/app-path";
import { buildProjectPresentation } from "@/lib/diag-presenter";

export default async function ContextoPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const project = await getProjectByCode(id);
  if (!project) return <DiagShell user={user} title="Relato do projeto" active="inputs"><div className="rounded-3xl border border-slate-800 bg-[#111827] p-5 text-sm text-rose-200">Projeto não encontrado.</div></DiagShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <DiagShell user={user} title="Relato do projeto" active="inputs"><div className="rounded-3xl border border-slate-800 bg-[#111827] p-5 text-sm text-rose-200">Sem permissão.</div></DiagShell>;
  const presentation = await buildProjectPresentation(project);
  return <DiagShell user={user} title="Relato do projeto" subtitle="Agora entra a história do caso: contexto, rupturas, eventos relevantes e o que o dado sozinho não conta." active="inputs" project={{ name: project.name, code: project.code, client: project.legal_name, workflowState: project.workflow_state }} score={presentation.overallScore} status={project.workflow_state || "relato_historico"} cta={<Link href={`/projetos/${id}/normalizacao/`} className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-400/15">Próxima etapa</Link>}><div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]"><section className="rounded-3xl border border-slate-800 bg-[#111827] p-5 md:p-6"><div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">Relato</div><h2 className="mt-2 text-xl font-semibold text-white">Histórico do projeto</h2><p className="mt-2 text-sm text-slate-400">Descreva o caso em linguagem executiva: contexto do cliente, viradas, riscos, eventos relevantes e hipóteses de causa.</p><form action={appPath(`/api/projects/${id}/context/save/`)} method="post" className="mt-5 grid gap-3 text-sm"><textarea name="historical_context" defaultValue={project.historical_context || ""} placeholder="Conte a história do projeto, pontos críticos, contexto do cliente, riscos percebidos e eventos relevantes..." className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2 min-h-56" /><button type="submit" className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-400/15">Salvar relato e extrair pontos de atenção</button>{query.saved ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">Relato salvo.</div> : null}</form></section><StepGuidance title="O que vem em seguida" description="Depois do relato, o sistema consegue consolidar cadastro, bases históricas e contexto numa normatização única. Essa é a etapa que transforma insumo bruto em estrutura pronta para análise." nextHref={`/projetos/${id}/normalizacao/`} nextLabel="Ir para normatização" /></div></DiagShell>;
}
