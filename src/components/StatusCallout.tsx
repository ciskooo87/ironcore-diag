import type { ReactNode } from "react";

export function StatusCallout({ tone = "info", children }: { tone?: "success" | "error" | "warning" | "info"; children: ReactNode }) {
  const styles = {
    success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
    error: "border-rose-400/20 bg-rose-400/10 text-rose-100",
    warning: "border-amber-400/20 bg-amber-400/10 text-amber-100",
    info: "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
  }[tone];
  return <div className={`rounded-2xl border px-4 py-3 text-sm ${styles}`}>{children}</div>;
}
