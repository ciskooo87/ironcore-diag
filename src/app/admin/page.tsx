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
    return <DiagShell user={user} title="Configurações" active="settings"><div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] text-sm text-rose-200">Sem permissão administrativa.</div></DiagShell>;
  }

  const users = await listUsers();

  return (
    <DiagShell user={user} title="Configurações" subtitle="Gestão própria de usuários e acessos do /diag" active="settings" score={0} status="Admin do módulo">
      <section className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] md:p-6 mb-4">
        <div className="text-[11px] uppercase tracking-[0.24em] text-[#0F172A]">Configurações</div>
        <h2 className="mt-2 text-xl font-semibold text-[#101828]">Criar / atualizar usuário</h2>
        <form action={appPath("/api/admin/users/create/")} method="post" className="mt-4 grid md:grid-cols-4 gap-2 text-sm">
          <input type="hidden" name="csrf_token" value={csrf} />
          <input name="email" type="email" placeholder="email" className="bg-white border border-black/10 rounded-lg px-3 py-2" required />
          <input name="name" type="text" placeholder="nome" className="bg-white border border-black/10 rounded-lg px-3 py-2" required />
          <select name="role" className="bg-white border border-black/10 rounded-lg px-3 py-2">
            <option value="consultor">consultor</option>
            <option value="head">head</option>
            <option value="diretoria">diretoria</option>
            <option value="admin_master">admin_master</option>
          </select>
          <input name="password" type="text" placeholder="senha inicial" className="bg-white border border-black/10 rounded-lg px-3 py-2" required />
          <button className="rounded-2xl border bg-[#0F172A] px-4 py-3 text-sm font-medium text-white hover:bg-[#111827] md:col-span-4" type="submit">Salvar usuário</button>
        </form>
        {q.saved === "user" ? <div className="rounded-2xl border border-[#ABEFC6] bg-[#ECFDF3] px-4 py-3 text-sm text-[#027A48] mt-3">Usuário salvo.</div> : null}
      </section>

      <section className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] md:p-6 mb-4">
        <h2 className="text-xl font-semibold text-[#101828]">Reset de senha</h2>
        <form action={appPath("/api/admin/users/reset-password/")} method="post" className="mt-4 grid md:grid-cols-3 gap-2 text-sm">
          <input type="hidden" name="csrf_token" value={csrf} />
          <input name="email" type="email" placeholder="email do usuário" className="bg-white border border-black/10 rounded-lg px-3 py-2" required />
          <input name="new_password" type="text" placeholder="nova senha" className="bg-white border border-black/10 rounded-lg px-3 py-2" required />
          <button className="rounded-2xl border border-black/5 bg-[#F8FAFC] px-4 py-3 text-sm text-[#344054] hover:border-white/15" type="submit">Resetar senha</button>
        </form>
        {q.saved === "password" ? <div className="rounded-2xl border border-[#ABEFC6] bg-[#ECFDF3] px-4 py-3 text-sm text-[#027A48] mt-3">Senha atualizada.</div> : null}
        {q.error ? <div className="rounded-2xl border border-[#FECDCA] bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318] mt-3">Erro: {q.error}</div> : null}
      </section>

      <section className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] md:p-6">
        <h2 className="text-xl font-semibold text-[#101828]">Usuários ativos do /diag</h2>
        <div className="mt-4 space-y-2 text-sm">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-2xl border border-black/5 bg-[#F8FAFC] px-4 py-3">
              <span>{u.email}</span>
              <span className="rounded-full border border-white/8 px-3 py-1 text-xs">{u.role}</span>
            </div>
          ))}
        </div>
      </section>
    </DiagShell>
  );
}
