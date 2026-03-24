type VersionRow = {
  id: string;
  version_no: number;
  generated_at: string;
  final_diagnosis?: Record<string, unknown>;
};

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

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Comparação rápida</div>
      <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
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
          <div className="font-medium text-white">Gerado em</div>
          <div className="mt-2">v{current.version_no}: {current.generated_at}</div>
          <div className="mt-1">v{previous.version_no}: {previous.generated_at}</div>
        </div>
      </div>
    </div>
  );
}
