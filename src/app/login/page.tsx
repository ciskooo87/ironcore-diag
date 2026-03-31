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
        <div className="rounded-3xl border border-white/8 bg-[#141414] p-6">
          <div className="text-[11px] uppercase tracking-[0.24em] text-[#C8FF00]">Produto</div>
          <h2 className="mt-2 font-['Syne',var(--font-geist-sans)] text-2xl font-bold text-[#FAFAF7]">Diagnóstico com narrativa, IA e validação</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2 text-sm text-[rgba(250,250,247,0.75)]">
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">📊 Upload e estruturação dos dados com confiança da base.</div>
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">🧠 Diagnóstico IA com evidência e contexto.</div>
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">✅ Validação auditável por humano.</div>
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">📄 Documento final com narrativa e plano de ação.</div>
          </div>
        </div>

        <section className="rounded-3xl border border-white/8 bg-[#141414] p-6">
          <div className="text-[11px] uppercase tracking-[0.24em] text-[#C8FF00]">Acesso</div>
          <h2 className="mt-2 font-['Syne',var(--font-geist-sans)] text-3xl font-bold text-[#FAFAF7]">Login</h2>
          <p className="mt-2 text-sm text-[rgba(250,250,247,0.55)]">Acesso ao produto de diagnóstico histórico</p>
          <form action={appPath("/api/auth/login/")} method="post" className="mt-6 space-y-3">
            <input type="hidden" name="csrf_token" value={csrf} />
            <input name="email" type="email" placeholder="Email" required className="w-full rounded-lg border border-white/8 bg-black/20 px-3 py-3 text-sm" />
            <input name="password" type="password" placeholder="Senha" required className="w-full rounded-lg border border-white/8 bg-black/20 px-3 py-3 text-sm" />
            <button type="submit" className="w-full rounded-lg bg-[#C8FF00] px-4 py-3 text-sm font-medium text-[#0A0A0A] hover:bg-[#d6ff4d]">Entrar</button>
          </form>
          {errorMessage ? <div className="mt-3 rounded-2xl border border-[#FF3B30]/30 bg-[#FF3B30]/10 px-4 py-3 text-sm text-[#ffd1cd]">{errorMessage}</div> : null}
        </section>
      </section>
    </DiagPublicShell>
  );
}
