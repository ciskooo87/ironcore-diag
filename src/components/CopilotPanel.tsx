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
      <div className="min-w-0 rounded-2xl border border-black/5 bg-[#F8FAFC] p-4 md:p-5">
        <div className="text-xs uppercase tracking-[0.18em] text-[#98A2B3]">Copiloto de diagnóstico</div>
        <div className="mt-2 text-sm leading-6 text-[#667085]">Use este painel para tensionar a leitura: causa raiz, risco, caixa, dívida e direção recomendada.</div>
        <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Pergunte algo sobre causa raiz, cenário, risco, dívida ou recomendação..." className="mt-3 min-h-28 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm leading-6 text-[#101828] placeholder:text-[#98A2B3]" />
        <button type="button" onClick={() => ask()} disabled={loading} className="mt-3 rounded-2xl bg-[#0F172A] px-4 py-3 text-sm font-medium text-white hover:bg-[#111827] disabled:opacity-60">{loading ? "Analisando..." : "Perguntar à IA"}</button>
      </div>
      <div className="grid gap-2 text-sm">
        {[
          "Explique melhor a causa raiz do caso",
          "Qual risco merece prioridade imediata?",
          "Qual evidência sustenta o alerta mais crítico?",
        ].map((item) => (
          <button key={item} type="button" onClick={() => ask(item)} className="rounded-xl border border-black/5 bg-[#F8FAFC] px-3 py-3 text-left leading-6 text-[#475467] transition hover:border-black/10 hover:bg-white hover:text-[#101828]">{item}</button>
        ))}
      </div>
      <div className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-4 text-sm leading-6 whitespace-pre-wrap text-[#344054]">
        {answer || "A resposta do copiloto aparece aqui."}
      </div>
    </div>
  );
}
