import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ProductHero, EmptyState } from "@/components/product-ui";
import { PrintButton } from "@/components/PrintButton";
import { requireUser } from "@/lib/guards";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { appPath } from "@/lib/app-path";
import { listHistoricalDiagnosisValidations } from "@/lib/historical-validation";
import { ensureCsrfCookie } from "@/lib/csrf";
import { getLatestHistoricalDiagnosis } from "@/lib/historical-diagnosis";

export default async function EntregaFinalPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const project = await getProjectByCode(id);
  if (!project) return <AppShell user={user} title="Entrega final"><div className="alert bad-bg">Projeto não encontrado.</div></AppShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <AppShell user={user} title="Entrega final"><div className="alert bad-bg">Sem permissão.</div></AppShell>;

  const validations = await listHistoricalDiagnosisValidations(project.id, 20);
  const finalDiagnosis = (project.final_diagnosis || {}) as Record<string, any>;
  const csrf = await ensureCsrfCookie();
  const latestDiagnosis = await getLatestHistoricalDiagnosis(project.id);

  return (
    <AppShell user={user} title="Entrega final do diagnóstico" subtitle="Etapas 9 e 10 do workflow">
      <ProductHero eyebrow="etapas 9 e 10" title="Valide humanamente e entregue o diagnóstico final" description="Entrega final em tela e exportação para documento.">
        <PrintButton />
        <Link href={appPath(`/api/projects/${id}/pdf/`)} className="pill">Abrir versão documento</Link>
      </ProductHero>

      {query.saved ? <div className="alert ok-bg mb-4">Entrega final consolidada.</div> : null}

      <section className="grid md:grid-cols-2 gap-4">
        <section className="card text-sm">
          <div className="font-medium mb-3">Validação humana</div>
          {latestDiagnosis ? (
            <form action={appPath(`/api/projects/${id}/historical-diagnosis/validate/`)} method="post" className="grid gap-2">
              <input type="hidden" name="csrf_token" value={csrf} />
              <input type="hidden" name="inference_run_id" value={String(latestDiagnosis.id)} />
              <select name="decision" className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2">
                <option value="aprovado">Aprovado</option>
                <option value="ajustar">Ajustar</option>
                <option value="bloquear">Bloquear</option>
              </select>
              <textarea name="note" placeholder="nota da validação" className="bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2 min-h-28" />
              <button type="submit" className="badge py-2 px-3 cursor-pointer">Registrar validação</button>
            </form>
          ) : (
            <EmptyState title="Sem análise para validar" description="Gere a análise IA primeiro." />
          )}

          <form action={appPath(`/api/projects/${id}/finalize/`)} method="post" className="mt-4">
            <button type="submit" className="badge py-2 px-3 cursor-pointer">Gerar entrega final</button>
          </form>
        </section>

        <section className="card text-sm">
          {Object.keys(finalDiagnosis).length ? (
            <pre className="whitespace-pre-wrap text-slate-300">{JSON.stringify(finalDiagnosis, null, 2)}</pre>
          ) : (
            <EmptyState title="Sem entrega consolidada" description="Gere a entrega final após a análise e validação." />
          )}

          {validations.length ? (
            <div className="mt-4">
              <div className="font-medium mb-2">Validações</div>
              {validations.map((v) => (
                <div key={v.id} className="rounded-lg border border-slate-800 p-3 mb-2">
                  <div className="font-medium">{v.decision}</div>
                  <div className="text-xs text-slate-500">{v.validated_at}</div>
                  <div className="text-slate-300 mt-1">{v.summary_text || v.note || '-'}</div>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </section>
    </AppShell>
  );
}
