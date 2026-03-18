import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ProductHero } from "@/components/product-ui";
import { requireUser } from "@/lib/guards";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { appPath } from "@/lib/app-path";

export default async function NormalizacaoPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const project = await getProjectByCode(id);
  if (!project) return <AppShell user={user} title="Normatização"><div className="alert bad-bg">Projeto não encontrado.</div></AppShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <AppShell user={user} title="Normatização"><div className="alert bad-bg">Sem permissão.</div></AppShell>;
  return <AppShell user={user} title="Normatização automática" subtitle="Etapa 5 do workflow"><ProductHero eyebrow="etapa 5" title="Gere a normatização automática com conferência posterior" description="O sistema consolida cadastro, contexto e bases históricas em uma estrutura única."><Link href={`/projetos/${id}/conferencia/`} className="pill">Próxima etapa</Link></ProductHero><section className="card text-sm"><form action={appPath(`/api/projects/${id}/normalization/run/`)} method="post"><button type="submit" className="badge py-2 px-3 cursor-pointer">Rodar normatização</button>{query.saved ? <div className="alert ok-bg mt-3">Normatização gerada.</div> : null}</form>{project.ai_attention_points?.length ? <div className="mt-4"><div className="font-medium">Pontos de atenção extraídos</div><ul className="mt-2 space-y-2 text-slate-300">{project.ai_attention_points.map((item) => <li key={item}>• {item}</li>)}</ul></div> : null}</section></AppShell>;
}
