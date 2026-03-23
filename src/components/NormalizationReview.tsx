type NormalizationPayload = {
  uploads?: { total?: number; latestBusinessDate?: string; coverageKinds?: string[]; missingKinds?: string[] };
  financials?: { faturamento?: number; contasReceber?: number; contasPagar?: number; endividamentoBancos?: number; endividamentoFidc?: number; pressure?: number };
  debt?: { totalRows?: number; hasAnalyticalDebt?: boolean };
  checkpoints?: { hasContext?: boolean; readyForAi?: boolean };
};

function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function NormalizationReview({ payload }: { payload?: NormalizationPayload }) {
  const financials = payload?.financials || {};
  const uploads = payload?.uploads || {};
  const debt = payload?.debt || {};
  const checkpoints = payload?.checkpoints || {};

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">Uploads</div><div className="mt-2 text-xl font-semibold text-white">{uploads.total || 0}</div><div className="mt-2 text-xs text-slate-400">Última base: {uploads.latestBusinessDate || "-"}</div></div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">Faturamento</div><div className="mt-2 text-xl font-semibold text-white">{money(Number(financials.faturamento || 0))}</div></div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">Pressão CAP x CAR</div><div className="mt-2 text-xl font-semibold text-white">{money(Number(financials.pressure || 0))}</div></div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">Dívida Bancos</div><div className="mt-2 text-xl font-semibold text-white">{money(Number(financials.endividamentoBancos || 0))}</div></div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">Dívida FIDC</div><div className="mt-2 text-xl font-semibold text-white">{money(Number(financials.endividamentoFidc || 0))}</div></div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">Dívida analítica</div><div className="mt-2 text-xl font-semibold text-white">{debt.totalRows || 0} linhas</div><div className="mt-2 text-xs text-slate-400">{debt.hasAnalyticalDebt ? "Detalhamento disponível" : "Sem detalhamento analítico"}</div></div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Cobertura das bases</div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {(uploads.coverageKinds || []).map((item) => <span key={item} className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-emerald-100">{item}</span>)}
            {!(uploads.coverageKinds || []).length ? <span className="text-slate-500">Sem cobertura consolidada.</span> : null}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Checkpoints</div>
          <div className="mt-3 space-y-2 text-sm text-slate-300">
            <div>Contexto registrado: {checkpoints.hasContext ? "sim" : "não"}</div>
            <div>Pronto para IA: {checkpoints.readyForAi ? "sim" : "não"}</div>
            <div>Bases faltantes: {(uploads.missingKinds || []).length ? uploads.missingKinds?.join(", ") : "nenhuma"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
