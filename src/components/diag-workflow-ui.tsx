import Link from "next/link";

type WorkflowItem = {
  key: string;
  label: string;
  done: boolean;
  detail?: string;
};

export function WorkflowChecklist({
  items,
  compact = false,
}: {
  items: WorkflowItem[];
  compact?: boolean;
}) {
  return (
    <div className={`grid gap-3 ${compact ? "" : "md:grid-cols-2"}`}>
      {items.map((item) => (
        <div
          key={item.key}
          className={`rounded-2xl border p-4 ${
            item.done
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
              : "border-slate-800 bg-slate-950/30 text-slate-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">{item.done ? "✅" : "⏳"}</span>
            <div className="font-medium">{item.label}</div>
          </div>
          {item.detail ? <div className="mt-2 text-xs opacity-80">{item.detail}</div> : null}
        </div>
      ))}
    </div>
  );
}

export function StepGuidance({
  title,
  description,
  nextHref,
  nextLabel,
}: {
  title: string;
  description: string;
  nextHref?: string;
  nextLabel?: string;
}) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-[#111827] p-5 md:p-6">
      <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">Guia da etapa</div>
      <h2 className="mt-2 text-xl font-semibold text-white">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
      {nextHref && nextLabel ? (
        <div className="mt-4">
          <Link
            href={nextHref}
            className="inline-flex rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-400/15"
          >
            {nextLabel}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
