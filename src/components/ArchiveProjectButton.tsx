"use client";

export function ArchiveProjectButton({ action, label, mode = "archive", compact = false }: { action: string; label: string; mode?: "archive" | "restore" | "purge"; compact?: boolean }) {
  const copy = {
    archive: {
      confirm: `Arquivar o projeto ${label}? Ele sairá da lista principal, mas continuará salvo no banco.`,
      text: "Arquivar",
      cls: "border-[#FECDCA] bg-[#FEF3F2] text-[#B42318] hover:bg-[#FEE4E2]",
    },
    restore: {
      confirm: `Restaurar o projeto ${label} para a lista principal?`,
      text: "Restaurar",
      cls: "border-[#ABEFC6] bg-[#ECFDF3] text-[#027A48] hover:bg-[#D1FADF]",
    },
    purge: {
      confirm: `Excluir definitivamente o projeto ${label} do banco? Esta ação é irreversível.`,
      text: "Excluir definitivo",
      cls: "border-[#FECDCA] bg-[#FEF3F2] text-[#B42318] hover:bg-[#FEE4E2]",
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
      <button type="submit" className={`w-full rounded-2xl border px-4 transition ${compact ? "py-2 text-xs" : "py-3 text-sm"} text-center ${copy.cls}`}>
        {copy.text}
      </button>
    </form>
  );
}
