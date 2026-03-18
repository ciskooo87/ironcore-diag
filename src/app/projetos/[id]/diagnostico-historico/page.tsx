import { AppShell } from "@/components/AppShell";
import { PrintButton } from "@/components/PrintButton";
import { EmptyState, ProductHero, StatusPill } from "@/components/product-ui";
import { requireUser } from "@/lib/guards";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { getHistoricalUploadAggregate, getLatestHistoricalDiagnosis } from "@/lib/historical-diagnosis";
import { listHistoricalDiagnosisValidations } from "@/lib/historical-validation";
import { ensureCsrfCookie } from "@/lib/csrf";

function br(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });
}

function parse(raw: string | null) {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return { executiveSummary: raw, diagnosis: raw, risks: [], recommendations: [] }; }
}

export default async function HistoricalDiagnosisPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const csrf = await ensureCsrfCookie();
  const project = await getProjectByCode(id);
  if (!project) return <AppShell user={user} title="Diagnóstico Histórico"><div className="alert bad-bg">Projeto não encontrado.</div></AppShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <AppShell user={user} title="Diagnóstico Histórico"><div className="alert bad-bg">Sem permissão.</div></AppShell>;
  const [aggregate, latestDiagnosis, validations] = await Promise.all([
    getHistoricalUploadAggregate(project.id),
    getLatestHistoricalDiagnosis(project.id),
    listHistoricalDiagnosisValidations(project.id, 20),
  ]);
  const parsed = parse(latestDiagnosis?.response || null);

  return (
    <AppShell user={user} title="Diagnóstico Histórico" subtitle="Leitura executiva da base histórica em produto separado">
      <ProductHero eyebrow="motor de diagnóstico" title="Transforme base histórica em leitura executiva acionável" description="Este produto concentra upload, consolidação, geração e validação do diagnóstico histórico.">
        <StatusPill label={`Uploads: ${aggregate.totalUploads}`} tone={aggregate.totalUploads ? "good" : "warn"} />
        <StatusPill label={`Validações: ${validations.length}`} tone={validations.length ? "good" : "neutral"} />
        <PrintButton />
      </ProductHero>

      {query.saved ? <div className="alert ok-bg mb-4">Ação concluída: {query.saved}</div> : null}
      {query.error ? <div className="alert bad-bg mb-4">Erro: {query.error}</div> : null}

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr] mb-4">
        <section className="card">
          <div className="section-head"><h2 className="title">Comando executivo</h2><span className="kpi-chip">ação principal</span></div>
          <div className="mt-3 text-sm text-slate-300">{parsed?.executiveSummary || "Sem diagnóstico gerado ainda."}</div>
          <form action={`/api/projects/${id}/historical-diagnosis/run`} method="post" className="mt-4">
            <button type="submit" className="badge py-2 px-3 cursor-pointer">Gerar / atualizar diagnóstico</button>
          </form>
        </section>
        <section className="card">
          <div className="section-head"><h2 className="title">Base consolidada</h2><span className="kpi-chip">totais</span></div>
          <div className="grid grid-cols-2 gap-2 text-sm mt-3">
            <div className="metric"><div className="text-xs text-slate-400">Faturamento</div><div className="mt-1 font-semibold">{br(aggregate.totals.faturamento)}</div></div>
            <div className="metric"><div className="text-xs text-slate-400">Contas a receber</div><div className="mt-1 font-semibold">{br(aggregate.totals.contasReceber)}</div></div>
            <div className="metric"><div className="text-xs text-slate-400">Contas a pagar</div><div className="mt-1 font-semibold">{br(aggregate.totals.contasPagar)}</div></div>
            <div className="metric"><div className="text-xs text-slate-400">Extrato</div><div className="mt-1 font-semibold">{br(aggregate.totals.extratoBancario)}</div></div>
          </div>
        </section>
      </section>

      <section className="grid md:grid-cols-2 gap-4 mb-4">
        <section className="card">
          <div className="section-head"><h2 className="title">Riscos</h2><span className="kpi-chip">IA / fallback</span></div>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {(parsed?.risks || []).length ? parsed.risks.map((item: string) => <li key={item}>• {item}</li>) : <li>• Sem riscos estruturados ainda.</li>}
          </ul>
        </section>
        <section className="card">
          <div className="section-head"><h2 className="title">Recomendações</h2><span className="kpi-chip">próximos passos</span></div>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {(parsed?.recommendations || []).length ? parsed.recommendations.map((item: string) => <li key={item}>• {item}</li>) : <li>• Gere o diagnóstico para receber recomendações.</li>}
          </ul>
        </section>
      </section>

      <section className="grid md:grid-cols-2 gap-4 mb-4">
        <section className="card">
          <div className="section-head"><h2 className="title">Validação executiva</h2><span className="kpi-chip">decisão</span></div>
          {latestDiagnosis ? (
            <form action={`/api/projects/${id}/historical-diagnosis/validate`} method="post" className="grid gap-2 mt-3 text-sm">
              <input type="hidden" name="csrf_token" value={csrf} />
              <input type="hidden" name="inference_run_id" value={String(latestDiagnosis.id)} />
              <select name="decision" className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2">
                <option value="aprovado">Aprovado</option>
                <option value="ajustar">Ajustar</option>
                <option value="bloquear">Bloquear</option>
              </select>
              <textarea name="note" placeholder="nota da validação" className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2 min-h-28" />
              <button type="submit" className="badge py-2 px-3 cursor-pointer">Registrar validação</button>
            </form>
          ) : <EmptyState title="Nada para validar" description="Gere o diagnóstico histórico primeiro." />}
        </section>
        <section className="card">
          <div className="section-head"><h2 className="title">Histórico de validações</h2><span className="kpi-chip">trilha</span></div>
          <div className="mt-3 space-y-2 text-sm">
            {validations.length ? validations.map((v) => <div key={v.id} className="rounded-2xl border border-slate-800 p-4"><div className="font-medium text-white">{v.decision}</div><div className="text-xs text-slate-500 mt-1">{v.validated_at}</div><div className="text-slate-300 mt-2 whitespace-pre-wrap">{v.summary_text || v.note || '-'}</div></div>) : <EmptyState title="Nenhuma validação ainda" description="A decisão executiva aparecerá aqui." />}
          </div>
        </section>
      </section>
    </AppShell>
  );
}
