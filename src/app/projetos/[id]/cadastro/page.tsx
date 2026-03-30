import Link from "next/link";
import { DiagShell } from "@/components/DiagShell";
import { StepGuidance } from "@/components/diag-workflow-ui";
import { requireUser } from "@/lib/guards";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { appPath } from "@/lib/app-path";
import { buildProjectPresentation } from "@/lib/diag-presenter";

function pct(value: unknown, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function Field({ label, hint, name, defaultValue, placeholder, required = false, className = "", type = "text", suffix }: { label: string; hint?: string; name: string; defaultValue?: string | number; placeholder?: string; required?: boolean; className?: string; type?: string; suffix?: string }) {
  return (
    <label className={`block ${className}`}>
      <div className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">{label}</div>
      {hint ? <div className="mb-2 text-[11px] text-slate-500">{hint}</div> : null}
      <div className="relative">
        <input name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} required={required} className="w-full rounded-lg border border-slate-700 bg-slate-950/40 px-3 py-2 pr-10 text-sm" />
        {suffix ? <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">{suffix}</span> : null}
      </div>
    </label>
  );
}

function ParameterCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <div className="rounded-2xl border border-slate-800 bg-slate-950/20 p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">{title}</div><div className="mt-1 text-xs text-slate-500">{description}</div><div className="mt-3 grid gap-3">{children}</div></div>;
}

