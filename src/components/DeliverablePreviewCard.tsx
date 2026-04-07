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
    slate: "border-black/5 bg-[#F8FAFC] text-[#101828]",
    cyan: "border-cyan-400/20 bg-cyan-400/10 text-[#0F172A]",
    emerald: "border-[#ABEFC6] bg-[#ECFDF3] text-[#027A48]",
    violet: "border-violet-200 bg-violet-50 text-violet-900",
    amber: "border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]",
  }[tone];

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <div className="text-xs uppercase tracking-[0.18em] opacity-80">Deliverable</div>
      <div className="mt-2 font-medium">{title}</div>
      <div className="mt-2 text-sm opacity-90">{description}</div>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link href={href} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-[#344054] transition hover:border-black/15 hover:text-[#101828]">Abrir</Link>
        <Link href={href} target="_blank" className="rounded-xl border border-black/10 bg-white px-3 py-2 text-[#344054] transition hover:border-black/15 hover:text-[#101828]">Nova guia</Link>
        {previewable ? <span className="rounded-xl border border-black/10 bg-white px-3 py-2 text-[#667085]">Preview inline disponível abaixo</span> : null}
      </div>
    </div>
  );
}
