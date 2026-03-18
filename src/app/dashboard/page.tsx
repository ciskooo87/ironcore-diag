import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ProductHero, StatusPill, EmptyState } from "@/components/product-ui";
import { requireUser } from "@/lib/guards";
import { listProjectsForUser } from "@/lib/projects";

export default async function DashboardPage() {
  const user = await requireUser();
  const projects = await listProjectsForUser(user.email, user.role);
  return (
    <AppShell user={user} title="Dashboard" subtitle="Carteira de projetos pronta para upload histórico e diagnóstico executivo">
      <ProductHero eyebrow="produto separado" title="Diagnóstico histórico como produto próprio" description="Aqui entra só o fluxo de base histórica, leitura consolidada, diagnóstico com IA e validação executiva.">
        <StatusPill label={`Projetos: ${projects.length}`} tone={projects.length ? "good" : "warn"} />
      </ProductHero>
      {projects.length === 0 ? <EmptyState title="Nenhum projeto visível" description="Garanta permissões em project_permissions ou use um usuário head/admin." /> : null}
      <div className="grid md:grid-cols-2 gap-3">
        {projects.map((project) => (
          <div key={project.id} className="card">
            <div className="text-xs text-slate-400">{project.segment || "segmento não informado"}</div>
            <div className="text-lg font-semibold mt-1">{project.name}</div>
            <div className="text-sm text-slate-400 mt-1">{project.project_summary || "Sem resumo executivo"}</div>
            <div className="flex gap-2 mt-4 flex-wrap">
              <Link href={`/projetos/${project.code}/diario`} className="pill">Subir base histórica</Link>
              <Link href={`/projetos/${project.code}/diagnostico-historico`} className="pill">Diagnóstico histórico</Link>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
