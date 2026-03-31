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
    <div className="min-w-0 rounded-2xl border border-white/8 bg-black/20 p-4 md:p-5">
      <div className="text-[11px] uppercase tracking-[0.2em] text-[#6B6B6B]">{title}</div>
      <div className="mt-3 break-words text-2xl font-semibold leading-tight text-[#FAFAF7] md:text-3xl">{value}</div>
      {hint ? <div className="mt-3 text-xs leading-5 text-[rgba(250,250,247,0.55)]">{hint}</div> : null}
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
      {payload?.stale ? <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">A tela está mostrando o consolidado atual dos uploads porque a normatização salva estava vazia ou desatualizada. Regerar a normatização sincroniza esse payload.</div> : null}

      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        <MetricCard title="Uploads" value={String(uploads.total || 0)} hint={`Última base: ${uploads.latestBusinessDate || "-"}`} />
        <MetricCard title="Faturamento" value={money(Number(financials.faturamento || 0))} />
        <MetricCard title="Pressão CAP x CAR" value={money(Number(financials.pressure || 0))} hint="Diferença consolidada entre contas a pagar e contas a receber." />
        <MetricCard title="Dívida Bancos" value={money(Number(financials.endividamentoBancos || 0))} />
        <MetricCard title="Dívida FIDC" value={money(Number(financials.endividamentoFidc || 0))} />
        <MetricCard title="Dívida analítica" value={`${debt.totalRows || 0} linhas`} hint={debt.hasAnalyticalDebt ? "Detalhamento disponível" : "Sem detalhamento analítico"} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
        <div className="rounded-2xl border border-white/8 bg-black/20 p-4 md:p-5">
          <div className="text-[11px] uppercase tracking-[0.2em] text-[#6B6B6B]">Cobertura das bases</div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs leading-5">
            {(uploads.coverageKinds || []).map((item) => <span key={item} className="max-w-full break-all rounded-full border border-[rgba(200,255,0,0.25)] bg-[rgba(200,255,0,0.08)] px-3 py-1 text-[#C8FF00]">{item}</span>)}
            {!(uploads.coverageKinds || []).length ? <span className="text-[#6B6B6B]">Sem cobertura consolidada.</span> : null}
          </div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-black/20 p-4 md:p-5">
          <div className="text-[11px] uppercase tracking-[0.2em] text-[#6B6B6B]">Checkpoints</div>
          <div className="mt-3 space-y-3 text-sm text-[rgba(250,250,247,0.72)]">
            <div><span className="text-[#6B6B6B]">Contexto registrado:</span> {checkpoints.hasContext ? "sim" : "não"}</div>
            <div><span className="text-[#6B6B6B]">Pronto para IA:</span> {checkpoints.readyForAi ? "sim" : "não"}</div>
            <div><span className="text-[#6B6B6B]">Bases faltantes:</span> {(uploads.missingKinds || []).length ? uploads.missingKinds?.join(", ") : "nenhuma"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
