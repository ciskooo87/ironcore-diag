type VersionRow = {
  id: string;
  version_no: number;
  generated_at: string;
  final_diagnosis?: Record<string, unknown>;
};

function getExecutiveReport(row?: VersionRow) {
  return ((row?.final_diagnosis as any)?.executiveReport || {}) as Record<string, any>;
}

function getRootCauseCount(row?: VersionRow) {
  const causes = getExecutiveReport(row).rootCauses;
  return Array.isArray(causes) ? causes.length : 0;
}

function getRiskCount(row?: VersionRow) {
  const risks = getExecutiveReport(row).priorityRisks;
  return Array.isArray(risks) ? risks.length : 0;
}

function getDebtRows(row?: VersionRow) {
  const debt = getExecutiveReport(row).debtTable;
  return Array.isArray(debt) ? debt.length : 0;
}

function getNarrativeSnippet(key: string, row?: VersionRow) {
  const text = String(getExecutiveReport(row)[key] || "").trim();
  return text ? `${text.slice(0, 180)}${text.length > 180 ? "…" : ""}` : "-";
}

export function DeliveryVersionDiff({ versions }: { versions: VersionRow[] }) {
  const current = versions[0];
  const previous = versions[1];

  if (!current) {
    return <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4 text-sm text-slate-400">Nenhuma versão consolidada ainda.</div>;
  }

  if (!previous) {
    return <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4 text-sm text-slate-300">Apenas uma versão disponível até agora. Gere outra consolidação para comparar evolução.</div>;
  }

  const currentScore = Number((current.final_diagnosis as any)?.score || 0);
  const previousScore = Number((previous.final_diagnosis as any)?.score || 0);
  const currentActions = Array.isArray((current.final_diagnosis as any)?.actions5w2h) ? (current.final_diagnosis as any).actions5w2h.length : 0;
  const previousActions = Array.isArray((previous.final_diagnosis as any)?.actions5w2h) ? (previous.final_diagnosis as any).actions5w2h.length : 0;
  const scoreDelta = currentScore - previousScore;
  const actionDelta = currentActions - previousActions;
  const causeDelta = getRootCauseCount(current) - getRootCauseCount(previous);
  const riskDelta = getRiskCount(current) - getRiskCount(previous);
  const debtDelta = getDebtRows(current) - getDebtRows(previous);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Comparação entre versões</div>
      <div className="mt-3 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-slate-800 px-3 py-3 text-slate-300">
          <div className="font-medium text-white">Versão atual vs anterior</div>
          <div className="mt-2">Atual: v{current.version_no} · Anterior: v{previous.version_no}</div>
        </div>
        <div className="rounded-xl border border-slate-800 px-3 py-3 text-slate-300">
          <div className="font-medium text-white">Delta de score</div>
          <div className={`mt-2 font-semibold ${scoreDelta >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{scoreDelta >= 0 ? '+' : ''}{scoreDelta}</div>
        </div>
        <div className="rounded-xl border border-slate-800 px-3 py-3 text-slate-300">
          <div className="font-medium text-white">Plano 5W2H</div>
          <div className={`mt-2 font-semibold ${actionDelta >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{actionDelta >= 0 ? '+' : ''}{actionDelta} ação(ões)</div>
        </div>
        <div className="rounded-xl border border-slate-800 px-3 py-3 text-slate-300">
          <div className="font-medium text-white">Causas raiz</div>
          <div className={`mt-2 font-semibold ${causeDelta >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{causeDelta >= 0 ? '+' : ''}{causeDelta} item(ns)</div>
        </div>
        <div className="rounded-xl border border-slate-800 px-3 py-3 text-slate-300">
          <div className="font-medium text-white">Riscos prioritários</div>
          <div className={`mt-2 font-semibold ${riskDelta >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{riskDelta >= 0 ? '+' : ''}{riskDelta} item(ns)</div>
        </div>
        <div className="rounded-xl border border-slate-800 px-3 py-3 text-slate-300">
          <div className="font-medium text-white">Linhas de dívida</div>
          <div className={`mt-2 font-semibold ${debtDelta >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{debtDelta >= 0 ? '+' : ''}{debtDelta} linha(s)</div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-800 px-3 py-3 text-sm text-slate-300">
          <div className="font-medium text-white">Resumo executivo</div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Atual</div>
              <div className="mt-1">{getNarrativeSnippet('executiveSummary', current)}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Anterior</div>
              <div className="mt-1">{getNarrativeSnippet('executiveSummary', previous)}</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 px-3 py-3 text-sm text-slate-300">
          <div className="font-medium text-white">Conclusão</div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Atual</div>
              <div className="mt-1">{getNarrativeSnippet('conclusion', current)}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Anterior</div>
              <div className="mt-1">{getNarrativeSnippet('conclusion', previous)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