export default async function CadastroPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const project = await getProjectByCode(id);
  if (!project) return <DiagShell user={user} title="Cadastro" active="overview"><div className="rounded-3xl border border-slate-800 bg-[#111827] p-5 text-sm text-rose-200">Projeto não encontrado.</div></DiagShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <DiagShell user={user} title="Cadastro" active="overview"><div className="rounded-3xl border border-slate-800 bg-[#111827] p-5 text-sm text-rose-200">Sem permissão.</div></DiagShell>;
  const presentation = await buildProjectPresentation(project);
  const fp = project.financial_profile || {};

  return <DiagShell user={user} title="Cadastro do projeto" subtitle="Confirme os dados-base do cliente e também os parâmetros financeiros usados na montagem sintética do DRE/DFC." active="overview" project={{ name: project.name, code: project.code, client: project.legal_name, workflowState: project.workflow_state }} score={presentation.overallScore} status={project.workflow_state || "cadastro"} cta={<Link href={`/projetos/${id}/upload-historico/`} className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-400/15">Próxima etapa</Link>}><div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]"><section className="rounded-3xl border border-slate-800 bg-[#111827] p-5 md:p-6"><div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">Cadastro</div><h2 className="mt-2 text-xl font-semibold text-white">Base do projeto + parâmetros DRE/DFC</h2><p className="mt-2 text-sm text-slate-400">Além dos dados cadastrais, configure aqui os percentuais que alimentam DRE e DFC histórico/projetado.</p><form action={appPath(`/api/projects/${id}/cadastro/save/`)} method="post" className="mt-5 grid gap-3 text-sm md:grid-cols-2"><Field label="Nome do projeto" name="name" defaultValue={project.name} placeholder="Nome" required /><Field label="CNPJ" name="cnpj" defaultValue={project.cnpj} placeholder="CNPJ" required /><Field label="Razão social" name="legal_name" defaultValue={project.legal_name} placeholder="Razão social" required className="md:col-span-2" /><Field label="Segmento" name="segment" defaultValue={project.segment} placeholder="Segmento" required /><Field label="Sócios" name="partners" defaultValue={(project.partners || []).join(", ")} placeholder="Sócios" /><label className="block md:col-span-2"><div className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Resumo do projeto</div><div className="mb-2 text-[11px] text-slate-500">Resumo executivo do caso, contexto e deterioração observada.</div><textarea name="project_summary" defaultValue={project.project_summary} placeholder="Resumo do projeto" className="min-h-32 w-full rounded-lg border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm" /></label>

<div className="mt-2 rounded-2xl border border-slate-800 bg-slate-950/20 p-4 md:col-span-2"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">Parâmetros financeiros legados</div><div className="mt-1 text-xs text-slate-500">Mantidos por compatibilidade com regras antigas do projeto.</div><div className="mt-3 grid gap-3 md:grid-cols-4"><Field label="TX" hint="Campo legado" name="tx_percent" defaultValue={pct(fp.tx_percent, 0)} placeholder="0" suffix="%" /><Field label="Float" hint="Campo legado" name="float_days" defaultValue={pct(fp.float_days, 0)} placeholder="0" suffix="dias" /><Field label="TAC" hint="Campo legado" name="tac" defaultValue={pct(fp.tac, 0)} placeholder="0" suffix="R$" /><Field label="Custo por boleto" hint="Campo legado" name="cost_per_boleto" defaultValue={pct(fp.cost_per_boleto, 0)} placeholder="0" suffix="R$" /></div></div>

<div className="grid gap-4 md:col-span-2 xl:grid-cols-2">
  <ParameterCard title="DRE histórico" description="Premissas usadas para montar a leitura histórica.">
    <Field label="Impostos / deduções" hint="Ex.: 8 para 8%" name="tax_rate" defaultValue={pct(fp.tax_rate, 0.08) * 100} placeholder="8" suffix="%" />
    <Field label="Custos históricos" hint="% da receita líquida" name="hist_cost_rate" defaultValue={pct(fp.hist_cost_rate, 0.62) * 100} placeholder="62" suffix="%" />
    <Field label="Opex histórico" hint="Despesas operacionais" name="hist_opex_rate" defaultValue={pct(fp.hist_opex_rate, 0.24) * 100} placeholder="24" suffix="%" />
    <Field label="Financeiro histórico" hint="Peso do financeiro" name="hist_finance_rate" defaultValue={pct(fp.hist_finance_rate, 0.07) * 100} placeholder="7" suffix="%" />
  </ParameterCard>

  <ParameterCard title="DRE projetado" description="Premissas de melhoria ou deterioração futura.">
    <Field label="Custos projetados" hint="% da receita líquida" name="proj_cost_rate" defaultValue={pct(fp.proj_cost_rate, 0.58) * 100} placeholder="58" suffix="%" />
    <Field label="Opex projetado" hint="Despesas operacionais" name="proj_opex_rate" defaultValue={pct(fp.proj_opex_rate, 0.21) * 100} placeholder="21" suffix="%" />
    <Field label="Financeiro projetado" hint="Peso do financeiro" name="proj_finance_rate" defaultValue={pct(fp.proj_finance_rate, 0.055) * 100} placeholder="5.5" suffix="%" />
    <Field label="Caixa inicial" hint="Base de partida do DFC" name="opening_cash" defaultValue={pct(fp.opening_cash, 280000)} placeholder="280000" suffix="R$" />
  </ParameterCard>

  <ParameterCard title="DFC histórico" description="Taxas de conversão e saída do caixa histórico.">
    <Field label="Conversão caixa hist." hint="Entradas operacionais / receita" name="hist_collection_rate" defaultValue={pct(fp.hist_collection_rate, 0.78) * 100} placeholder="78" suffix="%" />
    <Field label="Saídas operac. hist." hint="Saídas / receita" name="hist_payment_rate" defaultValue={pct(fp.hist_payment_rate, 0.83) * 100} placeholder="83" suffix="%" />
    <Field label="Investimentos hist." hint="CAPEX / receita" name="hist_invest_rate" defaultValue={pct(fp.hist_invest_rate, 0.05) * 100} placeholder="5" suffix="%" />
  </ParameterCard>

  <ParameterCard title="DFC projetado" description="Taxas futuras para o fluxo de caixa projetado.">
    <Field label="Conversão caixa proj." hint="Entradas operacionais / receita" name="proj_collection_rate" defaultValue={pct(fp.proj_collection_rate, 0.86) * 100} placeholder="86" suffix="%" />
    <Field label="Saídas operac. proj." hint="Saídas / receita" name="proj_payment_rate" defaultValue={pct(fp.proj_payment_rate, 0.74) * 100} placeholder="74" suffix="%" />
    <Field label="Investimentos proj." hint="CAPEX / receita" name="proj_invest_rate" defaultValue={pct(fp.proj_invest_rate, 0.04) * 100} placeholder="4" suffix="%" />
  </ParameterCard>
</div>

<button type="submit" className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-400/15 md:col-span-2">Salvar cadastro</button>{query.saved ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100 md:col-span-2">Cadastro salvo. Siga para o upload das bases.</div> : null}{query.error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100 md:col-span-2">Erro ao salvar parâmetros: {query.error}</div> : null}</form></section><StepGuidance title="Critério de saída" description="Agora o cadastro também define os parâmetros-base do DRE/DFC. Isso te permite calibrar a modelagem sintética por projeto em vez de depender de heurística fixa no código." nextHref={`/projetos/${id}/upload-historico/`} nextLabel="Ir para upload histórico" /></div></DiagShell>;
}
