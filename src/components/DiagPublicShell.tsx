import Link from "next/link";
import type { ReactNode } from "react";
import { appPath } from "@/lib/app-path";

export function DiagPublicShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode; }) {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#FAFAF7]">
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-10">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/8 bg-[#141414] p-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-[#C8FF00]">Diagnóstico financeiro com IA</div>
            <h1 className="mt-3 font-['Syne',var(--font-geist-sans)] text-3xl font-extrabold tracking-[-0.03em] text-[#FAFAF7] md:text-5xl">{title}</h1>
            {subtitle ? <p className="mt-3 max-w-3xl text-sm leading-7 text-[rgba(250,250,247,0.6)] md:text-base">{subtitle}</p> : null}
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <Link href={appPath('/')} className="rounded-lg border border-white/8 px-4 py-3 text-sm text-[rgba(250,250,247,0.7)] hover:border-white/20 hover:text-[#FAFAF7]">Voltar para a landing</Link>
          </div>
        </header>
        <section>{children}</section>
      </div>
    </main>
  );
}
