import { AppShell } from "@/components/AppShell";
import { ProductHero } from "@/components/product-ui";
import { requireUser } from "@/lib/guards";
import { appPath } from "@/lib/app-path";

export default async function NewProjectPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser();
  const query = await searchParams;
  return <AppShell user={user} title="Novo projeto" subtitle="Início do fluxo de diagnóstico histórico"><ProductHero eyebrow="etapa 1" title="Crie um novo projeto para iniciar o diagnóstico" description="A partir daqui o fluxo segue cadastro, bases históricas, relato, normalização, IA, validação e entrega." /><section className="card"><form action={appPath("/api/projects/create/")} method="post" className="grid gap-3 text-sm"><input name="name" placeholder="Nome" required className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" /><input name="cnpj" placeholder="CNPJ" required className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" /><input name="legal_name" placeholder="Razão social" required className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" /><input name="segment" placeholder="Segmento" required className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" /><input name="partners" placeholder="Sócios (separados por vírgula)" className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" /><textarea name="project_summary" placeholder="Resumo do projeto" className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2 min-h-28" /><button type="submit" className="badge py-2 px-3 cursor-pointer">Criar projeto</button>{query.error ? <div className="alert bad-bg">Erro: {query.error}</div> : null}</form></section></AppShell>;
}
