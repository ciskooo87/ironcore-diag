import { DiagShell } from "@/components/DiagShell";
import { StepGuidance } from "@/components/diag-workflow-ui";
import { requireUser } from "@/lib/guards";
import { appPath } from "@/lib/app-path";

export default async function NewProjectPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser();
  const query = await searchParams;

  return (
    <DiagShell user={user} title="Novo projeto" subtitle="Começo limpo do diagnóstico: abrir o projeto certo, registrar o cliente e preparar a jornada completa até a entrega final." active="overview" score={0} status="Novo projeto">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-3xl border border-white/8 bg-[#141414] p-5 md:p-6">
          <div className="text-[11px] uppercase tracking-[0.24em] text-[#C8FF00]">Entrada</div>
          <h2 className="mt-2 text-xl font-semibold text-white">Criar projeto para iniciar o diagnóstico</h2>
          <p className="mt-2 text-sm text-[rgba(250,250,247,0.58)]">Preencha só o necessário para abrir a operação e seguir para o cadastro completo.</p>
          <form action={appPath("/api/projects/create/")} method="post" className="mt-5 grid gap-3 text-sm md:grid-cols-2">
            <input name="name" placeholder="Nome" required className="bg-slate-950/40 border border-white/8 rounded-lg px-3 py-2" />
            <input name="cnpj" placeholder="CNPJ" required className="bg-slate-950/40 border border-white/8 rounded-lg px-3 py-2" />
            <input name="legal_name" placeholder="Razão social" required className="bg-slate-950/40 border border-white/8 rounded-lg px-3 py-2 md:col-span-2" />
            <input name="segment" placeholder="Segmento" required className="bg-slate-950/40 border border-white/8 rounded-lg px-3 py-2" />
            <input name="partners" placeholder="Sócios (separados por vírgula)" className="bg-slate-950/40 border border-white/8 rounded-lg px-3 py-2" />
            <textarea name="project_summary" placeholder="Resumo do projeto" className="bg-slate-950/40 border border-white/8 rounded-lg px-3 py-2 min-h-32 md:col-span-2" />
            <button type="submit" className="rounded-2xl border bg-[#C8FF00] px-4 py-3 text-sm font-medium text-[#0A0A0A] hover:bg-[#d6ff4d] md:col-span-2">Criar projeto</button>
            {query.error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100 md:col-span-2">Erro: {query.error}</div> : null}
          </form>
        </section>
        <StepGuidance
          title="O que acontece depois"
          description="Depois de criar o projeto, o fluxo segue por cadastro, upload das bases históricas, relato do caso, normatização, conferência, análise IA, validação humana e entrega final em tela e documento."
        />
      </div>
    </DiagShell>
  );
}
