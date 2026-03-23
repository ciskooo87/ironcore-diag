import Link from "next/link";
import { DiagShell } from "@/components/DiagShell";
import { StepGuidance } from "@/components/diag-workflow-ui";
import { NormalizationReview } from "@/components/NormalizationReview";
import { requireUser } from "@/lib/guards";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { appPath } from "@/lib/app-path";
import { buildProjectPresentation } from "@/lib/diag-presenter";

export default async function ConferenciaPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const project = await getProjectByCode(id);
  if (!project) return <DiagShell user={user} title="Conferência" active="alerts"><div className="rounded-3xl border border-slate-800 bg-[#111827] p-5 text-sm text-rose-200">Projeto não encontrado.</div></DiagShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <DiagShell user={user} title="Conferência" active="alerts"><div className="rounded-3xl border border-slate-800 bg-[#111827] p-5 text-sm text-rose-200">Sem permissão.</div></DiagShell>;
  const presentation = await buildProjectPresentation(project);

  return <DiagShell user={user} title="Conferência da normatização" subtitle="Revise o consolidado, leia os alertas e só então libere a montagem do diagnóstico. Essa etapa existe para impedir análise em cima de base torta." active="alerts" project={{ name: project.name, code: project.code, client: project.legal_name, workflowState: project.workflow_state }} score={presentation.overallScore} status={project.workflow_state || "conferencia_normalizacao"} cta={<Link href={`/projetos/${id}/diagnostico/`} className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-400/15">Próxima etapa</Link>}><div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]"><section className="rounded-3xl border border-slate-800 bg-[#111827] p-5 md:p-6"><div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">Conferência</div><h2 className="mt-2 text-xl font-semibold text-white">Revisão do consolidado</h2>{query.error ? <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">Erro: {query.error === 'missing_normalization' ? 'Não existe normalização válida para confirmar.' : query.error}</div> : null}<div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]"><NormalizationReview payload={project.normalization_payload as any} /><div className="space-y-3">{presentation.attention.map((item) => <div key={item.title} className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4 text-sm"><div className="font-medium text-white">{item.title}</div><div className="mt-2 text-slate-400">{item.recommendation}</div></div>)}</div></div><form action={appPath(`/api/projects/${id}/normalization/confirm/`)} method="post" className="mt-4"><button type="submit" className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-400/15">Confirmar normatização</button>{query.saved ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100 mt-3">Conferência registrada.</div> : null}</form></section><StepGuidance title="Depois da conferência" description="Com a normatização confirmada, o fluxo libera a montagem do diagnóstico e a análise IA. A partir daí, a leitura deixa de ser só estrutural e passa a ser executiva." nextHref={`/projetos/${id}/diagnostico/`} nextLabel="Ir para diagnóstico" /></div></DiagShell>;
}
