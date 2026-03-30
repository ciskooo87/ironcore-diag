"use client";

export function ArchiveProjectButton({ action, label, mode = "archive" }: { action: string; label: string; mode?: "archive" | "restore" | "purge" }) {
  const copy = {
    archive: {
      confirm: `Arquivar o projeto ${label}? Ele sairá da lista principal, mas continuará salvo no banco.`,
      text: "Arquivar projeto",
      cls: "border-rose-400/30 bg-rose-400/10 text-rose-100 hover:bg-rose-400/15",
    },
    restore: {
      confirm: `Restaurar o projeto ${label} para a lista principal?`,
      text: "Restaurar projeto",
      cls: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/15",
    },
    purge: {
      confirm: `Excluir definitivamente o projeto ${label} do banco? Esta ação é irreversível.`,
      text: "Excluir definitivamente",
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
      <button type="submit" className={`w-full rounded-2xl border px-4 py-3 text-center text-sm ${copy.cls}`}>
        {copy.text}
      </button>
    </form>
  );
}
