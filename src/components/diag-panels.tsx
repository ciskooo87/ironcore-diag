import type { ReactNode } from "react";

export function ExecutiveNarrative({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] md:p-6">
      <div className="text-[11px] uppercase tracking-[0.24em] text-[#0F172A]">Resumo executivo</div>
      <h2 className="mt-2 text-xl font-semibold text-[#101828]">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-[#475467] md:text-base">{children}</div>
    </section>
  );
}

export function ScoreCard({ title, value, tone, hint }: { title: string; value: number; tone: "ok" | "warn" | "bad"; hint?: string }) {
  const klass = tone === "ok" ? "border-emerald-400/30 bg-emerald-400/10 text-[#027A48]" : tone === "warn" ? "border-amber-400/30 bg-amber-400/10 text-[#B54708]" : "border-rose-400/30 bg-rose-400/10 text-[#B42318]";
  return (
    <div className={`rounded-2xl border p-4 ${klass}`}>
      <div className="text-xs uppercase tracking-[0.18em]">{title}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
      {hint ? <div className="mt-2 text-xs opacity-90">{hint}</div> : null}
    </div>
  );
}

export function AttentionList({ items }: { items: Array<{ level: string; title: string; impact: string; origin: string; recommendation: string }> }) {
  return (
    <section className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-[#0F172A]">Pontos de atenção</div>
          <h2 className="mt-2 text-xl font-semibold text-[#101828]">Principais alertas priorizados</h2>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={`${item.level}-${item.title}`} className="min-w-0 rounded-2xl border border-black/5 bg-[#F8FAFC] p-4 md:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${item.level === "Crítico" ? "bg-rose-500/15 text-[#B42318]" : item.level === "Atenção" ? "bg-amber-500/15 text-[#B54708]" : "bg-yellow-500/15 text-[#9A6700]"}`}>{item.level}</span>
              <div className="break-words font-medium leading-6 text-[#101828]">{item.title}</div>
            </div>
            <div className="mt-3 grid gap-2 text-sm leading-6 text-[#475467] xl:grid-cols-3">
              <div><span className="text-[#98A2B3]">Impacto:</span> {item.impact}</div>
              <div><span className="text-[#98A2B3]">Origem:</span> {item.origin}</div>
              <div><span className="text-[#98A2B3]">Recomendação:</span> {item.recommendation}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TimelineCard({ current }: { current: string }) {
  const stages = ["Input", "Estruturação", "Análise IA", "Validação", "Narrativa", "Output"];
  const activeIndex = Math.max(0, stages.indexOf(current));
  return (
    <section className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] md:p-6">
      <div className="text-[11px] uppercase tracking-[0.24em] text-[#0F172A]">Linha do tempo</div>
      <h2 className="mt-2 text-xl font-semibold text-[#101828]">Onde o projeto está agora</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-6">
        {stages.map((stage, index) => (
          <div key={stage} className={`rounded-2xl border px-4 py-4 text-center text-sm ${index < activeIndex ? "border-emerald-400/30 bg-emerald-400/10 text-[#027A48]" : index === activeIndex ? "border-[rgba(200,255,0,0.25)] bg-[rgba(200,255,0,0.08)] text-[#0F172A]" : "border-black/5 bg-[#F8FAFC] text-[#98A2B3]"}`}>
            {stage}
          </div>
        ))}
      </div>
    </section>
  );
}

export function RightRail({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] md:p-6">
      <div className="text-[11px] uppercase tracking-[0.24em] text-[#0F172A]">Painel lateral</div>
      <h2 className="mt-2 text-xl font-semibold text-[#101828]">{title}</h2>
      <div className="mt-4 space-y-4 text-sm text-[#475467]">{children}</div>
    </aside>
  );
}
