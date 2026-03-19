import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { createUser } from "@/lib/users";
import { str } from "@/lib/validation";
import { publicUrl } from "@/lib/request-url";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin_master") return NextResponse.redirect(publicUrl(req, "/admin/?error=forbidden"));

  const form = await req.formData();
  const csrfOk = await validateCsrf(form);
  if (!csrfOk) return NextResponse.redirect(publicUrl(req, "/admin/?error=csrf"));

  try {
    const email = str(form.get("email"), 5, 200).toLowerCase();
    const name = str(form.get("name"), 2, 120);
    const role = str(form.get("role"), 4, 40) as "consultor" | "head" | "diretoria" | "admin_master";
    const password = str(form.get("password"), 8, 120);
    await createUser({ email, name, role, password });
    return NextResponse.redirect(publicUrl(req, "/admin/?saved=user"));
  } catch {
    return NextResponse.redirect(publicUrl(req, "/admin/?error=invalid"));
  }
}
