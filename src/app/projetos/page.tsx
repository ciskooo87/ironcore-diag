import Link from "next/link";
import { DiagShell } from "@/components/DiagShell";
import { ArchiveProjectButton } from "@/components/ArchiveProjectButton";
import { requireUser } from "@/lib/guards";
import { getWorkflowStepLabel } from "@/lib/diag-workflow";
import { listProjectsForUser } from "@/lib/projects";
import { getProjectContinueHref } from "@/lib/project-navigation";
import { appPath } from "@/lib/app-path";

function statusTone(step?: string) {
  if (step === "entrega_final") return "border-emerald-400/30 bg-emerald-400/10 text-emerald-100";
  if (step === "validacao_humana" || step === "analise_ia" || step === "montagem_diagnostico") return "border-amber-400/30 bg-amber-400/10 text-amber-100";
  return "border-cyan-400/30 bg-cyan-400/10 text-cyan-100";
}

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ deleted?: string; restored?: string; purged?: string; view?: string }> }) {
  const user = await requireUser();
  const query = await searchParams;
  const isAdmin = user.role === "admin_master";
  const includeArchived = isAdmin && query.view === "archived";
  const projects = await listProjectsForUser(user.email, user.role, includeArchived);

  return (
    <DiagShell
      user={user}
      title="Projetos em andamento"
      subtitle="Escolha o projeto certo para continuar a operação sem se perder no fluxo. Cada card já aponta para a próxima etapa útil da jornada."
      active="overview"
      score={projects.length}
      status={projects.length ? `${projects.length} projeto${projects.length > 1 ? "s" : ""} ${includeArchived ? "arquivado" : "disponível"}${projects.length > 1 ? "s" : ""}` : includeArchived ? "Sem projetos arquivados" : "Sem projetos disponíveis"}
      cta={
        <div className="flex flex-wrap gap-2">
          <Link href="/projetos/novo/" className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-400/15">Novo projeto</Link>
          {isAdmin ? (
            <Link href={includeArchived ? "/projetos" : "/projetos?view=archived"} className="rounded-2xl border border-slate-700 bg-slate-950/30 px-4 py-3 text-sm text-slate-200 hover:border-slate-600">
              {includeArchived ? "Ver ativos" : "Ver arquivados"}
            </Link>
          ) : null}
        </div>
      }
    >
      {query.deleted ? <section className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">Projeto movido para a lixeira lógica com sucesso.</section> : null}
      {query.restored ? <section className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">Projeto restaurado para a lista principal.</section> : null}
      {query.purged ? <section className="mb-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">Projeto excluído definitivamente do banco.</section> : null}

      {!projects.length ? (
        <section className="rounded-3xl border border-slate-800 bg-[#111827] p-8 text-sm text-slate-300">
          {includeArchived ? "Nenhum projeto arquivado." : <>Nenhum projeto disponível para o seu usuário. <Link className="text-cyan-300" href="/projetos/novo/">Criar novo projeto</Link>.</>}
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {projects.map((project) => {
            const continueHref = getProjectContinueHref(project);
            const stepLabel = getWorkflowStepLabel(project.workflow_state);

            return (
              <section key={project.id} className="rounded-3xl border border-slate-800 bg-[#111827] p-5 md:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">Projeto</div>
                    <h2 className="mt-2 text-xl font-semibold text-white">{project.name}</h2>
                    <p className="mt-1 text-sm text-slate-400">{project.legal_name}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs ${statusTone(project.workflow_state)}`}>{stepLabel}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                  <span className="rounded-full border border-slate-700 px-3 py-1">Código: {project.code}</span>
                  <span className="rounded-full border border-slate-700 px-3 py-1">Segmento: {project.segment || "Não informado"}</span>
                  {project.archived_at ? <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-amber-100">Arquivado</span> : null}
                </div>

                <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Resumo</div>
                  <p className="mt-2 line-clamp-4 text-sm text-slate-300">{project.project_summary?.trim() || "Projeto sem resumo preenchido ainda."}</p>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Link href={continueHref} className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-center text-sm text-cyan-100 hover:bg-cyan-400/15">Continuar projeto</Link>
                  <Link href={`/projetos/${project.code}/cadastro/`} className="rounded-2xl border border-slate-700 bg-slate-950/30 px-4 py-3 text-center text-sm text-slate-200 hover:border-slate-600">Abrir cadastro</Link>
                  <Link href={`/projetos/${project.code}/historico/`} className="rounded-2xl border border-slate-700 bg-slate-950/30 px-4 py-3 text-center text-sm text-slate-200 hover:border-slate-600">Ver histórico</Link>
                  <Link href={`/projetos/${project.code}/entrega-final/`} className="rounded-2xl border border-slate-700 bg-slate-950/30 px-4 py-3 text-center text-sm text-slate-200 hover:border-slate-600">Entrega final</Link>
                  {isAdmin ? (
                    <>
                      <div className="sm:col-span-2">
                        {project.archived_at ? (
                          <ArchiveProjectButton action={appPath(`/api/projects/${project.code}/restore/`)} label={`${project.name} (${project.code})`} mode="restore" />
                        ) : (
                          <ArchiveProjectButton action={appPath(`/api/projects/${project.code}/delete/`)} label={`${project.name} (${project.code})`} mode="archive" />
                        )}
                      </div>
                      {project.archived_at ? (
                        <div className="sm:col-span-2">
                          <ArchiveProjectButton action={appPath(`/api/projects/${project.code}/purge/`)} label={`${project.name} (${project.code})`} mode="purge" />
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </DiagShell>
  );
}
