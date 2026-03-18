"use client";

import { useState } from "react";

export function UploadHistoryForm({ action, kind, label, defaultDate }: { action: string; kind: string; label: string; defaultDate: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={action}
      method="post"
      encType="multipart/form-data"
      className="card !p-3 text-sm"
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
      <div className="font-medium mb-2">{label}</div>
      <input type="hidden" name="upload_kind" value={kind} />
      <input name="business_date" type="date" defaultValue={defaultDate} required className="mb-2 bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" />
      <input name="file" type="file" accept=".csv,.xlsx,.xls,.xlsm,.pdf" required className="mb-2 bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" />
      <input name="notes" placeholder="observações" className="mb-2 bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" />
      <button type="submit" disabled={submitting} className="badge py-2 px-3 cursor-pointer disabled:opacity-60">{submitting ? "Enviando..." : `Enviar ${label}`}</button>
      {error ? <div className="alert bad-bg mt-2">Erro: {error}</div> : null}
    </form>
  );
}
