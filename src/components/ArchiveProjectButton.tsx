"use client";

export function ArchiveProjectButton({ action, label, mode = "archive", compact = false }: { action: string; label: string; mode?: "archive" | "restore" | "purge"; compact?: boolean }) {
  const copy = {
    archive: {
      confirm: `Arquivar o projeto ${label}? Ele sairá da lista principal, mas continuará salvo no banco.`,
      text: "Arquivar",
      cls: "border-rose-400/30 bg-rose-400/10 text-rose-100 hover:bg-rose-400/15",
    },
    restore: {
      confirm: `Restaurar o projeto ${label} para a lista principal?`,
      text: "Restaurar",
      cls: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/15",
    },
    purge: {
      confirm: `Excluir definitivamente o projeto ${label} do banco? Esta ação é irreversível.`,
      text: "Excluir definitivo",
      cls: "border-rose-500/40 bg-rose-500/15 text-rose-100 hover:bg-rose-500/20",
    },
  }[mode];

  return (
    <form
      action={action}
      method="post"
      className="w-full"
      onSubmit={(event) => {
        const ok = window.confirm(copy.confirm);
        if (!ok) event.preventDefault();
      }}
    >
      <button type="submit" className={`w-full rounded-2xl border px-4 ${compact ? "py-2 text-xs" : "py-3 text-sm"} text-center ${copy.cls}`}>
        {copy.text}
      </button>
    </form>
  );
}
