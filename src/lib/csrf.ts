import { cookies } from "next/headers";

export const CSRF_COOKIE = "ironcore_diag_csrf";

export function createCsrfToken() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

export async function ensureCsrfCookie() {
  const store = await cookies();
  const existing = store.get(CSRF_COOKIE)?.value || "";
  if (existing) return existing;

  const token = createCsrfToken();
  store.set(CSRF_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
  });
  return token;
}

export async function validateCsrf(form: FormData) {
  const token = String(form.get("csrf_token") || "");
  const store = await cookies();
  const cookie = store.get(CSRF_COOKIE)?.value || "";
  return !!token && !!cookie && token === cookie;
}
