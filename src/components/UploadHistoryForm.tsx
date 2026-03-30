"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";

const KIND_GUIDANCE: Record<string, string[]> = {
  historico_faturamento: ["Esperado: coluna de faturamento/receita/vendas.", "A base deve trazer valor financeiro reconhecível."],
  historico_contas_receber: ["Esperado: contas a receber/recebíveis.", "Idealmente com saldo consolidado ou carteira."],
  historico_contas_pagar: ["Esperado: contas a pagar/fornecedores.", "Idealmente com saldo ou total por obrigação."],
  historico_endividamento_bancos: ["Ideal: tipo/projeto/modalidade/vencido/a_vencer/total.", "Evite misturar linhas FIDC nesta base."],
  historico_endividamento_fidc: ["Ideal: tipo/projeto/modalidade/vencido/a_vencer/total.", "Evite misturar linhas bancárias nesta base."],
};

type PreviewResponse = {
  ok: boolean;
  parsed: {
    quality: string;
    matchedFields: string[];
    warnings: string[];
    errors: string[];
    totals: Record<string, number>;
  };
};

export function UploadHistoryForm({ action, kind, label, defaultDate, templateHref }: { action: string; kind: string; label: string; defaultDate: string; templateHref: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const guidance = useMemo(() => KIND_GUIDANCE[kind] || [], [kind]);

  async function runPreview() {
    const form = formRef.current;
    if (!form) return;
    setPreviewing(true);
    setError(null);
    try {
      const formData = new FormData(form);
      const res = await fetch(`${action.replace(/\/$/, "")}/preview/`, {
        method: "POST",
        body: formData,
        credentials: "same-origin",
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "preview_failed");
      setPreview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "preview_failed");
    } finally {
      setPreviewing(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = formRef.current;
    if (!form) return;

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(form);
      const res = await fetch(action, {
        method: "POST",
        body: formData,
        credentials: "same-origin",
        cache: "no-store",
        redirect: "follow",
      });

      if (res.redirected && res.url) {
        window.location.assign(res.url);
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "upload_failed");
      }

      window.location.assign(window.location.pathname + "?saved=1");
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "upload_failed");
    }
  }

  return (
    <form
      ref={formRef}
      encType="multipart/form-data"
      className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4 text-sm"
      onSubmit={handleSubmit}
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
      <div className="mt-3">
        <Link href={templateHref} className="inline-flex rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-100 hover:bg-emerald-400/15">
          Baixar template oficial
        </Link>
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
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        <button type="button" onClick={runPreview} disabled={previewing || submitting} className="rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-slate-100 hover:border-slate-600 disabled:opacity-60">{previewing ? "Lendo base..." : "Pré-visualizar leitura"}</button>
        <button type="button" onClick={() => formRef.current?.requestSubmit()} disabled={submitting} className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-400/15 disabled:opacity-60">{submitting ? "Enviando base..." : `Enviar ${label}`}</button>
      </div>
      {preview ? (
        <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-xs text-slate-300">
          <div className="font-medium text-white">Preview do parser</div>
          <div className="mt-2">Qualidade: {preview.parsed.quality}</div>
          <div className="mt-1">Campos reconhecidos: {preview.parsed.matchedFields.join(", ") || "nenhum"}</div>
          <div className="mt-1">Totais lidos: faturamento={preview.parsed.totals.faturamento || 0} · CAR={preview.parsed.totals.contas_receber || 0} · CAP={preview.parsed.totals.contas_pagar || 0} · dívida={preview.parsed.totals.debt_rows || 0} linha(s)</div>
          {preview.parsed.warnings.length ? <div className="mt-2 text-amber-300">⚠ {preview.parsed.warnings.join(" | ")}</div> : null}
          {preview.parsed.errors.length ? <div className="mt-2 text-rose-300">✖ {preview.parsed.errors.join(" | ")}</div> : null}
        </div>
      ) : null}
      {error ? <div className="mt-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">Erro: {error}</div> : null}
    </form>
  );
}
