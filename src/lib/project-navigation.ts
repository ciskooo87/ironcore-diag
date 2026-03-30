import type { Project } from "@/lib/projects";

export function getProjectContinueHref(project: Pick<Project, "code" | "workflow_state">) {
  const base = `/projetos/${project.code}`;

  switch (project.workflow_state) {
    case "cadastro":
      return `${base}/cadastro/`;
    case "upload_historico":
      return `${base}/upload-historico/`;
    case "relato_historico":
      return `${base}/contexto/`;
    case "normalizacao":
      return `${base}/normalizacao/`;
    case "conferencia_normalizacao":
      return `${base}/conferencia/`;
    case "montagem_diagnostico":
    case "analise_ia":
      return `${base}/diagnostico/`;
    case "validacao_humana":
    case "entrega_final":
      return `${base}/entrega-final/`;
    default:
      return `${base}/cadastro/`;
  }
}
