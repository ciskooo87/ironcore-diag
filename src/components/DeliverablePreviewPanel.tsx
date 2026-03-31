import Link from "next/link";

export function DeliverablePreviewPanel({ projectId }: { projectId: string }) {
  const base = `/api/projects/${projectId}`;
  const items = [
    {
      title: "Relatório executivo",
      type: "HTML / impressão",
      href: `${base}/pdf/`,
      preview: true,
      note: "Visualização inline disponível abaixo. Ideal para revisão rápida e impressão.",
    },
    {
      title: "Planilha analítica (.xlsx)",
      type: "Workbook",
      href: `${base}/xlsx/`,
      preview: false,
      note: "Arquivo para análise detalhada e conferência dos demonstrativos.",
    },
    {
      title: "Resumo executivo (.docx)",
      type: "Documento",
      href: `${base}/docx/`,
      preview: false,
      note: "Melhor abrir em Word/Google Docs para revisão formal do texto.",
    },
    {
      title: "Apresentação (.pptx)",
      type: "Deck",
      href: `${base}/pptx/`,
      preview: false,
      note: "Melhor abrir em PowerPoint/Google Slides/Keynote para revisão visual do deck.",
    },
  ];

  return (
    <section className="mt-6 rounded-3xl border border-slate-800 bg-[#111827] p-5 md:p-6">
      <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">Preview dos deliverables</div>
      <h2 className="mt-2 text-xl font-semibold text-white">Saídas prontas para revisão</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="min-w-0 rounded-2xl border border-slate-800 bg-slate-950/30 p-4 md:p-5 text-slate-200">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.type}</div>
            <div className="mt-2 break-words font-medium leading-6 text-white">{item.title}</div>
            <div className="mt-2 text-sm leading-6 text-slate-400">{item.note}</div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <Link href={item.href} className="rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2 hover:border-slate-600">Abrir</Link>
              <Link href={item.href} target="_blank" className="rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2 hover:border-slate-600">Nova guia</Link>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/30 p-3 md:p-4">
        <div className="mb-3 text-sm font-medium text-white">Preview inline do relatório executivo</div>
        <iframe src={`${base}/pdf/`} title="Preview do relatório executivo" className="h-[680px] w-full rounded-xl border border-slate-800 bg-white" />
      </div>
    </section>
  );
}

