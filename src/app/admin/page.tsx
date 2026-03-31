import { DiagShell } from "@/components/DiagShell";
import { requireUser } from "@/lib/guards";
import { ensureCsrfCookie } from "@/lib/csrf";
import { listUsers } from "@/lib/users";
import { appPath } from "@/lib/app-path";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const user = await requireUser();
  const q = await searchParams;
  const csrf = await ensureCsrfCookie();

  if (user.role !== "admin_master") {
    return <DiagShell user={user} title="Configurações" active="settings"><div className="rounded-3xl border border-white/8 bg-[#141414] p-5 text-sm text-rose-200">Sem permissão administrativa.</div></DiagShell>;
  }

  const users = await listUsers();

  return (
    <DiagShell user={user} title="Configurações" subtitle="Gestão própria de usuários e acessos do /diag" active="settings" score={0} status="Admin do módulo">
      <section className="rounded-3xl border border-white/8 bg-[#141414] p-5 md:p-6 mb-4">
        <div className="text-[11px] uppercase tracking-[0.24em] text-[#C8FF00]">Configurações</div>
        <h2 className="mt-2 text-xl font-semibold text-white">Criar / atualizar usuário</h2>
        <form action={appPath("/api/admin/users/create/")} method="post" className="mt-4 grid md:grid-cols-4 gap-2 text-sm">
          <input type="hidden" name="csrf_token" value={csrf} />
          <input name="email" type="email" placeholder="email" className="bg-slate-950/40 border border-white/8 rounded-lg px-3 py-2" required />
          <input name="name" type="text" placeholder="nome" className="bg-slate-950/40 border border-white/8 rounded-lg px-3 py-2" required />
          <select name="role" className="bg-slate-950/40 border border-white/8 rounded-lg px-3 py-2">
            <option value="consultor">consultor</option>
            <option value="head">head</option>
            <option value="diretoria">diretoria</option>
            <option value="admin_master">admin_master</option>
          </select>
          <input name="password" type="text" placeholder="senha inicial" className="bg-slate-950/40 border border-white/8 rounded-lg px-3 py-2" required />
          <button className="rounded-2xl border bg-[#C8FF00] px-4 py-3 text-sm font-medium text-[#0A0A0A] hover:bg-[#d6ff4d] md:col-span-4" type="submit">Salvar usuário</button>
        </form>
        {q.saved === "user" ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100 mt-3">Usuário salvo.</div> : null}
      </section>

      <section className="rounded-3xl border border-white/8 bg-[#141414] p-5 md:p-6 mb-4">
        <h2 className="text-xl font-semibold text-white">Reset de senha</h2>
        <form action={appPath("/api/admin/users/reset-password/")} method="post" className="mt-4 grid md:grid-cols-3 gap-2 text-sm">
          <input type="hidden" name="csrf_token" value={csrf} />
          <input name="email" type="email" placeholder="email do usuário" className="bg-slate-950/40 border border-white/8 rounded-lg px-3 py-2" required />
          <input name="new_password" type="text" placeholder="nova senha" className="bg-slate-950/40 border border-white/8 rounded-lg px-3 py-2" required />
          <button className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-[rgba(250,250,247,0.78)] hover:border-white/15" type="submit">Resetar senha</button>
        </form>
        {q.saved === "password" ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100 mt-3">Senha atualizada.</div> : null}
        {q.error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100 mt-3">Erro: {q.error}</div> : null}
      </section>

      <section className="rounded-3xl border border-white/8 bg-[#141414] p-5 md:p-6">
        <h2 className="text-xl font-semibold text-white">Usuários ativos do /diag</h2>
        <div className="mt-4 space-y-2 text-sm">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
              <span>{u.email}</span>
              <span className="rounded-full border border-white/8 px-3 py-1 text-xs">{u.role}</span>
            </div>
          ))}
        </div>
      </section>
    </DiagShell>
  );
}
