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
  if (!project) return <DiagShell user={user} title="Relato do projeto" active="inputs"><div className="rounded-[28px] border border-black/5 bg-white p-5 surface-elevated text-sm text-[#B42318]">Projeto não encontrado.</div></DiagShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <DiagShell user={user} title="Relato do projeto" active="inputs"><div className="rounded-[28px] border border-black/5 bg-white p-5 surface-elevated text-sm text-[#B42318]">Sem permissão.</div></DiagShell>;
  const presentation = await buildProjectPresentation(project);
  return <DiagShell user={user} title="Relato do projeto" subtitle="Agora entra a história do caso: contexto, rupturas, eventos relevantes e o que o dado sozinho não conta." active="inputs" project={{ name: project.name, code: project.code, client: project.legal_name, workflowState: project.workflow_state }} score={presentation.overallScore} status={project.workflow_state || "relato_historico"} cta={<Link href={`/projetos/${id}/normalizacao/`} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-[#0F172A] transition hover:-translate-y-0.5 hover:border-black/15 hover:bg-[#F8FAFC]">Próxima etapa</Link>}><div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]"><section className="rounded-[28px] border border-black/5 bg-white p-6 surface-elevated md:p-7"><div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#98A2B3]">Relato</div><h2 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.03em] text-[#101828]">Histórico do projeto</h2><p className="mt-3 text-sm leading-7 text-[#667085]">Descreva o caso em linguagem executiva: contexto do cliente, viradas, riscos, eventos relevantes e hipóteses de causa.</p><form action={appPath(`/api/projects/${id}/context/save/`)} method="post" className="mt-5 grid gap-3 text-sm"><textarea name="historical_context" defaultValue={project.historical_context || ""} placeholder="Conte a história do projeto, pontos críticos, contexto do cliente, riscos percebidos e eventos relevantes..." className="min-h-56 rounded-lg border border-black/10 bg-white px-3 py-2 text-[#101828] placeholder:text-[#98A2B3]" /><button type="submit" className="rounded-2xl bg-[#0F172A] px-4 py-3 text-sm font-medium text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)] hover:-translate-y-0.5 hover:bg-[#111827]">Salvar relato e extrair pontos de atenção</button>{query.saved ? <div className="rounded-2xl border border-[#ABEFC6] bg-[#ECFDF3] px-4 py-3 text-sm text-[#027A48]">Relato salvo.</div> : null}</form></section><StepGuidance title="O que vem em seguida" description="Depois do relato, o sistema consegue consolidar cadastro, bases históricas e contexto numa normatização única. Essa é a etapa que transforma insumo bruto em estrutura pronta para análise." nextHref={`/projetos/${id}/normalizacao/`} nextLabel="Ir para normatização" /></div></DiagShell>;
}
