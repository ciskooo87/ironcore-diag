import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "ironcore_diag_session";
const CSRF_COOKIE = "ironcore_diag_csrf";
const BASE_PATH = (process.env.APP_BASE_PATH || "").trim();

function makeCsrf() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

function stripBase(pathname: string) {
  if (!BASE_PATH) return pathname;
  if (pathname === BASE_PATH) return "/";
  if (pathname.startsWith(`${BASE_PATH}/`)) return pathname.slice(BASE_PATH.length) || "/";
  return pathname;
}

export function proxy(req: NextRequest) {
  const pathname = stripBase(req.nextUrl.pathname);

  const withCsrf = (res: NextResponse) => {
    if (!req.cookies.get(CSRF_COOKIE)?.value) {
      res.cookies.set(CSRF_COOKIE, makeCsrf(), {
        httpOnly: false,
        sameSite: "lax",
        secure: true,
        path: BASE_PATH || "/",
        maxAge: 60 * 60 * 12,
      });
    }
    return res;
  };

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname === "/favicon.ico"
  ) {
    return withCsrf(NextResponse.next());
  }

  const session = req.cookies.get(AUTH_COOKIE)?.value;
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return withCsrf(NextResponse.redirect(url));
  }

  return withCsrf(NextResponse.next());
}

export const config = {
  matcher: ["/:path*"],
};
