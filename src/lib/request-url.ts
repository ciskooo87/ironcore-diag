export function getPublicOrigin(req: Request) {
  const envOrigin = process.env.APP_PUBLIC_URL?.trim();
  if (envOrigin) {
    try {
      return new URL(envOrigin).origin;
    } catch {
      // fallback para headers
    }
  }

  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || new URL(req.url).host;
  return `${proto}://${host}`;
}

export function publicUrl(req: Request, path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, getPublicOrigin(req));
}
