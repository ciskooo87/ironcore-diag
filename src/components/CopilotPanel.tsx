"use client";

import { useState } from "react";

export function CopilotPanel({ endpoint }: { endpoint: string }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask(prefill?: string) {
    const q = (prefill ?? question).trim();
    if (!q) return;
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setAnswer(data.answer || "Sem resposta.");
      setQuestion(q);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="min-w-0 rounded-2xl border border-slate-800 bg-slate-950/30 p-4 md:p-5">
        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Copiloto de diagnóstico</div>
        <div className="mt-2 text-sm leading-6 text-slate-400">Use este painel para tensionar a leitura: causa raiz, risco, caixa, dívida e direção recomendada.</div>
        <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Pergunte algo sobre causa raiz, cenário, risco, dívida ou recomendação..." className="mt-3 min-h-28 w-full rounded-lg border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm leading-6 text-slate-200" />
        <button type="button" onClick={() => ask()} disabled={loading} className="mt-3 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-400/15 disabled:opacity-60">{loading ? "Analisando..." : "Perguntar à IA"}</button>
      </div>
      <div className="grid gap-2 text-sm">
        {[
          "Explique melhor a causa raiz do caso",
          "Qual risco merece prioridade imediata?",
          "Qual evidência sustenta o alerta mais crítico?",
        ].map((item) => (
          <button key={item} type="button" onClick={() => ask(item)} className="rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-3 text-left leading-6 text-slate-300 hover:border-slate-700">{item}</button>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4 text-sm leading-6 whitespace-pre-wrap text-slate-300">
        {answer || "A resposta do copiloto aparece aqui."}
      </div>
    </div>
  );
}
