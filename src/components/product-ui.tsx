import type { ReactNode } from "react";

export function ProductHero({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return (
    <section className="product-hero mb-4 rounded-[28px] border border-cyan-400/15 bg-[linear-gradient(135deg,rgba(14,116,144,0.22),rgba(15,23,42,0.92))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="product-eyebrow inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-cyan-200">{eyebrow}</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#101828]">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-[#475467] sm:text-base">{description}</p>
        </div>
        {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
      </div>
    </section>
  );
}

export function StatusPill({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "good" | "warn" | "bad" | "info" }) {
  const toneClass = tone === "good" ? "border-emerald-400/30 bg-emerald-400/10 text-[#027A48]"
    : tone === "warn" ? "border-amber-400/30 bg-amber-400/10 text-[#B54708]"
    : tone === "bad" ? "border-rose-400/30 bg-rose-400/10 text-[#B42318]"
    : tone === "info" ? "border-black/10 bg-white text-[#0F172A]"
    : "border-slate-600 bg-slate-800/40 text-slate-200";
  return <span className={`rounded-full border px-3 py-1 text-xs font-medium ${toneClass}`}>{label}</span>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[22px] border border-black/5 bg-[#F8FAFC] px-4 py-5 text-sm text-[#475467]">
      <div className="font-medium text-[#101828]">{title}</div>
      <div className="mt-1 text-[#667085]">{description}</div>
    </div>
  );
}
