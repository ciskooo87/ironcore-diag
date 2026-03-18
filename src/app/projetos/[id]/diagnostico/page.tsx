import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ProductHero, EmptyState } from "@/components/product-ui";
import { requireUser } from "@/lib/guards";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { getLatestHistoricalDiagnosis } from "@/lib/historical-diagnosis";

export default async function DiagnosticoPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const project = await getProjectByCode(id);
  if (!project) return <AppShell user={user} title="Diagnóstico"><div className="alert bad-bg">Projeto não encontrado.</div></AppShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <AppShell user={user} title="Diagnóstico"><div className="alert bad-bg">Sem permissão.</div></AppShell>;
  const latest = await getLatestHistoricalDiagnosis(project.id);
  return <AppShell user={user} title="Montagem do diagnóstico" subtitle="Etapas 7 e 8 do workflow"><ProductHero eyebrow="etapas 7 e 8" title="Monte o diagnóstico e rode a análise de IA" description="Esta etapa consolida a base normatizada com a análise gerada por IA."><Link href={`/projetos/${id}/entrega-final/`} className="pill">Próxima etapa</Link></ProductHero>{query.saved ? <div className="alert ok-bg mb-4">Diagnóstico gerado.</div> : null}{query.error ? <div className="alert bad-bg mb-4">Erro: {query.error}</div> : null}<section className="card text-sm"><form action={`/api/projects/${id}/historical-diagnosis/run`} method="post"><button type="submit" className="badge py-2 px-3 cursor-pointer">Gerar análise IA</button></form>{latest ? <pre className="mt-4 whitespace-pre-wrap text-slate-300">{latest.response || latest.error || '-'}</pre> : <div className="mt-4"><EmptyState title="Sem análise ainda" description="Gere a análise IA para montar o diagnóstico." /></div>}</section></AppShell>;
}
