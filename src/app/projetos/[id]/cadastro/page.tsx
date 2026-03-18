import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ProductHero } from "@/components/product-ui";
import { requireUser } from "@/lib/guards";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { appPath } from "@/lib/app-path";

export default async function CadastroPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const project = await getProjectByCode(id);
  if (!project) return <AppShell user={user} title="Cadastro"><div className="alert bad-bg">Projeto não encontrado.</div></AppShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <AppShell user={user} title="Cadastro"><div className="alert bad-bg">Sem permissão.</div></AppShell>;
  return <AppShell user={user} title="Cadastro do projeto" subtitle="Etapa 2 do workflow"><ProductHero eyebrow="etapa 2" title="Confirme os dados do projeto" description="Cadastro enxuto conforme solicitado." ><Link href={`/projetos/${id}/upload-historico/`} className="pill">Próxima etapa</Link></ProductHero><section className="card"><form action={appPath(`/api/projects/${id}/cadastro/save/`)} method="post" className="grid gap-3 text-sm"><input name="name" defaultValue={project.name} placeholder="Nome" required className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" /><input name="cnpj" defaultValue={project.cnpj} placeholder="CNPJ" required className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" /><input name="legal_name" defaultValue={project.legal_name} placeholder="Razão social" required className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" /><input name="segment" defaultValue={project.segment} placeholder="Segmento" required className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" /><input name="partners" defaultValue={(project.partners || []).join(', ')} placeholder="Sócios" className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" /><textarea name="project_summary" defaultValue={project.project_summary} placeholder="Resumo do projeto" className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2 min-h-28" /><button type="submit" className="badge py-2 px-3 cursor-pointer">Salvar cadastro</button>{query.saved ? <div className="alert ok-bg">Projeto criado. Revise e avance.</div> : null}</form></section></AppShell>;
}
