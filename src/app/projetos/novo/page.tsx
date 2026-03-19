import { DiagShell } from "@/components/DiagShell";
import { requireUser } from "@/lib/guards";
import { appPath } from "@/lib/app-path";

export default async function NewProjectPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser();
  const query = await searchParams;

  return (
    <DiagShell user={user} title="Novo projeto" subtitle="Entrada do pipeline do diagnóstico. Aqui começa a jornada contínua: cadastro → inputs → IA → validação → output." active="overview" score={0} status="Novo projeto">
      <section className="rounded-3xl border border-slate-800 bg-[#111827] p-5 md:p-6">
        <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">Input</div>
        <h2 className="mt-2 text-xl font-semibold text-white">Criar projeto para iniciar o diagnóstico</h2>
        <form action={appPath("/api/projects/create/")} method="post" className="mt-5 grid gap-3 text-sm md:grid-cols-2">
          <input name="name" placeholder="Nome" required className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" />
          <input name="cnpj" placeholder="CNPJ" required className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" />
          <input name="legal_name" placeholder="Razão social" required className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2 md:col-span-2" />
          <input name="segment" placeholder="Segmento" required className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" />
          <input name="partners" placeholder="Sócios (separados por vírgula)" className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" />
          <textarea name="project_summary" placeholder="Resumo do projeto" className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2 min-h-32 md:col-span-2" />
          <button type="submit" className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-400/15 md:col-span-2">Criar projeto</button>
          {query.error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100 md:col-span-2">Erro: {query.error}</div> : null}
        </form>
      </section>
    </DiagShell>
  );
}
