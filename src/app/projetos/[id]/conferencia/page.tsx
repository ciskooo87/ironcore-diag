import Link from "next/link";
import { DiagShell } from "@/components/DiagShell";
import { StepGuidance } from "@/components/diag-workflow-ui";
import { NormalizationReview } from "@/components/NormalizationReview";
import { requireUser } from "@/lib/guards";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { appPath } from "@/lib/app-path";
import { buildProjectPresentation } from "@/lib/diag-presenter";
import { getHistoricalUploadAggregate } from "@/lib/historical-diagnosis";
import { StatusCallout } from "@/components/StatusCallout";

export default async function ConferenciaPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const project = await getProjectByCode(id);
  if (!project) return <DiagShell user={user} title="Conferência" active="alerts"><div className="rounded-[28px] border border-black/5 bg-white p-5 surface-elevated text-sm text-[#B42318]">Projeto não encontrado.</div></DiagShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <DiagShell user={user} title="Conferência" active="alerts"><div className="rounded-[28px] border border-black/5 bg-white p-5 surface-elevated text-sm text-[#B42318]">Sem permissão.</div></DiagShell>;
  const presentation = await buildProjectPresentation(project);
  const aggregate = await getHistoricalUploadAggregate(project.id);
  const savedPayload = (project.normalization_payload || {}) as any;
  const savedTotal = Number(savedPayload?.uploads?.total || 0);
  const savedKinds = Array.isArray(savedPayload?.uploads?.coverageKinds) ? savedPayload.uploads.coverageKinds : [];
  const aggregateKinds = Object.keys(aggregate.byKind || {});
  const effectivePayload = savedPayload?.financials && savedTotal > 0 && savedKinds.length >= aggregateKinds.length
    ? savedPayload
    : {
        uploads: {
          total: aggregate.totalUploads,
          latestBusinessDate: aggregate.latestBusinessDate,
          coverageKinds: aggregateKinds,
          missingKinds: [],
        },
        financials: {
          faturamento: aggregate.totals.faturamento,
          contasReceber: aggregate.totals.contasReceber,
          contasPagar: aggregate.totals.contasPagar,
          endividamentoBancos: aggregate.totals.endividamentoBancos,
          endividamentoFidc: aggregate.totals.endividamentoFidc,
          pressure: aggregate.totals.contasPagar - aggregate.totals.contasReceber,
        },
        debt: {
          totalRows: aggregate.debtRows.length,
          hasAnalyticalDebt: aggregate.debtRows.length > 0,
        },
        checkpoints: {
          hasContext: Boolean(project.historical_context?.trim()),
          readyForAi: Boolean(project.historical_context?.trim()) && aggregateKinds.length > 0,
        },
        stale: true,
      };

  return <DiagShell user={user} title="Conferência da normatização" subtitle="Revise o consolidado e trate os alertas críticos antes de liberar o diagnóstico. O foco aqui é validar leitura e coerência, não navegar pelo fluxo inteiro." active="alerts" project={{ name: project.name, code: project.code, client: project.legal_name, workflowState: project.workflow_state }} score={presentation.overallScore} status={project.workflow_state || "conferencia_normalizacao"} cta={<Link href={`/projetos/${id}/diagnostico/`} className="rounded-2xl border bg-[#0F172A] px-4 py-3 text-sm font-medium text-white hover:bg-[#111827]">Ir para diagnóstico</Link>}><div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_340px]"><section className="min-w-0 rounded-[28px] border border-black/5 bg-white p-6 surface-elevated md:p-7"><div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#98A2B3]">Conferência</div><h2 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.03em] text-[#101828]">Revisão do consolidado</h2>{query.error ? <div className="mt-4 rounded-2xl border border-[#FECDCA] bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318]">Erro: {query.error === 'missing_normalization' ? 'Não existe normatização válida para confirmar. Rode a normatização novamente.' : query.error}</div> : null}<div className="mt-4 grid gap-4 2xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]"><div className="min-w-0"><NormalizationReview payload={effectivePayload as any} /></div><div className="space-y-3"><div className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-4 md:p-5"><div className="text-xs uppercase tracking-[0.18em] text-[#98A2B3]">Pontos de atenção</div><div className="mt-3 space-y-3">{presentation.attention.map((item) => <div key={item.title} className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-4 md:p-5 text-sm"><div className="font-medium leading-6 text-[#101828]">{item.title}</div><div className="mt-2 leading-6 text-[#667085]">{item.recommendation}</div></div>)}</div></div></div></div><form action={appPath(`/api/projects/${id}/normalization/confirm/`)} method="post" className="mt-5"><button type="submit" className="rounded-2xl border bg-[#0F172A] px-4 py-3 text-sm font-medium text-white hover:bg-[#111827]">Confirmar normatização</button>{query.saved ? <div className="mt-3 rounded-2xl border border-[#ABEFC6] bg-[#ECFDF3] px-4 py-3 text-sm text-[#027A48]">Conferência registrada.</div> : null}</form></section><StepGuidance title="Depois da conferência" description="Com a normatização confirmada, o fluxo libera a montagem do diagnóstico. O próximo passo é sair da leitura estrutural e entrar na interpretação executiva do caso." nextHref={`/projetos/${id}/diagnostico/`} nextLabel="Seguir para diagnóstico" /></div></DiagShell>;
}
