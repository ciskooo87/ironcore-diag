"use client";

import { useMemo, useState } from "react";

const KIND_GUIDANCE: Record<string, string[]> = {
  historico_faturamento: ["Esperado: coluna de faturamento/receita/vendas.", "A base deve trazer valor financeiro reconhecível."],
  historico_contas_receber: ["Esperado: contas a receber/recebíveis.", "Idealmente com saldo consolidado ou carteira."],
  historico_contas_pagar: ["Esperado: contas a pagar/fornecedores.", "Idealmente com saldo ou total por obrigação."],
  historico_endividamento_bancos: ["Ideal: tipo/projeto/modalidade/vencido/a_vencer/total.", "Evite misturar linhas FIDC nesta base."],
  historico_endividamento_fidc: ["Ideal: tipo/projeto/modalidade/vencido/a_vencer/total.", "Evite misturar linhas bancárias nesta base."],
};

export function UploadHistoryForm({ action, kind, label, defaultDate }: { action: string; kind: string; label: string; defaultDate: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const guidance = useMemo(() => KIND_GUIDANCE[kind] || [], [kind]);

  return (
    <form
      action={action}
      method="post"
      encType="multipart/form-data"
      className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4 text-sm"
      onSubmit={async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        const form = e.currentTarget;
        try {
          const res = await fetch(form.action, {
            method: "POST",
            body: new FormData(form),
            credentials: "same-origin",
            redirect: "follow",
            cache: "no-store",
            headers: { "x-diag-client": "upload-form" },
          });
          if (!res.ok) throw new Error(`upload_failed_${res.status}`);
          window.location.href = res.url;
        } catch (err) {
          setError(err instanceof Error ? err.message : "upload_failed");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Base histórica</div>
          <div className="mt-1 font-medium text-white">{label}</div>
        </div>
        <div className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">{label}</div>
      </div>
      <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-3 text-xs text-slate-400">
        {guidance.map((item) => <div key={item}>• {item}</div>)}
      </div>
      <div className="mt-4 grid gap-2">
        <label className="grid gap-1">
          <span className="text-xs text-slate-400">Data de referência</span>
          <input name="business_date" type="date" defaultValue={defaultDate} required className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2 text-slate-200" />
        </label>
        <label className="grid gap-1">
          <span className="text-xs text-slate-400">Arquivo</span>
          <input name="file" type="file" accept=".csv,.xlsx,.xls,.xlsm,.pdf" required className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2 text-slate-300" />
        </label>
        <label className="grid gap-1">
          <span className="text-xs text-slate-400">Observações</span>
          <input name="notes" placeholder="Ex.: base fechada pelo financeiro, versão revisada" className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2 text-slate-200" />
        </label>
      </div>
      <input type="hidden" name="upload_kind" value={kind} />
      <button type="submit" disabled={submitting} className="mt-4 w-full rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-400/15 disabled:opacity-60">{submitting ? "Enviando base..." : `Enviar ${label}`}</button>
      {error ? <div className="mt-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">Erro: {error}</div> : null}
    </form>
  );
}
