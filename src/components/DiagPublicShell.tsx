import Link from "next/link";
import type { ReactNode } from "react";
import { appPath } from "@/lib/app-path";
import { WORKFLOW_STEPS } from "@/lib/diag-workflow";

const NAV = [
  { key: "overview", label: "🧭 Visão Geral", href: "/login/" },
  { key: "inputs", label: "📊 Dados & Inputs", href: "/login/" },
  { key: "ia", label: "🧠 Diagnóstico IA", href: "/login/" },
  { key: "alerts", label: "⚠️ Pontos de Atenção", href: "/login/" },
  { key: "validation", label: "✅ Validação", href: "/login/" },
  { key: "document", label: "📄 Documento Final", href: "/login/" },
  { key: "history", label: "🧬 Histórico", href: "/login/" },
  { key: "settings", label: "⚙️ Configurações", href: "/login/" },
] as const;

export function DiagPublicShell({ title, subtitle, children, active = "overview" }: { title: string; subtitle?: string; children: ReactNode; active?: string; }) {
  return (
    <main className="min-h-screen bg-[#0F172A] text-slate-100">
      <div className="mx-auto max-w-[1600px] px-3 py-4 md:px-5">
        <div className="mb-4 rounded-3xl border border-slate-800 bg-[#111827] p-4 lg:hidden">
          <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">From data to decision</div>
          <div className="mt-2 text-lg font-semibold text-white">IRONCORE /diag</div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {NAV.map((item) => (
              <Link key={item.key} href={appPath(item.href)} className={`whitespace-nowrap rounded-2xl border px-3 py-2 text-xs ${active === item.key ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-100" : "border-slate-800 bg-slate-950/20 text-slate-300"}`}>{item.label}</Link>
            ))}
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {WORKFLOW_STEPS.map((step) => (
              <div key={step.key} className="whitespace-nowrap rounded-xl border border-slate-800 bg-slate-950/20 px-3 py-2 text-xs text-slate-400">{step.label}</div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 lg:gap-5">
          <aside className="hidden w-[280px] shrink-0 rounded-3xl border border-slate-800 bg-[#111827] p-4 lg:block">
            <div className="mb-6">
              <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">From data to decision</div>
              <div className="mt-2 text-xl font-semibold text-white">IRONCORE /diag</div>
              <div className="mt-2 text-sm text-slate-400">Pipeline contínuo de diagnóstico, validação e entrega.</div>
            </div>
            <nav className="space-y-2">
              {NAV.map((item) => (
                <Link key={item.key} href={item.href} className={`block rounded-2xl border px-3 py-3 text-sm transition ${active === item.key ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-100" : "border-slate-800 bg-slate-950/20 text-slate-300 hover:border-slate-700 hover:bg-slate-900/50"}`}>{item.label}</Link>
              ))}
            </nav>
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/30 p-3">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Pipeline</div>
              <div className="mt-3 space-y-2 text-xs">
                {WORKFLOW_STEPS.map((step) => (
                  <div key={step.key} className="rounded-xl border border-slate-800 bg-slate-950/20 px-3 py-2 text-slate-400">{step.label}</div>
                ))}
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <header className="mb-4 rounded-3xl border border-slate-800 bg-[#111827] p-4 md:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">controle executivo</div>
                  <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">{title}</h1>
                  {subtitle ? <p className="mt-2 max-w-3xl text-sm text-slate-400 md:text-base">{subtitle}</p> : null}
                </div>
                <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                  <Link href={appPath('/diagnotico/')} className="rounded-2xl border border-slate-700 bg-slate-950/30 px-4 py-3 text-sm text-slate-200 hover:border-slate-600">Ver LP</Link>
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
