import Link from "next/link";
import type { ReactNode } from "react";
import type { SessionUser } from "@/lib/auth";
import { appPath } from "@/lib/app-path";
import { WORKFLOW_STEPS } from "@/lib/diag-workflow";

const NAV = [
  { key: "overview", label: "🧭 Projetos", href: "/projetos" },
  { key: "inputs", label: "📊 Dados & Inputs", href: "/upload-historico/" },
  { key: "ia", label: "🧠 Diagnóstico IA", href: "/diagnostico/" },
  { key: "alerts", label: "⚠️ Pontos de Atenção", href: "/conferencia/" },
  { key: "validation", label: "✅ Validação", href: "/entrega-final/" },
  { key: "document", label: "📄 Documento Final", href: "/entrega-final/" },
  { key: "history", label: "🧬 Histórico", href: "/historico/" },
  { key: "settings", label: "⚙️ Configurações", href: "/admin/" },
] as const;

function scoreTone(score: number) {
  if (score >= 75) return "text-[#C8FF00] border-[rgba(200,255,0,0.25)] bg-[rgba(200,255,0,0.08)]";
  if (score >= 45) return "text-amber-200 border-amber-400/25 bg-amber-400/10";
  return "text-rose-200 border-rose-400/25 bg-rose-400/10";
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

export function DiagShell({ user, title, subtitle, children, project, active, score = 0, status = "Em estruturação", cta }: { user: SessionUser; title: string; subtitle?: string; children: ReactNode; project?: { name: string; code: string; client?: string; workflowState?: string }; active?: string; score?: number; status?: string; cta?: ReactNode; }) {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#FAFAF7]">
      <div className="mx-auto max-w-[1600px] px-3 py-4 md:px-5">
        <div className="mb-4 rounded-3xl border border-white/8 bg-[#141414] p-4 lg:hidden">
          <div className="text-[11px] uppercase tracking-[0.24em] text-[#C8FF00]">From data to decision</div>
          <div className="mt-2 text-lg font-semibold text-white">IRONCORE /diag</div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {NAV.map((item) => {
              const href = navHref(item.href, project?.code);
              const isActive = active === item.key;
              return <Link key={item.key} href={href} className={`whitespace-nowrap rounded-2xl border px-3 py-2 text-xs ${isActive ? "border-[rgba(200,255,0,0.25)] bg-[rgba(200,255,0,0.08)] text-[#C8FF00]" : "border-white/8 bg-black/20 text-[rgba(250,250,247,0.72)]"}`}>{item.label}</Link>;
            })}
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {WORKFLOW_STEPS.map((step) => {
              const stepHref = workflowHref(step.key, project?.code);
              return <Link key={step.key} href={stepHref} className={`whitespace-nowrap rounded-xl border px-3 py-2 text-xs ${project?.workflowState === step.key ? "border-[rgba(200,255,0,0.25)] bg-[rgba(200,255,0,0.08)] text-[#C8FF00]" : "border-white/8 bg-black/20 text-[rgba(250,250,247,0.45)] hover:border-white/15 hover:bg-white/5"}`}>{step.label}</Link>;
            })}
          </div>
        </div>

        <div className="flex gap-4 lg:gap-5">
          <aside className="hidden w-[280px] shrink-0 rounded-3xl border border-white/8 bg-[#141414] p-4 lg:block">
            <div className="mb-6">
              <div className="text-[11px] uppercase tracking-[0.24em] text-[#C8FF00]">From data to decision</div>
              <div className="mt-2 text-xl font-semibold text-white">IRONCORE /diag</div>
              <div className="mt-2 text-sm text-[rgba(250,250,247,0.58)]">Pipeline contínuo de diagnóstico, validação e entrega.</div>
            </div>
            <nav className="space-y-2">
              {NAV.map((item) => {
                const href = navHref(item.href, project?.code);
                const isActive = active === item.key;
                return <Link key={item.key} href={href} className={`block rounded-2xl border px-3 py-3 text-sm transition ${isActive ? "border-[rgba(200,255,0,0.25)] bg-[rgba(200,255,0,0.08)] text-[#C8FF00]" : "border-white/8 bg-black/20 text-[rgba(250,250,247,0.72)] hover:border-white/15 hover:bg-white/5"}`}>{item.label}</Link>;
              })}
            </nav>
            <div className="mt-6 rounded-2xl border border-white/8 bg-black/20 p-3">
              <div className="text-xs uppercase tracking-[0.18em] text-[#6B6B6B]">Pipeline</div>
              <div className="mt-3 space-y-2 text-xs">
                {WORKFLOW_STEPS.map((step) => {
                  const stepHref = workflowHref(step.key, project?.code);
                  return <Link key={step.key} href={stepHref} className={`block rounded-xl border px-3 py-2 ${project?.workflowState === step.key ? "border-[rgba(200,255,0,0.25)] bg-[rgba(200,255,0,0.08)] text-[#C8FF00]" : "border-white/8 bg-black/20 text-[rgba(250,250,247,0.45)] hover:border-white/15 hover:bg-white/5"}`}>{step.label}</Link>;
                })}
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <header className="mb-4 rounded-3xl border border-white/8 bg-[#141414] p-4 md:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-[#C8FF00]">controle executivo</div>
                  <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">{title}</h1>
                  {subtitle ? <p className="mt-2 max-w-3xl text-sm text-[rgba(250,250,247,0.58)] md:text-base">{subtitle}</p> : null}
                  {project ? <div className="mt-4 flex flex-wrap gap-2 text-xs text-[rgba(250,250,247,0.78)]"><span className="rounded-full border border-white/8 bg-black/20 px-3 py-1.5"><span className="text-[#6B6B6B]">Projeto:</span> {project.name}</span><span className="rounded-full border border-white/8 bg-black/20 px-3 py-1.5"><span className="text-[#6B6B6B]">Cliente:</span> {project.client || project.name}</span><span className="rounded-full border border-white/8 bg-black/20 px-3 py-1.5"><span className="text-[#6B6B6B]">Código:</span> {project.code}</span></div> : null}
                </div>
                <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm"><div className="text-xs uppercase tracking-[0.18em] text-[#6B6B6B]">Status</div><div className="mt-1 font-medium text-white">{status}</div></div>
                  <div className={`rounded-2xl border px-4 py-3 text-center ${scoreTone(score)}`}><div className="text-xs uppercase tracking-[0.18em]">Score</div><div className="mt-1 text-xl font-semibold">{score}</div></div>
                  {cta ? <div className="flex flex-wrap gap-2">{cta}</div> : null}
                  <form action={appPath("/api/auth/logout/")} method="post"><button type="submit" className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-[rgba(250,250,247,0.72)] hover:border-white/15 hover:text-white">Sair</button></form>
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
