export function ValidationMatrix({ hasInference, validations }: { hasInference: boolean; validations: Array<{ decision: string; validated_at: string; summary_text: string | null; note: string | null }> }) {
  const latest = validations[0];
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Matriz de validação</div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="text-slate-400">
              <th className="border-b border-slate-800 px-3 py-2 text-left">Item</th>
              <th className="border-b border-slate-800 px-3 py-2 text-left">IA sugeriu</th>
              <th className="border-b border-slate-800 px-3 py-2 text-left">Humano decidiu</th>
              <th className="border-b border-slate-800 px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-b border-slate-900 px-3 py-3 text-white">Diagnóstico executivo final</td>
              <td className="border-b border-slate-900 px-3 py-3 text-slate-300">{hasInference ? "Gerado" : "Pendente"}</td>
              <td className="border-b border-slate-900 px-3 py-3 text-slate-300">{latest?.decision || "Pendente"}</td>
              <td className="border-b border-slate-900 px-3 py-3 text-slate-300">{latest ? "Auditado" : hasInference ? "Aguardando validação humana" : "Aguardando IA"}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {latest?.summary_text || latest?.note ? <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-3 text-sm text-slate-300">{latest.summary_text || latest.note}</div> : null}
    </div>
  );
}
