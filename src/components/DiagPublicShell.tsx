import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { appPath } from "@/lib/app-path";

export function DiagPublicShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode; }) {
  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#101828]">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.08),transparent_35%),linear-gradient(180deg,#FFFFFF_0%,#F7F8FA_58%,#F7F8FA_100%)]" />

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <header className="surface-elevated mb-8 rounded-[32px] border border-black/5 bg-white p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-none items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-[#F8FAFC]">
                <Image src="/brand/ironcore-symbol.png" alt="IronCore" width={30} height={30} className="h-8 w-8 object-contain" />
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#98A2B3]">IronCore Diag</div>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#101828] md:text-5xl">{title}</h1>
                {subtitle ? <p className="mt-3 max-w-3xl text-sm leading-7 text-[#667085] md:text-base">{subtitle}</p> : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 md:justify-end">
              <Link href={appPath("/")} className="rounded-2xl border border-black/5 bg-[#F8FAFC] px-4 py-3 text-sm font-medium text-[#475467] transition hover:border-black/10 hover:bg-white hover:text-[#101828]">
                Voltar para a landing
              </Link>
            </div>
          </div>
        </header>

        <section>{children}</section>
      </div>
    </main>
  );
}
