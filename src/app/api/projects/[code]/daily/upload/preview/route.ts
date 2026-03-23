import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { parseUploadedFile, validateParsedUpload } from "@/lib/upload";

export async function POST(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const user = await getSessionUser();
  const project = await getProjectByCode(code);
  if (!user || !project) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const form = await req.formData();
  const uploadKind = String(form.get("upload_kind") || "");
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "file_required" }, { status: 400 });

  const parsed = await parseUploadedFile(file);
  const validation = validateParsedUpload(uploadKind, parsed);
  return NextResponse.json({
    ok: validation.errors.length === 0,
    parsed: {
      quality: parsed.quality,
      matchedFields: parsed.matchedFields,
      warnings: [...parsed.warnings, ...validation.warnings],
      errors: validation.errors,
      totals: {
        faturamento: parsed.faturamento,
        contas_receber: parsed.contas_receber,
        contas_pagar: parsed.contas_pagar,
        extrato_bancario: parsed.extrato_bancario,
        duplicatas: parsed.duplicatas,
        debt_rows: parsed.debt_rows.length,
      },
    },
  });
}
