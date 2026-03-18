import Link from "next/link";
import type { SessionUser } from "@/lib/auth";
import { appPath } from "@/lib/app-path";

export function AppShell({ title, subtitle, user, children }: { title: string; subtitle?: string; user: SessionUser; children: React.ReactNode }) {
  return (
    <main className="min-h-screen p-4 md:p-6">
      <header className="card mb-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-[12px] uppercase tracking-[0.28em] text-cyan-300">IRONCORE DIAG</div>
            <h1 className="text-2xl font-semibold tracking-tight mt-1">{title}</h1>
            {subtitle ? <p className="text-sm text-slate-400 mt-1">{subtitle}</p> : null}
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <Link href="/dashboard" className="pill">Dashboard</Link>
            <span className="pill">{user.name}</span>
            <span className="pill">{user.role}</span>
            <form action={appPath("/api/auth/logout")} method="post">
              <button className="pill" type="submit">Sair</button>
            </form>
          </div>
        </div>
      </header>
      <section>{children}</section>
    </main>
  );
}
