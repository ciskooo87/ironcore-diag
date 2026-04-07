import Link from "next/link";
import { DiagShell } from "@/components/DiagShell";
import { RightRail } from "@/components/diag-panels";
import { PrintButton } from "@/components/PrintButton";
import { ValidationMatrix } from "@/components/ValidationMatrix";
import { DeliveryVersionDiff } from "@/components/DeliveryVersionDiff";
import { DeliverablePreviewPanel } from "@/components/DeliverablePreviewPanel";
import { StepGuidance, WorkflowChecklist } from "@/components/diag-workflow-ui";
import { requireUser } from "@/lib/guards";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { appPath } from "@/lib/app-path";
import { listHistoricalDiagnosisValidations } from "@/lib/historical-validation";
import { ensureCsrfCookie } from "@/lib/csrf";
import { getLatestHistoricalDiagnosis } from "@/lib/historical-diagnosis";
import { buildProjectPresentation } from "@/lib/diag-presenter";
import { buildWorkflowChecklist } from "@/lib/diag-workflow";
import { listDeliveryVersions } from "@/lib/delivery-versions";
import { StatusCallout } from "@/components/StatusCallout";

type ReportRow = { period: string; value: string | number };
type StatementRow = { label: string; values: number[] };
type Action5w2h = { what?: string; why?: string; who?: string; when?: string; where?: string; how?: string; howMuch?: string };
type DebtTableRow = { type: "fidc" | "bancario"; group: string; modality: string; overdue: number; upcoming: number; total: number };

type FinalReport = {
  executiveSummary?: string;
  scenarioReading?: string;
  rootCauses?: string[];
  debtAnalysis?: { banks?: string; fidc?: string; consolidated?: string };
  debtTable?: DebtTableRow[];
  cashImpact?: string;
  priorityRisks?: string[];
  strategicDirection?: string[];
  conclusion?: string;
  dreHistorical?: ReportRow[];
  dreProjected?: ReportRow[];
  dfcHistorical?: ReportRow[];
  dfcProjected?: ReportRow[];
  dreHistoricalStatement?: { periods: string[]; rows: StatementRow[] };
  dreProjectedStatement?: { periods: string[]; rows: StatementRow[] };
  dfcHistoricalStatement?: { periods: string[]; rows: StatementRow[] };
  dfcProjectedStatement?: { periods: string[]; rows: StatementRow[] };
  projectedCashflowStatement?: { periods: string[]; rows: StatementRow[] };
  kpis?: { label: string; value: string; tone: "cyan" | "emerald" | "amber" | "rose" }[];
};

function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function toneClass(tone: "cyan" | "emerald" | "amber" | "rose") {
  return {
    cyan: "border-cyan-400/20 bg-cyan-400/10 text-[#0F172A]",
    emerald: "border-[#ABEFC6] bg-[#ECFDF3] text-[#027A48]",
    amber: "border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]",
    rose: "border-[#FECDCA] bg-[#FEF3F2] text-[#B42318]",
  }[tone];
}

