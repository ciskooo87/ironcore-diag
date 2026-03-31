import Link from "next/link";

type WorkflowItem = {
  key: string;
  label: string;
  done: boolean;
  detail?: string;
};

export function WorkflowChecklist({ items, compact = false }: { items: WorkflowItem[]; compact?: boolean; }) {
  return (
    <div className={`grid gap-3 ${compact ? "" : "md:grid-cols-2"}`}>
      {items.map((item) => (
        <div key={item.key} className={`rounded-2xl border p-4 ${item.done ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100" : "border-white/8 bg-black/20 text-[rgba(250,250,247,0.75)]"}`}>
          <div className="flex items-center gap-2"><span className="text-sm">{item.done ? "✅" : "⏳"}</span><div className="font-medium">{item.label}</div></div>
          {item.detail ? <div className="mt-2 text-xs opacity-80">{item.detail}</div> : null}
        </div>
      ))}
    </div>
  );
}

export function StepGuidance({ title, description, nextHref, nextLabel }: { title: string; description: string; nextHref?: string; nextLabel?: string; }) {
  return (
    <section className="rounded-3xl border border-white/8 bg-black/20 p-5 md:p-6">
      <div className="text-[11px] uppercase tracking-[0.24em] text-[#C8FF00]">Próximo passo</div>
      <h2 className="mt-2 text-lg font-semibold text-white">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-[rgba(250,250,247,0.72)]">{description}</p>
      {nextHref && nextLabel ? <div className="mt-4"><Link href={nextHref} className="inline-flex rounded-2xl bg-[#C8FF00] px-4 py-3 text-sm font-medium text-[#0A0A0A] hover:bg-[#d6ff4d]">{nextLabel}</Link></div> : null}
    </section>
  );
}
