import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ProductHero } from "@/components/product-ui";
import { requireUser } from "@/lib/guards";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { appPath } from "@/lib/app-path";

export default async function ContextoPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const project = await getProjectByCode(id);
  if (!project) return <AppShell user={user} title="Relato do projeto"><div className="alert bad-bg">Projeto não encontrado.</div></AppShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <AppShell user={user} title="Relato do projeto"><div className="alert bad-bg">Sem permissão.</div></AppShell>;
  return <AppShell user={user} title="Relato do projeto e histórico" subtitle="Etapa 4 do workflow"><ProductHero eyebrow="etapa 4" title="Descreva o contexto para a IA extrair pontos de atenção" description="Aqui entra a visão humana do projeto, histórico e dores relevantes."><Link href={`/projetos/${id}/normalizacao/`} className="pill">Próxima etapa</Link></ProductHero><section className="card"><form action={appPath(`/api/projects/${id}/context/save`)} method="post" className="grid gap-3 text-sm"><textarea name="historical_context" defaultValue={project.historical_context || ''} placeholder="Conte a história do projeto, pontos críticos, contexto do cliente, riscos percebidos, eventos relevantes..." className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2 min-h-48" /><button type="submit" className="badge py-2 px-3 cursor-pointer">Salvar relato e extrair pontos de atenção</button>{query.saved ? <div className="alert ok-bg">Relato salvo.</div> : null}</form></section></AppShell>;
}
