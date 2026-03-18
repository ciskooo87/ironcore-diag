export function appPath(path: string) {
  const base = (process.env.APP_BASE_PATH || "").trim();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!base || base === "/") return normalized;
  return `${base}${normalized}`;
}
