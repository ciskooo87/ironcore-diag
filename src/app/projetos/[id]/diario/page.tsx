import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ProductHero, StatusPill } from "@/components/product-ui";
import { requireUser } from "@/lib/guards";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { listDailyEntries } from "@/lib/daily";
import { todayInSaoPauloISO } from "@/lib/time";

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const project = await getProjectByCode(id);
  if (!project) return <AppShell user={user} title="Upload Histórico"><div className="alert bad-bg">Projeto não encontrado.</div></AppShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <AppShell user={user} title="Upload Histórico"><div className="alert bad-bg">Sem permissão.</div></AppShell>;

  const entries = (await listDailyEntries(project.id, 50)).filter((e) => String((e.payload || {}).notes || "").includes("upload_kind:historico_"));
  return (
    <AppShell user={user} title="Upload da Base Histórica" subtitle="Porta de entrada do produto de diagnóstico histórico">
      <ProductHero eyebrow="base histórica" title="Suba as bases históricas que alimentam o diagnóstico" description="Este produto foi separado para focar na ingestão histórica e geração do diagnóstico executivo.">
        <StatusPill label={`Uploads históricos: ${entries.length}`} tone={entries.length ? "good" : "warn"} />
        <Link href={`/projetos/${id}/diagnostico-historico`} className="pill">Abrir diagnóstico</Link>
      </ProductHero>

      {query.saved ? <div className="alert ok-bg mb-4">Base histórica enviada.</div> : null}
      {query.error ? <div className="alert bad-bg mb-4">Erro: {query.error}</div> : null}

      <section className="card mb-4">
        <h2 className="title">Upload de bases históricas</h2>
        <p className="text-sm text-slate-400 mt-1">Envie as categorias que formam a leitura histórica consolidada.</p>
        <div className="grid md:grid-cols-3 gap-3 mt-3 text-sm">
          {[
            ["historico_faturamento", "Histórico · Faturamento"],
            ["historico_contas_pagar", "Histórico · Contas a Pagar"],
            ["historico_contas_receber", "Histórico · Contas a Receber"],
            ["historico_extratos", "Histórico · Extratos"],
            ["historico_estoques", "Histórico · Estoques"],
            ["historico_carteira", "Histórico · Carteira de Pedidos"],
            ["historico_borderos", "Histórico · Borderôs"],
            ["historico_endividamento", "Histórico · Endividamento"],
          ].map(([kind, label]) => (
            <form key={kind} action={`/api/projects/${id}/daily/upload`} method="post" encType="multipart/form-data" className="card !p-3">
              <div className="font-medium mb-2">{label}</div>
              <input type="hidden" name="upload_kind" value={kind} />
              <input name="business_date" type="date" defaultValue={todayInSaoPauloISO()} required className="mb-2 bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" />
              <input name="file" type="file" accept=".csv,.xlsx,.xls,.xlsm,.pdf" required className="mb-2 bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" />
              <input name="notes" placeholder="observações / origem / responsável" className="mb-2 bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" />
              <button type="submit" className="badge py-2 cursor-pointer">Enviar</button>
            </form>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="title">Últimos uploads históricos</h2>
        <div className="mt-3 space-y-2 text-sm">
          {entries.length === 0 ? <div className="alert muted-bg">Nenhuma base histórica enviada ainda.</div> : null}
          {entries.map((e) => {
            const p = e.payload as Record<string, unknown>;
            return (
              <div key={e.id} className="rounded-lg border border-slate-800 p-3">
                <div className="text-xs text-slate-400">{e.business_date} · {String(p.notes || "")}</div>
                <div className="mt-2 text-slate-300">Faturamento: {Number(p.faturamento || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
              </div>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
