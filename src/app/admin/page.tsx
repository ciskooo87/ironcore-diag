import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/guards";
import { ensureCsrfCookie } from "@/lib/csrf";
import { listUsers } from "@/lib/users";
import { appPath } from "@/lib/app-path";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const user = await requireUser();
  const q = await searchParams;
  const csrf = await ensureCsrfCookie();

  if (user.role !== "admin_master") {
    return <AppShell user={user} title="Admin"><div className="alert bad-bg">Sem permissão administrativa.</div></AppShell>;
  }

  const users = await listUsers();

  return (
    <AppShell user={user} title="Admin do Diagnóstico" subtitle="Gestão própria de usuários e acessos do /diag">
      <section className="card mb-4">
        <h2 className="title">Criar / atualizar usuário</h2>
        <form action={appPath("/api/admin/users/create/")} method="post" className="mt-3 grid md:grid-cols-4 gap-2 text-sm">
          <input type="hidden" name="csrf_token" value={csrf} />
          <input name="email" type="email" placeholder="email" className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" required />
          <input name="name" type="text" placeholder="nome" className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" required />
          <select name="role" className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2">
            <option value="consultor">consultor</option>
            <option value="head">head</option>
            <option value="diretoria">diretoria</option>
            <option value="admin_master">admin_master</option>
          </select>
          <input name="password" type="text" placeholder="senha inicial" className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" required />
          <button className="badge py-2 cursor-pointer md:col-span-4" type="submit">Salvar usuário</button>
        </form>
        {q.saved === "user" ? <div className="alert ok-bg mt-3">Usuário salvo.</div> : null}
      </section>

      <section className="card mb-4">
        <h2 className="title">Reset de senha</h2>
        <form action={appPath("/api/admin/users/reset-password/")} method="post" className="mt-3 grid md:grid-cols-3 gap-2 text-sm">
          <input type="hidden" name="csrf_token" value={csrf} />
          <input name="email" type="email" placeholder="email do usuário" className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" required />
          <input name="new_password" type="text" placeholder="nova senha" className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" required />
          <button className="badge py-2 cursor-pointer" type="submit">Resetar senha</button>
        </form>
        {q.saved === "password" ? <div className="alert ok-bg mt-3">Senha atualizada.</div> : null}
        {q.error ? <div className="alert bad-bg mt-3">Erro: {q.error}</div> : null}
      </section>

      <section className="card">
        <h2 className="title">Usuários ativos do /diag</h2>
        <div className="mt-3 space-y-2 text-sm">
          {users.map((u) => (
            <div key={u.id} className="row">
              <span>{u.email}</span>
              <span className="pill">{u.role}</span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
