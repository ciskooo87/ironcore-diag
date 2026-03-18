import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ProductHero, StatusPill } from "@/components/product-ui";
import { requireUser } from "@/lib/guards";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { listDailyEntries } from "@/lib/daily";
import { todayInSaoPauloISO } from "@/lib/time";

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
  if (!project) return <AppShell user={user} title="Upload histórico"><div className="alert bad-bg">Projeto não encontrado.</div></AppShell>;
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return <AppShell user={user} title="Upload histórico"><div className="alert bad-bg">Sem permissão.</div></AppShell>;
  const entries = await listDailyEntries(project.id, 100);
  const uploads = entries.filter((e) => String((e.payload || {}).notes || '').includes('upload_kind:historico_'));
  return <AppShell user={user} title="Upload das bases históricas" subtitle="Etapa 3 do workflow"><ProductHero eyebrow="etapa 3" title="Suba as cinco bases obrigatórias" description="Faturamento, CAR, CAP, endividamento bancos e endividamento FIDC."><StatusPill label={`Uploads: ${uploads.length}`} tone={uploads.length ? 'good' : 'warn'} /><Link href={`/projetos/${id}/contexto/`} className="pill">Próxima etapa</Link></ProductHero>{query.saved ? <div className="alert ok-bg mb-4">Upload realizado.</div> : null}{query.error ? <div className="alert bad-bg mb-4">Erro: {query.error}</div> : null}<section className="grid md:grid-cols-2 gap-3">{kinds.map(([kind,label]) => <form key={kind} action={`/api/projects/${id}/daily/upload`} method="post" encType="multipart/form-data" className="card !p-3 text-sm"><div className="font-medium mb-2">{label}</div><input type="hidden" name="upload_kind" value={kind} /><input name="business_date" type="date" defaultValue={todayInSaoPauloISO()} required className="mb-2 bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" /><input name="file" type="file" accept=".csv,.xlsx,.xls,.xlsm,.pdf" required className="mb-2 bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" /><input name="notes" placeholder="observações" className="mb-2 bg-slate-950/40 border border-slate-700 rounded-lg px-3 py-2" /><button type="submit" className="badge py-2 px-3 cursor-pointer">Enviar {label}</button></form>)}</section></AppShell>;
}
