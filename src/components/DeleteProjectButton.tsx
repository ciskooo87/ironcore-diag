"use client";

export function DeleteProjectButton({ action, label }: { action: string; label: string }) {
  return (
    <form
      action={action}
      method="post"
      className="w-full"
      onSubmit={(event) => {
        const ok = window.confirm(`Arquivar o projeto ${label}? Ele sairá da lista principal, mas continuará salvo no banco.`);
        if (!ok) event.preventDefault();
      }}
    >
      <button type="submit" className="w-full rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-center text-sm text-rose-100 hover:bg-rose-400/15">
        Arquivar projeto
      </button>
    </form>
  );
}
