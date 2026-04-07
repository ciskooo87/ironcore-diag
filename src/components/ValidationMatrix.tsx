export function ValidationMatrix({ hasInference, validations }: { hasInference: boolean; validations: Array<{ decision: string; validated_at: string; summary_text: string | null; note: string | null }> }) {
  const latest = validations[0];
  const decisionLabel = latest?.decision === "aprovado" ? "Aprovado" : latest?.decision === "ajustar" ? "Ajustar" : latest?.decision === "bloquear" ? "Bloqueado" : "Pendente";

  return (
    <div className="min-w-0 rounded-2xl border border-black/5 bg-[#F8FAFC] p-4 md:p-5">
      <div className="text-xs uppercase tracking-[0.18em] text-[#98A2B3]">Matriz de validação</div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="text-[#667085]">
              <th className="border-b border-black/10 px-3 py-2 text-left">Item</th>
              <th className="border-b border-black/10 px-3 py-2 text-left">IA sugeriu</th>
              <th className="border-b border-black/10 px-3 py-2 text-left">Humano decidiu</th>
              <th className="border-b border-black/10 px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-b border-black/5 px-3 py-3 text-[#101828]">Diagnóstico executivo final</td>
              <td className="border-b border-black/5 px-3 py-3 text-[#475467]">{hasInference ? "Leitura consolidada" : "Pendente"}</td>
              <td className="border-b border-black/5 px-3 py-3 text-[#475467]">{decisionLabel}</td>
              <td className="border-b border-black/5 px-3 py-3 text-[#475467]">{latest ? `Auditado em ${latest.validated_at}` : hasInference ? "Aguardando validação humana" : "Aguardando IA"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {latest?.summary_text || latest?.note ? (
        <div className="mt-3 rounded-xl border border-black/5 bg-white px-3 py-3 text-sm text-[#475467]">
          <div className="font-medium text-[#101828]">Resumo da decisão</div>
          <div className="mt-2">{latest.summary_text || latest.note}</div>
        </div>
      ) : null}
    </div>
  );
}
