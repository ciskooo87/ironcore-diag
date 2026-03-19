import Link from "next/link";
import { DiagShell } from "@/components/DiagShell";
import { RightRail } from "@/components/diag-panels";
import { requireUser } from "@/lib/guards";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { appPath } from "@/lib/app-path";
import { listDailyEntries } from "@/lib/daily";
import { todayInSaoPauloISO } from "@/lib/time";
import { UploadHistoryForm } from "@/components/UploadHistoryForm";
import { buildProjectPresentation } from "@/lib/diag-presenter";

const kinds = [
  ["historico_faturamento", "Faturamento"],
  ["historico_contas_receber", "CAR"],
  ["historico_contas_pagar", "CAP"],
  ["historico_endividamento_bancos", "Endividamento Bancos"],
  ["historico_endividamento_fidc", "Endividamento FIDC"],
] as const;

export default async function UploadHistoricoPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const project = await getProjectByCode(id);
  if (!project) return <DiagShell user={user} title="Dados & Inputs" active="inputs"><div className="rounded-3xl border border-slate-800 bg-[#111827] p-5 text-sm text-rose-200">Projeto não encontrado.</div></DiagShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <DiagShell user={user} title="Dados & Inputs" active="inputs"><div className="rounded-3xl border border-slate-800 bg-[#111827] p-5 text-sm text-rose-200">Sem permissão.</div></DiagShell>;
  const entries = await listDailyEntries(project.id, 100);
  const uploads = entries.filter((e) => String((e.payload || {}).notes || "").includes("upload_kind:historico_"));
  const presentation = await buildProjectPresentation(project);

  return (
    <DiagShell
      user={user}
      title="Dados & Inputs"
      subtitle="Upload inteligente, preview estruturado e confiança do dado. Aqui o diagnóstico começa com qualidade de base, não com cara de Excel." 
      active="inputs"
      project={{ name: project.name, code: project.code, client: project.legal_name, workflowState: project.workflow_state }}
      score={presentation.overallScore}
      status={`Bases recebidas: ${uploads.length}`}
      cta={<Link href={`/projetos/${id}/contexto/`} className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-400/15">Avançar para relato</Link>}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          {query.saved ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">Upload realizado.</div> : null}
          {query.error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">Erro: {query.error}</div> : null}

          <section className="rounded-3xl border border-slate-800 bg-[#111827] p-5 md:p-6">
            <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">Upload inteligente</div>
            <h2 className="mt-2 text-xl font-semibold text-white">Dados & Inputs</h2>
            <p className="mt-2 text-sm text-slate-400">Suba as bases principais com drag & drop funcional e categorização automática por tipo de input.</p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {kinds.map(([kind, label]) => (
                <UploadHistoryForm key={kind} action={appPath(`/api/projects/${id}/daily/upload/`)} kind={kind} label={label} defaultDate={todayInSaoPauloISO()} />
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-[#111827] p-5 md:p-6">
            <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">Preview estruturado</div>
            <h2 className="mt-2 text-xl font-semibold text-white">O dado entra limpo, categorizado e pronto para leitura</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3 text-sm">
              {uploads.slice(0, 6).map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{entry.business_date}</div>
                  <div className="mt-2 font-medium text-white">{String((entry.payload as any)?.notes || "Upload histórico")}</div>
                  <div className="mt-2 text-slate-400">Confiança do dado: {Math.min(95, 55 + Number((entry.payload as any)?.parser_meta?.quality || 0) * 10)}%</div>
                </div>
              ))}
              {uploads.length === 0 ? <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4 text-slate-400">Nenhum input enviado ainda.</div> : null}
            </div>
          </section>
        </div>

        <RightRail title="Confiança do dado">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Score de confiabilidade</div>
            <div className="mt-2 text-3xl font-semibold text-white">{Math.min(95, 40 + uploads.length * 10)}%</div>
            <div className="mt-2 text-sm text-slate-400">Quanto maior a cobertura, melhor a qualidade da análise seguinte.</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Flags</div>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <div className="rounded-xl border border-slate-800 px-3 py-2">Inconsistência: {uploads.length < 5 ? "Bases incompletas" : "Sem alerta crítico de cobertura"}</div>
              <div className="rounded-xl border border-slate-800 px-3 py-2">Categorização automática: ativa</div>
            </div>
          </div>
        </RightRail>
      </div>
    </DiagShell>
  );
}
