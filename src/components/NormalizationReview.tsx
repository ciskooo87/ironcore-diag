type NormalizationPayload = {
  uploads?: { total?: number; latestBusinessDate?: string; coverageKinds?: string[]; missingKinds?: string[] };
  financials?: { faturamento?: number; contasReceber?: number; contasPagar?: number; endividamentoBancos?: number; endividamentoFidc?: number; pressure?: number };
  debt?: { totalRows?: number; hasAnalyticalDebt?: boolean };
  checkpoints?: { hasContext?: boolean; readyForAi?: boolean };
  stale?: boolean;
};

function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function MetricCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-800 bg-slate-950/30 p-4 md:p-5">
      <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{title}</div>
      <div className="mt-3 break-words text-2xl font-semibold leading-tight text-white md:text-3xl">{value}</div>
      {hint ? <div className="mt-3 text-xs leading-5 text-slate-400">{hint}</div> : null}
    </div>
  );
}

export function NormalizationReview({ payload }: { payload?: NormalizationPayload }) {
  const financials = payload?.financials || {};
  const uploads = payload?.uploads || {};
  const debt = payload?.debt || {};
  const checkpoints = payload?.checkpoints || {};

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        <MetricCard title="Uploads" value={String(uploads.total || 0)} hint={`Última base: ${uploads.latestBusinessDate || "-"}`} />
        <MetricCard title="Faturamento" value={money(Number(financials.faturamento || 0))} />
        <MetricCard title="Pressão CAP x CAR" value={money(Number(financials.pressure || 0))} hint="Diferença consolidada entre contas a pagar e contas a receber." />
        <MetricCard title="Dívida Bancos" value={money(Number(financials.endividamentoBancos || 0))} />
        <MetricCard title="Dívida FIDC" value={money(Number(financials.endividamentoFidc || 0))} />
        <MetricCard title="Dívida analítica" value={`${debt.totalRows || 0} linhas`} hint={debt.hasAnalyticalDebt ? "Detalhamento disponível" : "Sem detalhamento analítico"} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4 md:p-5">
          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Cobertura das bases</div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs leading-5">
            {(uploads.coverageKinds || []).map((item) => <span key={item} className="max-w-full break-all rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-emerald-100">{item}</span>)}
            {!(uploads.coverageKinds || []).length ? <span className="text-slate-500">Sem cobertura consolidada.</span> : null}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4 md:p-5">
          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Checkpoints</div>
          <div className="mt-3 space-y-3 text-sm text-slate-300">
            <div><span className="text-slate-500">Contexto registrado:</span> {checkpoints.hasContext ? "sim" : "não"}</div>
            <div><span className="text-slate-500">Pronto para IA:</span> {checkpoints.readyForAi ? "sim" : "não"}</div>
            <div><span className="text-slate-500">Bases faltantes:</span> {(uploads.missingKinds || []).length ? uploads.missingKinds?.join(", ") : "nenhuma"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
