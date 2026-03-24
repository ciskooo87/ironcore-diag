import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getProjectByCode } from "@/lib/projects";
import { canAccessProject } from "@/lib/permissions";
import { buildUploadTemplate } from "@/lib/upload-templates";

const LABELS: Record<string, string> = {
  historico_faturamento: "Faturamento",
  historico_contas_receber: "CAR",
  historico_contas_pagar: "CAP",
  historico_endividamento_bancos: "Endividamento Bancos",
  historico_endividamento_fidc: "Endividamento FIDC",
};

export async function GET(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const user = await getSessionUser();
  const project = await getProjectByCode(code);
  if (!user || !project) return new NextResponse("forbidden", { status: 403 });
  const allowed = await canAccessProject(user, project.id);
  if (!allowed) return new NextResponse("forbidden", { status: 403 });
  const url = new URL(req.url);
  const kind = String(url.searchParams.get("kind") || "");
  const label = LABELS[kind];
  if (!label) return new NextResponse("invalid_kind", { status: 400 });
  const buffer = await buildUploadTemplate(kind, label);
  return new NextResponse(buffer as BodyInit, {
    status: 200,
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": `attachment; filename="template-${kind}.xlsx"`,
    },
  });
}
