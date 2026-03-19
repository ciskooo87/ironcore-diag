import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { str } from "@/lib/validation";
import { resetUserPassword } from "@/lib/users";
import { validateCsrf } from "@/lib/csrf";
import { publicUrl } from "@/lib/request-url";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin_master") return NextResponse.redirect(publicUrl(req, "/admin/?error=forbidden"));

  const form = await req.formData();
  const csrfOk = await validateCsrf(form);
  if (!csrfOk) return NextResponse.redirect(publicUrl(req, "/admin/?error=csrf"));

  try {
    const email = str(form.get("email"), 5, 200);
    const newPassword = str(form.get("new_password"), 8, 120);
    await resetUserPassword(email, newPassword);
    return NextResponse.redirect(publicUrl(req, "/admin/?saved=password"));
  } catch {
    return NextResponse.redirect(publicUrl(req, "/admin/?error=invalid"));
  }
}
