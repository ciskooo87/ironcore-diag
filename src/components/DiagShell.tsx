import Link from "next/link";
import type { ReactNode } from "react";
import type { SessionUser } from "@/lib/auth";
import { appPath } from "@/lib/app-path";
import { WORKFLOW_STEPS } from "@/lib/diag-workflow";

const NAV = [
  { key: "overview", label: "Projetos", href: "/projetos" },
  { key: "inputs", label: "Dados & inputs", href: "/upload-historico/" },
  { key: "ia", label: "Diagnóstico", href: "/diagnostico/" },
  { key: "alerts", label: "Conferência", href: "/conferencia/" },
  { key: "validation", label: "Validação", href: "/entrega-final/" },
  { key: "document", label: "Entrega final", href: "/entrega-final/" },
  { key: "history", label: "Histórico", href: "/historico/" },
  { key: "settings", label: "Configurações", href: "/admin/" },
] as const;

function scoreTone(score: number) {
  if (score >= 75) return "border-[#ABEFC6] bg-[#ECFDF3] text-[#027A48]";
  if (score >= 45) return "border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]";
  return "border-[#FECDCA] bg-[#FEF3F2] text-[#B42318]";
}

function navHref(itemHref: string, projectCode?: string) {
  if (itemHref === "/admin/" || itemHref === "/projetos") return itemHref;
  if (!projectCode) return "/projetos/";
  return `/projetos/${projectCode}${itemHref}`;
}

function workflowHref(stepKey: string, projectCode?: string) {
  if (!projectCode) return stepKey === "novo_projeto" ? "/projetos/novo/" : "/projetos/";
  const projectBase = `/projetos/${projectCode}`;
  switch (stepKey) {
    case "novo_projeto": return "/projetos/novo/";
    case "cadastro": return `${projectBase}/cadastro/`;
    case "upload_historico": return `${projectBase}/upload-historico/`;
    case "relato_historico": return `${projectBase}/contexto/`;
    case "normalizacao": return `${projectBase}/normalizacao/`;
    case "conferencia_normalizacao": return `${projectBase}/conferencia/`;
    case "montagem_diagnostico":
    case "analise_ia": return `${projectBase}/diagnostico/`;
    case "validacao_humana":
    case "entrega_final": return `${projectBase}/entrega-final/`;
    default: return projectBase;
  }
}