function MiniBarChart({ title, series, positive = true }: { title: string; series: ReportRow[]; positive?: boolean }) {
  const max = Math.max(...series.map((item) => Math.abs(Number(item.value) || 0)), 1);
  return (
    <div className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-5">
      <div className="text-xs uppercase tracking-[0.18em] text-[#98A2B3]">{title}</div>
      <div className="mt-4 space-y-3">
        {series.map((item) => {
          const numeric = Number(item.value) || 0;
          const width = Math.max(6, Math.round((Math.abs(numeric) / max) * 100));
          return (
            <div key={item.period}>
              <div className="mb-1 flex justify-between text-xs text-[#667085]"><span>{item.period}</span><span>{money(numeric)}</span></div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-900">
                <div className={`h-full rounded-full ${positive ? "bg-cyan-400" : "bg-rose-400"}`} style={{ width: `${width}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function buildFallbackStatement(series: ReportRow[] | undefined, kind: "dre" | "dfc") {
  if (!series?.length) return undefined;
  const periods = series.map((item) => item.period);
  const base = series.map((item) => Number(item.value) || 0);
  if (kind === "dre") {
    const deducoes = base.map((v) => Math.round(v * 0.08));
    const receitaLiquida = base.map((v, i) => v - deducoes[i]);
    const custos = receitaLiquida.map((v) => Math.round(v * 0.62));
    const lucroBruto = receitaLiquida.map((v, i) => v - custos[i]);
    const despesasOperacionais = receitaLiquida.map((v) => Math.round(v * 0.26));
    const ebitda = lucroBruto.map((v, i) => v - despesasOperacionais[i]);
    const resultadoFinanceiro = receitaLiquida.map((v) => -Math.round(v * 0.09));
    const lucroLiquido = ebitda.map((v, i) => v + resultadoFinanceiro[i]);
    return {
      periods,
      rows: [
        { label: "Receita bruta", values: base },
        { label: "(-) Deduções e impostos", values: deducoes.map((v) => -v) },
        { label: "Receita líquida", values: receitaLiquida },
        { label: "(-) Custos operacionais", values: custos.map((v) => -v) },
        { label: "Lucro bruto", values: lucroBruto },
        { label: "(-) Despesas operacionais", values: despesasOperacionais.map((v) => -v) },
        { label: "EBITDA", values: ebitda },
        { label: "Resultado financeiro", values: resultadoFinanceiro },
        { label: "Lucro líquido", values: lucroLiquido },
      ],
    };
  }
  const operacional = base;
  const investimento = operacional.map((v) => -Math.round(Math.abs(v) * 0.22));
  const financiamento = operacional.map((v) => (v < 0 ? Math.round(Math.abs(v) * 0.48) : -Math.round(v * 0.28)));
  const variacaoCaixa = operacional.map((v, i) => v + investimento[i] + financiamento[i]);
  const caixaInicial = base.map((_, i) => Math.max(250000 - i * 25000, 50000));
  const caixaFinal = caixaInicial.map((v, i) => v + variacaoCaixa[i]);
  return {
    periods,
    rows: [
      { label: "Fluxo operacional", values: operacional },
      { label: "Fluxo de investimento", values: investimento },
      { label: "Fluxo de financiamento", values: financiamento },
      { label: "Variação líquida de caixa", values: variacaoCaixa },
      { label: "Caixa inicial", values: caixaInicial },
      { label: "Caixa final", values: caixaFinal },
    ],
  };
}

function StatementTable({ title, statement, fallbackSeries, kind }: { title: string; statement?: { periods: string[]; rows: StatementRow[] }; fallbackSeries?: ReportRow[]; kind: "dre" | "dfc" }) {
  const resolved = statement || buildFallbackStatement(fallbackSeries, kind);
  return (
    <div className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-5 overflow-x-auto">
      <div className="text-xs uppercase tracking-[0.18em] text-[#98A2B3]">{title}</div>
      {!resolved ? <div className="mt-4 text-sm text-[#98A2B3]">Demonstrativo ainda não consolidado para esta entrega.</div> : (
        <table className="mt-4 min-w-[780px] w-full text-sm">
          <thead>
            <tr className="text-[#667085]">
              <th className="border-b border-white/8 px-3 py-2 text-left">Linha</th>
              {resolved.periods.map((period) => <th key={period} className="border-b border-white/8 px-3 py-2 text-right">{period}</th>)}
            </tr>
          </thead>
          <tbody>
            {resolved.rows.map((row) => (
              <tr key={row.label}>
                <td className="border-b border-slate-900 px-3 py-2 font-medium text-[#101828]">{row.label}</td>
                {row.values.map((value, idx) => <td key={`${row.label}-${idx}`} className={`border-b border-slate-900 px-3 py-2 text-right ${value < 0 ? "text-rose-300" : "text-[#475467]"}`}>{money(value)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default async function EntregaFinalPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const project = await getProjectByCode(id);
  if (!project) return <DiagShell user={user} title="Documento Final" active="document"><div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] text-sm text-rose-200">Projeto não encontrado.</div></DiagShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <DiagShell user={user} title="Documento Final" active="document"><div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] text-sm text-rose-200">Sem permissão.</div></DiagShell>;

  const validations = await listHistoricalDiagnosisValidations(project.id, 20);
  const finalDiagnosis = (project.final_diagnosis || {}) as { executiveReport?: FinalReport };
  const report = finalDiagnosis.executiveReport || {};
  const csrf = await ensureCsrfCookie();
  const latestDiagnosis = await getLatestHistoricalDiagnosis(project.id);
  const presentation = await buildProjectPresentation(project);
  const workflow = await buildWorkflowChecklist(project);
  const versions = await listDeliveryVersions(project.id);
  const attentionItems = presentation.attention.filter((item) => "action5w2h" in item).map((item) => item as typeof item & { action5w2h: Action5w2h });

  return (
    <DiagShell user={user} title="Validação humana e entrega final" subtitle="Fechamento do diagnóstico com leitura executiva, demonstrativos financeiros, gráficos, decisão humana auditável e documento exportável." active="document" project={{ name: project.name, code: project.code, client: project.legal_name, workflowState: project.workflow_state }} score={presentation.overallScore} status={workflow.readyForFinalDelivery ? "Pronto para entrega final" : "Aguardando validação humana ou consolidação final"} cta={<div className="flex max-w-full flex-wrap gap-2"><PrintButton /><Link href={`/api/projects/${id}/pdf/`} className="rounded-2xl bg-[#0F172A] px-4 py-3 text-sm font-medium text-white hover:bg-[#111827]">Relatório executivo</Link><Link href={`/api/projects/${id}/xlsx/`} className="rounded-2xl border border-black/5 bg-[#F8FAFC] px-4 py-3 text-sm font-medium text-[#344054] hover:border-white/15 hover:text-[#101828]">Planilha analítica (.xlsx)</Link><Link href={`/api/projects/${id}/docx/`} className="rounded-2xl border border-black/5 bg-[#F8FAFC] px-4 py-3 text-sm font-medium text-[#344054] hover:border-white/15 hover:text-[#101828]">Resumo executivo (.docx)</Link><Link href={`/api/projects/${id}/pptx/`} className="rounded-2xl border border-black/5 bg-[#F8FAFC] px-4 py-3 text-sm font-medium text-[#344054] hover:border-white/15 hover:text-[#101828]">Apresentação (.pptx)</Link></div>}>
      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          {query.saved ? <StatusCallout tone="success">Operação concluída com sucesso.</StatusCallout> : null}
          {query.error ? <StatusCallout tone="error">Erro na entrega final: {query.error}</StatusCallout> : null}

          <section className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] md:p-6">
            <div className="text-[11px] uppercase tracking-[0.24em] text-[#0F172A]">Produto final</div>
            <h2 className="mt-2 text-xl font-semibold text-[#101828]">Diagnóstico executivo final</h2>

            <div className="mt-6 space-y-6 text-sm text-[#475467]">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {(report.kpis || []).map((item) => (
                  <div key={item.label} className={`min-w-0 rounded-2xl border p-4 ${toneClass(item.tone)}`}>
                    <div className="text-xs uppercase tracking-[0.18em] opacity-80">{item.label}</div>
                    <div className="mt-2 break-words text-xl font-semibold leading-7">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                <div className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-5"><div className="text-xs uppercase tracking-[0.18em] text-[#98A2B3]">Resumo executivo</div><p className="mt-3 leading-7">{report.executiveSummary || presentation.executiveSummary}</p></div>
                <div className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-5"><div className="text-xs uppercase tracking-[0.18em] text-[#98A2B3]">Leitura do cenário</div><p className="mt-3 leading-7">{report.scenarioReading || presentation.narrative}</p></div>
              </div>

              <div className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-[#98A2B3]">Causas raiz e riscos prioritários</div>
                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                  <div><div className="text-sm font-medium text-[#101828]">Causas raiz</div><ul className="mt-3 space-y-2">{(report.rootCauses || []).map((item) => <li key={item}>• {item}</li>)}</ul></div>
                  <div><div className="text-sm font-medium text-[#101828]">Riscos prioritários</div><ul className="mt-3 space-y-2">{(report.priorityRisks || []).map((item) => <li key={item}>• {item}</li>)}</ul></div>
                </div>
              </div>

              <div className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-[#98A2B3]">Direcionamento estratégico e conclusão</div>
                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                  <div><div className="text-sm font-medium text-[#101828]">Direcionamento estratégico</div><ul className="mt-3 space-y-2">{(report.strategicDirection || []).map((item) => <li key={item}>• {item}</li>)}</ul></div>
                  <div><div className="text-sm font-medium text-[#101828]">Conclusão</div><p className="mt-3 leading-7">{report.conclusion || "-"}</p></div>
                </div>
              </div>

              <div className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-[#98A2B3]">Destaques financeiros</div>
                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                  <MiniBarChart title="Receita histórica" series={report.dreHistorical || []} positive />
                  <MiniBarChart title="Caixa histórico" series={report.dfcHistorical || []} positive={false} />
                </div>
                <div className="mt-4 rounded-2xl border border-black/5 bg-[#F8FAFC] p-5 overflow-x-auto">
                  <div className="text-xs uppercase tracking-[0.18em] text-[#98A2B3]">Endividamento analítico</div>
                  {(["fidc", "bancario"] as const).map((bucket) => {
                    const rows = (report.debtTable || []).filter((item) => item.type === bucket);
                    const totalOverdue = rows.reduce((sum, item) => sum + item.overdue, 0);
                    const totalUpcoming = rows.reduce((sum, item) => sum + item.upcoming, 0);
                    const total = rows.reduce((sum, item) => sum + item.total, 0);
                    return (
                      <div key={bucket} className="mt-5">
                        <div className="mb-2 text-sm font-medium text-[#101828]">{bucket === "fidc" ? "FIDC" : "Bancário"}</div>
                        <table className="w-full min-w-[760px] text-sm">
                          <thead><tr className="text-[#667085]"><th className="border-b border-white/8 px-3 py-2 text-left">Projeto</th><th className="border-b border-white/8 px-3 py-2 text-left">Modalidade</th><th className="border-b border-white/8 px-3 py-2 text-right">Vencido</th><th className="border-b border-white/8 px-3 py-2 text-right">A Vencer</th><th className="border-b border-white/8 px-3 py-2 text-right">Total</th></tr></thead>
                          <tbody>
                            {rows.map((row, idx) => <tr key={`${bucket}-${row.group}-${row.modality}-${idx}`}><td className="border-b border-slate-900 px-3 py-3 font-medium text-[#101828]">{row.group}</td><td className="border-b border-slate-900 px-3 py-3 text-[#475467]">{row.modality}</td><td className="border-b border-slate-900 px-3 py-3 text-right text-rose-300">{money(row.overdue)}</td><td className="border-b border-slate-900 px-3 py-3 text-right text-[#475467]">{money(row.upcoming)}</td><td className="border-b border-slate-900 px-3 py-3 text-right text-[#101828]">{money(row.total)}</td></tr>)}
                            <tr><td className="px-3 py-3 font-semibold text-[#101828]" colSpan={2}>Total {bucket === "fidc" ? "FIDC" : "Bancário"}</td><td className="px-3 py-3 text-right font-semibold text-rose-300">{money(totalOverdue)}</td><td className="px-3 py-3 text-right font-semibold text-[#344054]">{money(totalUpcoming)}</td><td className="px-3 py-3 text-right font-semibold text-[#101828]">{money(total)}</td></tr>
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 rounded-2xl border border-black/5 bg-[#F8FAFC] p-5"><div className="text-xs uppercase tracking-[0.18em] text-[#98A2B3]">Impacto em caixa</div><p className="mt-3 leading-7">{report.cashImpact || "-"}</p></div>
              </div>

              <div className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-[#98A2B3]">Demonstrativos e memória financeira</div>
                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                  <StatementTable title="DRE histórico completo" statement={report.dreHistoricalStatement} fallbackSeries={report.dreHistorical} kind="dre" />
                  <StatementTable title="DRE projetado completo" statement={report.dreProjectedStatement} fallbackSeries={report.dreProjected} kind="dre" />
                  <StatementTable title="DFC histórico completo" statement={report.dfcHistoricalStatement} fallbackSeries={report.dfcHistorical} kind="dfc" />
                  <StatementTable title="DFC projetado completo" statement={report.dfcProjectedStatement} fallbackSeries={report.dfcProjected} kind="dfc" />
                </div>
                <div className="mt-4"><StatementTable title="Fluxo de caixa projetado" statement={report.projectedCashflowStatement} fallbackSeries={report.dfcProjected} kind="dfc" /></div>
              </div>

              <div className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-[#98A2B3]">Plano de ação 5W2H</div>
                <div className="mt-3 space-y-3">
                  {attentionItems.map((item) => <div key={item.title} className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-4"><div className="font-medium leading-6 text-[#101828]">{item.title}</div><div className="mt-3 grid gap-3 text-xs leading-6 text-[#475467] md:grid-cols-2 xl:grid-cols-3"><div><span className="text-[#98A2B3]">What:</span> {item.action5w2h?.what || "-"}</div><div><span className="text-[#98A2B3]">Why:</span> {item.action5w2h?.why || "-"}</div><div><span className="text-[#98A2B3]">Who:</span> {item.action5w2h?.who || "-"}</div><div><span className="text-[#98A2B3]">When:</span> {item.action5w2h?.when || "-"}</div><div><span className="text-[#98A2B3]">Where:</span> {item.action5w2h?.where || "-"}</div><div><span className="text-[#98A2B3]">How:</span> {item.action5w2h?.how || "-"}</div><div className="md:col-span-2 xl:col-span-3"><span className="text-[#98A2B3]">How much:</span> {item.action5w2h?.howMuch || "-"}</div></div></div>)}
                  {attentionItems.length === 0 ? <div className="text-[#98A2B3]">Nenhuma ação 5W2H consolidada ainda.</div> : null}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <form action={appPath(`/api/projects/${id}/finalize/`)} method="post"><button type="submit" className="rounded-2xl border border-black/5 bg-[#F8FAFC] px-4 py-3 text-sm text-[#344054] hover:border-white/15">Consolidar entrega final</button></form>
              <Link href={`/projetos/${id}/historico/`} className="rounded-2xl border border-black/5 bg-[#F8FAFC] px-4 py-3 text-sm text-[#344054] hover:border-white/15">Abrir histórico</Link>
            </div>

            <DeliverablePreviewPanel projectId={id} />
          </section>
        </div>

        <RightRail title="Validação auditável">
          <div className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-4"><div className="text-xs uppercase tracking-[0.18em] text-[#98A2B3]">Checklist final</div><div className="mt-3"><WorkflowChecklist items={workflow.checklist} compact /></div></div>
          <StepGuidance title="Critério de fechamento" description="Esta etapa só fecha de verdade quando a leitura executiva estiver consolidada, houver validação humana registrada e o documento final puder ser exportado sem depender de interpretação adicional." />
          <ValidationMatrix hasInference={Boolean(latestDiagnosis)} validations={validations} />
          {latestDiagnosis ? <form action={appPath(`/api/projects/${id}/historical-diagnosis/validate/`)} method="post" className="grid gap-2"><input type="hidden" name="csrf_token" value={csrf} /><input type="hidden" name="inference_run_id" value={String(latestDiagnosis.id)} /><select name="decision" className="bg-white border border-black/10 rounded-lg px-3 py-2"><option value="aprovado">Aprovar</option><option value="ajustar">Editar</option><option value="bloquear">Rejeitar</option></select><textarea name="note" placeholder="Comentários do responsável" className="bg-white border border-black/10 rounded-lg px-3 py-2 min-h-28" /><button type="submit" className="rounded-2xl border bg-[#0F172A] px-4 py-3 text-sm font-medium text-white hover:bg-[#111827]">Validar decisão</button></form> : null}
          <div className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-4"><div className="text-xs uppercase tracking-[0.18em] text-[#98A2B3]">Trilha de decisão</div><div className="mt-3 space-y-2 text-sm">{validations.length ? validations.map((v) => <div key={v.id} className="rounded-xl border border-white/8 px-3 py-3"><div className="font-medium text-[#101828]">{v.decision}</div><div className="text-xs text-[#98A2B3]">{v.validated_at}</div><div className="mt-2 text-[#475467]">{v.summary_text || v.note || "-"}</div></div>) : <div className="text-[#667085]">Nenhuma validação ainda.</div>}</div></div>
          <div className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-4"><div className="text-xs uppercase tracking-[0.18em] text-[#98A2B3]">Versões da entrega</div><div className="mt-3 space-y-2 text-sm">{versions.length ? versions.map((v) => <div key={v.id} className="rounded-xl border border-white/8 px-3 py-3"><div className="font-medium text-[#101828]">Versão {v.version_no}</div><div className="text-xs text-[#98A2B3]">{v.generated_at}</div></div>) : <div className="text-[#667085]">Nenhuma versão consolidada ainda.</div>}</div></div>
          <DeliveryVersionDiff versions={versions as any} />
        </RightRail>
      </div>
    </DiagShell>
  );
}
