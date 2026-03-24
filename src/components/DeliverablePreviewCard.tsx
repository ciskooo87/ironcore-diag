import Link from "next/link";

export function DeliverablePreviewCard({
  title,
  description,
  href,
  tone = "slate",
  previewable = false,
}: {
  title: string;
  description: string;
  href: string;
  tone?: "slate" | "cyan" | "emerald" | "violet" | "amber";
  previewable?: boolean;
}) {
  const toneClass = {
    slate: "border-slate-800 bg-slate-950/30 text-slate-200",
    cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
    violet: "border-violet-400/20 bg-violet-400/10 text-violet-100",
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-100",
  }[tone];

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <div className="text-xs uppercase tracking-[0.18em] opacity-80">Deliverable</div>
      <div className="mt-2 font-medium">{title}</div>
      <div className="mt-2 text-sm opacity-90">{description}</div>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link href={href} className="rounded-xl border border-white/10 bg-black/10 px-3 py-2 hover:bg-black/20">Abrir</Link>
        <Link href={href} target="_blank" className="rounded-xl border border-white/10 bg-black/10 px-3 py-2 hover:bg-black/20">Nova guia</Link>
        {previewable ? <span className="rounded-xl border border-white/10 bg-black/10 px-3 py-2 opacity-80">Preview inline disponível abaixo</span> : null}
      </div>
    </div>
  );
}
