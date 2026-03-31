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
      <div className="min-w-0 rounded-2xl border border-white/8 bg-black/20 p-4 md:p-5">
        <div className="text-xs uppercase tracking-[0.18em] text-[#6B6B6B]">Copiloto de diagnóstico</div>
        <div className="mt-2 text-sm leading-6 text-[rgba(250,250,247,0.58)]">Use este painel para tensionar a leitura: causa raiz, risco, caixa, dívida e direção recomendada.</div>
        <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Pergunte algo sobre causa raiz, cenário, risco, dívida ou recomendação..." className="mt-3 min-h-28 w-full rounded-lg border border-white/8 bg-black/20 px-3 py-2 text-sm leading-6 text-[#FAFAF7]" />
        <button type="button" onClick={() => ask()} disabled={loading} className="mt-3 rounded-2xl bg-[#C8FF00] px-4 py-3 text-sm font-medium text-[#0A0A0A] hover:bg-[#d6ff4d] disabled:opacity-60">{loading ? "Analisando..." : "Perguntar à IA"}</button>
      </div>
      <div className="grid gap-2 text-sm">
        {[
          "Explique melhor a causa raiz do caso",
          "Qual risco merece prioridade imediata?",
          "Qual evidência sustenta o alerta mais crítico?",
        ].map((item) => (
          <button key={item} type="button" onClick={() => ask(item)} className="rounded-xl border border-white/8 bg-black/20 px-3 py-3 text-left leading-6 text-[rgba(250,250,247,0.72)] hover:border-white/15 hover:text-white">{item}</button>
        ))}
      </div>
      <div className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-6 whitespace-pre-wrap text-[rgba(250,250,247,0.78)]">
        {answer || "A resposta do copiloto aparece aqui."}
      </div>
    </div>
  );
}
