import type { ReactNode } from "react";

export function StatusCallout({ tone = "info", children }: { tone?: "success" | "error" | "warning" | "info"; children: ReactNode }) {
  const styles = {
    success: "border-[#ABEFC6] bg-[#ECFDF3] text-[#027A48]",
    error: "border-[#FECDCA] bg-[#FEF3F2] text-[#B42318]",
    warning: "border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]",
    info: "border-black/10 bg-white text-[#0F172A]",
  }[tone];

  return <div className={`rounded-2xl border px-4 py-3 text-sm ${styles}`}>{children}</div>;
}
