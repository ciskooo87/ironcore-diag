import Link from "next/link";
import { DiagShell } from "@/components/DiagShell";
import { RightRail } from "@/components/diag-panels";
import { StepGuidance, WorkflowChecklist } from "@/components/diag-workflow-ui";
import { requireUser } from "@/lib/guards";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { appPath } from "@/lib/app-path";
import { listDailyEntries } from "@/lib/daily";
import { todayInSaoPauloISO } from "@/lib/time";
import { UploadHistoryForm } from "@/components/UploadHistoryForm";
import { StatusCallout } from "@/components/StatusCallout";
import { buildProjectPresentation } from "@/lib/diag-presenter";
import { buildWorkflowChecklist, DIAG_BASE_KINDS } from "@/lib/diag-workflow";

type UploadPreviewPayload = {
  notes?: string;
  parser_meta?: { quality?: string; warnings?: string[] };
};

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
  if (!project) return <DiagShell user={user} title="Upload histórico" active="inputs"><div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] text-sm text-rose-200">Projeto não encontrado.</div></DiagShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <DiagShell user={user} title="Upload histórico" active="inputs"><div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] text-sm text-rose-200">Sem permissão.</div></DiagShell>;
  const entries = await listDailyEntries(project.id, 100);
  const uploads = entries.filter((e) => String((e.payload || {}).notes || "").includes("upload_kind:historico_"));
  const presentation = await buildProjectPresentation(project);
  const workflow = await buildWorkflowChecklist(project);

  return (
    <DiagShell
      user={user}
      title="Upload das bases históricas"
      subtitle="Suba as cinco bases obrigatórias do diagnóstico: faturamento, CAR, CAP, endividamento bancos e endividamento FIDC. Sem isso, o fluxo não fecha com segurança."
      active="inputs"
      project={{ name: project.name, code: project.code, client: project.legal_name, workflowState: project.workflow_state }}
      score={presentation.overallScore}
      status={`Cobertura: ${DIAG_BASE_KINDS.length - workflow.missingKinds.length}/${DIAG_BASE_KINDS.length} bases`}
      cta={<Link href={`/projetos/${id}/contexto/`} className="rounded-2xl border border-[rgba(200,255,0,0.25)] bg-[rgba(200,255,0,0.08)] px-4 py-3 text-sm font-medium text-[#0F172A] hover:bg-cyan-400/15">Avançar para relato</Link>}
    >
      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          {query.saved ? <div className="rounded-2xl border border-[#ABEFC6] bg-[#ECFDF3] px-4 py-3 text-sm text-[#027A48]">Upload realizado.</div> : null}
          {query.error ? <StatusCallout tone="error">{query.error === 'upload_validation' ? 'A base enviada não atendeu às regras mínimas do tipo selecionado.' : `Erro no upload: ${query.error}`}</StatusCallout> : null}

          <section className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] md:p-6">
            <div className="text-[11px] uppercase tracking-[0.24em] text-[#0F172A]">Bases obrigatórias</div>
            <h2 className="mt-2 text-xl font-semibold text-[#101828]">Upload histórico do projeto</h2>
            <p className="mt-2 text-sm text-[#667085]">Suba as bases certas, já categorizadas. CAR = Contas a Receber. CAP = Contas a Pagar.</p>
            <div className="mt-5 grid gap-3 2xl:grid-cols-2">
              {kinds.map(([kind, label]) => (
                <UploadHistoryForm key={kind} action={appPath(`/api/projects/${id}/daily/upload/`)} kind={kind} label={label} defaultDate={todayInSaoPauloISO()} templateHref={`/api/projects/${id}/daily/upload/template/?kind=${kind}`} />
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] md:p-6">
            <div className="text-[11px] uppercase tracking-[0.24em] text-[#0F172A]">Cobertura</div>
            <h2 className="mt-2 text-xl font-semibold text-[#101828]">Checklist das bases históricas</h2>
            <p className="mt-2 text-sm text-[#667085]">Use esta etapa só para confirmar cobertura e qualidade de upload. O restante do fluxo continua no relato e na conferência.</p>
            <div className="mt-4">
              <WorkflowChecklist items={workflow.checklist.slice(0, 3)} compact />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3 text-sm">
              {kinds.map(([kind, label]) => {
                const done = !workflow.missingKinds.includes(kind);
                return (
                  <div key={kind} className={`rounded-2xl border p-4 ${done ? "border-[#ABEFC6] bg-[#ECFDF3] text-[#027A48]" : "border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]"}`}>
                    <div className="text-xs uppercase tracking-[0.18em] opacity-80">{done ? "Recebido" : "Pendente"}</div>
                    <div className="mt-2 font-medium">{label}</div>
                    <div className="mt-2 text-xs opacity-80">{done ? "Base presente na consolidação." : "Enviar para fechar o diagnóstico."}</div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] md:p-6">
            <div className="text-[11px] uppercase tracking-[0.24em] text-[#0F172A]">Últimos uploads</div>
            <h2 className="mt-2 text-xl font-semibold text-[#101828]">Preview das bases recebidas</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3 text-sm">
              {uploads.slice(0, 6).map((entry) => {
                const payload = ((entry.payload || {}) as UploadPreviewPayload);
                return (
                  <div key={entry.id} className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-[#98A2B3]">{entry.business_date}</div>
                    <div className="mt-2 break-words font-medium leading-6 text-[#101828]">{String(payload.notes || "Upload histórico")}</div>
                    <div className="mt-2 text-[#667085]">Qualidade do parser: {String(payload.parser_meta?.quality || 'n/a')}</div>
                    {payload.parser_meta?.warnings?.length ? <div className="mt-2 text-xs text-amber-300">⚠ {payload.parser_meta.warnings[0]}</div> : null}
                  </div>
                );
              })}
              {uploads.length === 0 ? <div className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-4 text-[#667085]">Nenhuma base enviada ainda.</div> : null}
            </div>
          </section>
        </div>

        <RightRail title="Prontidão do fluxo">
          <div className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-[#98A2B3]">Score de cobertura</div>
            <div className="mt-2 text-3xl font-semibold text-[#101828]">{workflow.progressPercent}%</div>
            <div className="mt-2 text-sm text-[#667085]">Mede o quanto o projeto já percorreu da jornada completa do diagnóstico.</div>
          </div>
          <div className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-[#98A2B3]">Faltas críticas</div>
            <div className="mt-3 space-y-2 text-sm text-[#475467]">
              {workflow.missingKinds.length ? workflow.missingKinds.map((kind) => <div key={kind} className="rounded-xl border border-white/8 px-3 py-2">{kind}</div>) : <div className="rounded-xl border border-[#ABEFC6] bg-[#ECFDF3] px-3 py-2 text-[#027A48]">Todas as bases obrigatórias foram recebidas.</div>}
            </div>
          </div>
          <StepGuidance title="O que vem depois" description="Com as bases históricas recebidas, o próximo passo é registrar o relato do projeto. É ele que adiciona contexto humano à leitura financeira e prepara a normatização." nextHref={`/projetos/${id}/contexto/`} nextLabel="Ir para relato do projeto" />
        </RightRail>
      </div>
    </DiagShell>
  );
}
