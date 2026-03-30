import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ensureCsrfCookie } from "@/lib/csrf";
import { appPath } from "@/lib/app-path";
import { DiagPublicShell } from "@/components/DiagPublicShell";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await getSessionUser();
  if (user) redirect("/projetos");

  const params = await searchParams;
  const csrf = await ensureCsrfCookie();
  const errorMessage = params.error === "csrf"
    ? "Sessão do formulário expirou. Tente entrar novamente."
    : params.error === "rate"
      ? "Muitas tentativas. Aguarde um pouco e tente de novo."
      : params.error
        ? "Credenciais inválidas."
        : null;

  return (
    <DiagPublicShell
      title="From data to decision in one flow"
      subtitle="Input → Estruturação → Análise IA → Validação → Narrativa → Output. Entre para continuar o pipeline do diagnóstico."
      active="overview"
    >
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-3xl border border-slate-800 bg-[#111827] p-5 md:p-6">
          <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">Produto</div>
          <h2 className="mt-2 text-xl font-semibold text-white">Diagnóstico com narrativa, IA e validação</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 text-sm text-slate-300">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">📊 Upload e estruturação dos dados com confiança da base.</div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">🧠 Diagnóstico IA com evidência e contexto.</div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">✅ Validação auditável por humano.</div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">📄 Documento final com narrativa e plano de ação.</div>
          </div>
        </div>

        <section className="rounded-3xl border border-slate-800 bg-[#111827] p-5 md:p-6">
          <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">Acesso</div>
          <h2 className="mt-2 text-2xl font-semibold text-white">Login</h2>
          <p className="mt-2 text-sm text-slate-400">Acesso ao produto de diagnóstico histórico</p>
          <form action={appPath("/api/auth/login/")} method="post" className="mt-4 space-y-3">
            <input type="hidden" name="csrf_token" value={csrf} />
            <input name="email" type="email" placeholder="email" required className="w-full bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
            <input name="password" type="password" placeholder="senha" required className="w-full bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
            <button type="submit" className="w-full rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-400/15">Entrar</button>
          </form>
          {errorMessage ? <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100 mt-3">{errorMessage}</div> : null}
        </section>
      </section>
    </DiagPublicShell>
  );
}
