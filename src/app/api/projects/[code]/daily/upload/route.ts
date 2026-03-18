import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { getUserByEmail } from "@/lib/users";
import { insertDailyEntry } from "@/lib/daily";
import { dbQuery } from "@/lib/db";
import { parseUploadedFile } from "@/lib/upload";
import { diffDaysFromSaoPaulo } from "@/lib/time";
import { publicUrl } from "@/lib/request-url";

export async function POST(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const user = await getSessionUser();
  const project = await getProjectByCode(code);
  if (!user || !project) return NextResponse.redirect(publicUrl(req, `/projetos/${code}/diario/?error=forbidden`));
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return NextResponse.redirect(publicUrl(req, `/projetos/${code}/diario/?error=forbidden`));

  const form = await req.formData();
  const businessDate = String(form.get("business_date") || "");
  const uploadKind = String(form.get("upload_kind") || "");
  const file = form.get("file");
  const notes = String(form.get("notes") || "");
  const allowedKinds = new Set(["historico_faturamento","historico_contas_pagar","historico_contas_receber","historico_extratos","historico_estoques","historico_carteira","historico_borderos","historico_endividamento"]);

  const daysAgo = diffDaysFromSaoPaulo(businessDate);
  if (Number.isNaN(daysAgo) || daysAgo < 0 || daysAgo > 3650) return NextResponse.redirect(publicUrl(req, `/projetos/${code}/diario/?error=date_limit`));
  if (!allowedKinds.has(uploadKind)) return NextResponse.redirect(publicUrl(req, `/projetos/${code}/diario/?error=upload_kind`));
  if (!(file instanceof File) || file.size === 0) return NextResponse.redirect(publicUrl(req, `/projetos/${code}/diario/?error=file_required`));

  try {
    const parsed = await parseUploadedFile(file);
    const payload = {
      faturamento: parsed.faturamento,
      contas_receber: parsed.contas_receber,
      contas_pagar: parsed.contas_pagar,
      extrato_bancario: parsed.extrato_bancario,
      duplicatas: parsed.duplicatas,
      parser_meta: { quality: parsed.quality, matched_fields: parsed.matchedFields, unknown_columns: parsed.unknownColumns },
      notes: `${notes} | upload_kind:${uploadKind} arquivo:${file.name} linhas:${parsed.lines}`.trim(),
    };
    const dbUser = await getUserByEmail(user.email);
    const id = await insertDailyEntry({ projectId: project.id, businessDate, sourceType: "upload", payload, createdBy: dbUser?.id || null });
    await dbQuery("insert into audit_log(project_id, actor_user_id, action, entity, entity_id, after_data) values($1,$2,$3,$4,$5,$6::jsonb)", [project.id, dbUser?.id || null, "historical.upload", "daily_entries", id || null, JSON.stringify({ uploadKind, file: file.name, payload })]);
    return NextResponse.redirect(publicUrl(req, `/projetos/${code}/diario/?saved=1`));
  } catch {
    return NextResponse.redirect(publicUrl(req, `/projetos/${code}/diario/?error=upload_parse`));
  }
}
