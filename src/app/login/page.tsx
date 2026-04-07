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
      title="Acesse o IRONCORE DIAG"
      subtitle="Entre para subir bases, gerar diagnóstico, validar a análise e consolidar a entrega final em um único fluxo."
    >
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
          <div className="text-[11px] uppercase tracking-[0.24em] text-[#0F172A]">Produto</div>
          <h2 className="mt-2 font-['Syne',var(--font-geist-sans)] text-2xl font-bold text-[#FAFAF7]">Diagnóstico com narrativa, IA e validação</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2 text-sm text-[#475467]">
            <div className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-4">📊 Upload e estruturação dos dados com confiança da base.</div>
            <div className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-4">🧠 Diagnóstico IA com evidência e contexto.</div>
            <div className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-4">✅ Validação auditável por humano.</div>
            <div className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-4">📄 Documento final com narrativa e plano de ação.</div>
          </div>
        </div>

        <section className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
          <div className="text-[11px] uppercase tracking-[0.24em] text-[#0F172A]">Acesso</div>
          <h2 className="mt-2 font-['Syne',var(--font-geist-sans)] text-3xl font-bold text-[#FAFAF7]">Login</h2>
          <p className="mt-2 text-sm text-[rgba(250,250,247,0.55)]">Acesso ao produto de diagnóstico histórico</p>
          <form action={appPath("/api/auth/login/")} method="post" className="mt-6 space-y-3">
            <input type="hidden" name="csrf_token" value={csrf} />
            <input name="email" type="email" placeholder="Email" required className="w-full rounded-lg border border-black/5 bg-[#F8FAFC] px-3 py-3 text-sm" />
            <input name="password" type="password" placeholder="Senha" required className="w-full rounded-lg border border-black/5 bg-[#F8FAFC] px-3 py-3 text-sm" />
            <button type="submit" className="w-full rounded-lg bg-[#0F172A] px-4 py-3 text-sm font-medium text-white hover:bg-[#111827]">Entrar</button>
          </form>
          {errorMessage ? <div className="mt-3 rounded-2xl border border-[#FF3B30]/30 bg-[#FF3B30]/10 px-4 py-3 text-sm text-[#ffd1cd]">{errorMessage}</div> : null}
        </section>
      </section>
    </DiagPublicShell>
  );
}
