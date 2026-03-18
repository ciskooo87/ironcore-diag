import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ProductHero } from "@/components/product-ui";
import { requireUser } from "@/lib/guards";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { appPath } from "@/lib/app-path";

export default async function ConferenciaPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const project = await getProjectByCode(id);
  if (!project) return <AppShell user={user} title="Conferência"><div className="alert bad-bg">Projeto não encontrado.</div></AppShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <AppShell user={user} title="Conferência"><div className="alert bad-bg">Sem permissão.</div></AppShell>;
  return <AppShell user={user} title="Conferência da normatização" subtitle="Etapa 6 do workflow"><ProductHero eyebrow="etapa 6" title="Revise a base normatizada antes de montar o diagnóstico" description="Normalização automática com conferência humana."><Link href={appPath(`/projetos/${id}/diagnostico/`)} className="pill">Próxima etapa</Link></ProductHero><section className="card text-sm"><pre className="whitespace-pre-wrap text-slate-300">{JSON.stringify(project.normalization_payload || {}, null, 2)}</pre><form action={appPath(`/api/projects/${id}/normalization/confirm`)} method="post" className="mt-4"><button type="submit" className="badge py-2 px-3 cursor-pointer">Confirmar normatização</button>{query.saved ? <div className="alert ok-bg mt-3">Conferência registrada.</div> : null}</form></section></AppShell>;
}