function NavPill({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={[
        "block w-full rounded-2xl border px-3 py-2.5 text-sm leading-6 transition",
        active
          ? "border-[#D0D5DD] bg-white text-[#101828] shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
          : "border-black/5 bg-[#F8FAFC] text-[#475467] hover:border-black/10 hover:bg-white hover:text-[#101828]",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export function DiagShell({ user, title, subtitle, children, project, active, score = 0, status = "Em estruturação", cta }: { user: SessionUser; title: string; subtitle?: string; children: ReactNode; project?: { name: string; code: string; client?: string; workflowState?: string }; active?: string; score?: number; status?: string; cta?: ReactNode; }) {
  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#101828]">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.08),transparent_35%),linear-gradient(180deg,#FFFFFF_0%,#F7F8FA_58%,#F7F8FA_100%)]" />

      <div className="mx-auto max-w-[1600px] px-4 py-4 md:px-6 lg:px-8">
        <div className="surface-elevated mb-4 rounded-[28px] border border-black/5 bg-white p-4 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-[#F8FAFC]">
              <img src={appPath("/brand/ironcore-mark.webp")} alt="IronCore" width={28} height={28} className="h-9 w-9 object-contain" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#98A2B3]">IronCore Diag</div>
              <div className="text-base font-semibold text-[#101828]">From data to decision</div>
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {NAV.map((item) => (
              <NavPill key={item.key} href={navHref(item.href, project?.code)} label={item.label} active={active === item.key} />
            ))}
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {WORKFLOW_STEPS.map((step) => (
              <Link
                key={step.key}
                href={workflowHref(step.key, project?.code)}
                className={[
                  "whitespace-nowrap rounded-xl border px-3 py-2 text-xs transition",
                  project?.workflowState === step.key
                    ? "border-[#D0D5DD] bg-white text-[#101828]"
                    : "border-black/5 bg-[#F8FAFC] text-[#667085] hover:border-black/10 hover:bg-white",
                ].join(" ")}
              >
                {step.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex gap-5">
          <aside className="surface-elevated hidden w-[300px] shrink-0 rounded-[32px] border border-black/5 bg-white p-5 lg:block">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-[#F8FAFC]">
                <img src={appPath("/brand/ironcore-mark.webp")} alt="IronCore" width={30} height={30} className="h-9 w-9 object-contain" />
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#98A2B3]">IronCore Diag</div>
                <div className="text-lg font-semibold text-[#101828]">Pipeline executivo</div>
              </div>
            </div>

            <p className="mb-5 text-sm leading-7 text-[#667085]">
              Cadastro, bases, consolidação, análise e entrega final dentro da mesma linguagem visual e operacional.
            </p>

            <nav className="grid grid-cols-1 gap-2">
              {NAV.map((item) => (
                <NavPill key={item.key} href={navHref(item.href, project?.code)} label={item.label} active={active === item.key} />
              ))}
            </nav>

            <div className="mt-6 rounded-[24px] border border-black/5 bg-[#F8FAFC] p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#98A2B3]">Etapas do fluxo</div>
              <div className="mt-3 space-y-2">
                {WORKFLOW_STEPS.map((step) => (
                  <Link
                    key={step.key}
                    href={workflowHref(step.key, project?.code)}
                    className={[
                      "block rounded-xl border px-3 py-2 text-xs transition",
                      project?.workflowState === step.key
                        ? "border-[#D0D5DD] bg-white text-[#101828]"
                        : "border-black/5 bg-white text-[#667085] hover:border-black/10 hover:text-[#101828]",
                    ].join(" ")}
                  >
                    {step.label}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <header className="surface-elevated mb-4 rounded-[32px] border border-black/5 bg-white p-5 md:p-6">
              <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#98A2B3]">Controle executivo</div>
                  <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#101828] md:text-3xl">{title}</h1>
                  {subtitle ? <p className="mt-3 max-w-3xl text-sm leading-7 text-[#667085] md:text-base">{subtitle}</p> : null}
                  {project ? (
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#344054]">
                      <span className="rounded-full border border-black/5 bg-[#F8FAFC] px-3 py-1.5"><span className="text-[#98A2B3]">Projeto:</span> {project.name}</span>
                      <span className="rounded-full border border-black/5 bg-[#F8FAFC] px-3 py-1.5"><span className="text-[#98A2B3]">Cliente:</span> {project.client || project.name}</span>
                      <span className="rounded-full border border-black/5 bg-[#F8FAFC] px-3 py-1.5"><span className="text-[#98A2B3]">Código:</span> {project.code}</span>
                    </div>
                  ) : null}
                </div>

                <div className="flex w-full flex-col gap-3 2xl:w-auto 2xl:min-w-[420px] 2xl:max-w-[620px] 2xl:items-end">
                  <div className="flex flex-wrap items-stretch gap-3 2xl:justify-end">
                    <div className="min-w-[180px] rounded-2xl border border-black/5 bg-[#F8FAFC] px-4 py-3 text-sm">
                      <div className="text-xs uppercase tracking-[0.18em] text-[#98A2B3]">Status</div>
                      <div className="mt-1 font-medium text-[#101828]">{status}</div>
                    </div>

                    <div className={`min-w-[92px] rounded-2xl border px-4 py-3 text-center ${scoreTone(score)}`}>
                      <div className="text-xs uppercase tracking-[0.18em]">Score</div>
                      <div className="mt-1 text-xl font-semibold">{score}</div>
                    </div>
                  </div>

                  {cta ? <div className="flex w-full flex-wrap gap-2 2xl:justify-end">{cta}</div> : null}

                  <form action={appPath("/api/auth/logout/")} method="post" className="2xl:self-end">
                    <button type="submit" className="rounded-2xl border border-black/5 bg-[#F8FAFC] px-4 py-3 text-sm text-[#475467] transition hover:border-black/10 hover:bg-white hover:text-[#101828]">
                      Sair
                    </button>
                  </form>
                </div>
              </div>
            </header>

            <section>{children}</section>
          </div>
        </div>
      </div>
    </main>
  );
}
