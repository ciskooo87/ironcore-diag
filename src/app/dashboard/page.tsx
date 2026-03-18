import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ProductHero, StatusPill, EmptyState } from "@/components/product-ui";
import { requireUser } from "@/lib/guards";
import { listProjectsForUser } from "@/lib/projects";

export default async function DashboardPage() {
  const user = await requireUser();
  const projects = await listProjectsForUser(user.email, user.role);
  return (
    <AppShell user={user} title="Dashboard" subtitle="Produto completo do diagnóstico: cadastro, upload, relato, normatização, IA, validação e entrega final">
      <ProductHero eyebrow="workflow completo" title="Diagnóstico histórico como produto de ponta a ponta" description="Fluxo: novo projeto > cadastro > upload bases > relato > normatização > conferência > diagnóstico > IA > validação humana > entrega final.">
        <StatusPill label={`Projetos: ${projects.length}`} tone={projects.length ? "good" : "warn"} />
        <Link href="/projetos/novo/" className="pill">Novo projeto</Link>
      </ProductHero>
      {projects.length === 0 ? <EmptyState title="Nenhum projeto visível" description="Crie um novo projeto para iniciar o fluxo." /> : null}
      <div className="grid md:grid-cols-2 gap-3">
        {projects.map((project) => (
          <div key={project.id} className="card">
            <div className="text-xs text-slate-400">{project.segment || "segmento não informado"} · estado {project.workflow_state || 'novo'}</div>
            <div className="text-lg font-semibold mt-1">{project.name}</div>
            <div className="text-sm text-slate-400 mt-1">{project.project_summary || "Sem resumo executivo"}</div>
            <div className="flex gap-2 mt-4 flex-wrap">
              <Link href={`/projetos/${project.code}/cadastro/`} className="pill">Cadastro</Link>
              <Link href={`/projetos/${project.code}/upload-historico/`} className="pill">Upload</Link>
              <Link href={`/projetos/${project.code}/contexto/`} className="pill">Relato</Link>
              <Link href={`/projetos/${project.code}/entrega-final/`} className="pill">Entrega final</Link>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
