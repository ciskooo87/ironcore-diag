import Link from "next/link";
import { DiagShell } from "@/components/DiagShell";
import { RightRail } from "@/components/diag-panels";
import { PrintButton } from "@/components/PrintButton";
import { requireUser } from "@/lib/guards";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { appPath } from "@/lib/app-path";
import { listHistoricalDiagnosisValidations } from "@/lib/historical-validation";
import { ensureCsrfCookie } from "@/lib/csrf";
import { getLatestHistoricalDiagnosis } from "@/lib/historical-diagnosis";
import { buildProjectPresentation } from "@/lib/diag-presenter";

export default async function EntregaFinalPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const project = await getProjectByCode(id);
  if (!project) return <DiagShell user={user} title="Documento Final" active="document"><div className="rounded-3xl border border-slate-800 bg-[#111827] p-5 text-sm text-rose-200">Projeto não encontrado.</div></DiagShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <DiagShell user={user} title="Documento Final" active="document"><div className="rounded-3xl border border-slate-800 bg-[#111827] p-5 text-sm text-rose-200">Sem permissão.</div></DiagShell>;

  const validations = await listHistoricalDiagnosisValidations(project.id, 20);
  const finalDiagnosis = (project.final_diagnosis || {}) as Record<string, any>;
  const csrf = await ensureCsrfCookie();
  const latestDiagnosis = await getLatestHistoricalDiagnosis(project.id);
  const presentation = await buildProjectPresentation(project);

  return <DiagShell user={user} title="Documento Final" subtitle="Validação auditável, narrativa final e output pronto para entregar ao cliente." active="document" project={{ name: project.name, code: project.code, client: project.legal_name, workflowState: project.workflow_state }} score={presentation.overallScore} status={project.workflow_state || 'entrega_final'} cta={<PrintButton />}><div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]"><div className="space-y-4">{query.saved ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">Entrega final consolidada.</div> : null}<section className="rounded-3xl border border-slate-800 bg-[#111827] p-5 md:p-6"><div className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">Documento final</div><h2 className="mt-2 text-xl font-semibold text-white">Preview em tempo real</h2><div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/30 p-4 text-sm text-slate-300"><div className="text-lg font-semibold text-white">{project.name}</div><div className="mt-2">{presentation.executiveSummary}</div><pre className="mt-4 whitespace-pre-wrap text-xs text-slate-300">{JSON.stringify(finalDiagnosis, null, 2)}</pre></div><div className="mt-4 flex flex-wrap gap-3"><Link href={appPath(`/api/projects/${id}/pdf/`)} className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-400/15">Exportar PDF</Link><form action={appPath(`/api/projects/${id}/finalize/`)} method="post"><button type="submit" className="rounded-2xl border border-slate-700 bg-slate-950/30 px-4 py-3 text-sm text-slate-200 hover:border-slate-600">Gerar versão final</button></form></div></section></div><RightRail title="Validação humana">{latestDiagnosis ? <form action={appPath(`/api/projects/${id}/historical-diagnosis/validate/`)} method="post" className="grid gap-2"><input type="hidden" name="csrf_token" value={csrf} /><input type="hidden" name="inference_run_id" value={String(latestDiagnosis.id)} /><select name="decision" className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2"><option value="aprovado">Aprovar</option><option value="ajustar">Editar</option><option value="bloquear">Rejeitar</option></select><textarea name="note" placeholder="Comentários do responsável" className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2 min-h-28" /><button type="submit" className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-400/15">Validar decisão</button></form> : <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4 text-sm text-slate-400">Gere a análise IA para iniciar a validação.</div>}<div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">Trilha auditável</div><div className="mt-3 space-y-2 text-sm">{validations.length ? validations.map((v) => <div key={v.id} className="rounded-xl border border-slate-800 px-3 py-3"><div className="font-medium text-white">{v.decision}</div><div className="text-xs text-slate-500">{v.validated_at}</div><div className="mt-2 text-slate-300">{v.summary_text || v.note || '-'}</div></div>) : <div className="text-slate-400">Nenhuma validação ainda.</div>}</div></div></RightRail></div></DiagShell>;
}
