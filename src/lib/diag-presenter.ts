import type { Project } from "@/lib/projects";
import { getHistoricalUploadAggregate, getLatestHistoricalDiagnosis } from "@/lib/historical-diagnosis";

function score(value: number) {
  if (value >= 75) return "ok" as const;
  if (value >= 45) return "warn" as const;
  return "bad" as const;
}

export async function buildProjectPresentation(project: Project) {
  const aggregate = await getHistoricalUploadAggregate(project.id);
  const latest = await getLatestHistoricalDiagnosis(project.id);
  const normalized = (project.normalization_payload || {}) as Record<string, any>;
  const finalDiagnosis = (project.final_diagnosis || {}) as Record<string, any>;
  const attention = (project.ai_attention_points || []).map((item, i) => ({
    level: i === 0 ? "Crítico" : i === 1 ? "Atenção" : "Monitorar",
    title: item,
    impact: i === 0 ? "Alto impacto potencial" : i === 1 ? "Impacto relevante" : "Impacto monitorável",
    origin: "Leitura IA + contexto do projeto",
    recommendation: i === 0 ? "Validar imediatamente" : "Revisar na próxima etapa",
    action5w2h: {
      what: `Tratar: ${item}`,
      why: i === 0 ? "Evitar deterioração do diagnóstico e impacto financeiro imediato." : "Reduzir risco e elevar qualidade da decisão.",
      who: i === 0 ? "Responsável do projeto + consultor líder" : "Consultor responsável",
      when: i === 0 ? "Imediato" : "Próxima revisão",
      where: "No fluxo do diagnóstico /diag",
      how: "Validar evidências, ajustar narrativa e definir ação corretiva.",
      howMuch: i === 0 ? "Impacto financeiro potencial alto" : "Impacto moderado / a confirmar",
    },
  }));

  const caixaScore = Math.max(10, Math.min(95, 60 + Math.round((aggregate.totals.contasReceber - aggregate.totals.contasPagar) / 1000)));
  const operacaoScore = aggregate.totalUploads >= 4 ? 78 : 42;
  const endividamentoScore = aggregate.totals.endividamentoBancos + aggregate.totals.endividamentoFidc > 0 ? 38 : 72;
  const receitaScore = aggregate.totals.faturamento > 0 ? 74 : 28;
  const governancaScore = project.historical_context ? 70 : 35;
  const overallScore = Math.round((caixaScore + operacaoScore + endividamentoScore + receitaScore + governancaScore) / 5);

  return {
    aggregate,
    latest,
    normalized,
    finalDiagnosis,
    narrative: latest?.response || finalDiagnosis.narrative || project.project_summary || "Projeto ainda em estruturação diagnóstica.",
    executiveSummary: project.historical_context || project.project_summary || "Sem contexto detalhado ainda.",
    overallScore,
    scoreBreakdown: [
      { title: "Caixa", value: caixaScore, tone: score(caixaScore), hint: "Liquidez e pressão entre CAR e CAP" },
      { title: "Operação", value: operacaoScore, tone: score(operacaoScore), hint: "Cobertura e organização dos dados" },
      { title: "Endividamento", value: endividamentoScore, tone: score(endividamentoScore), hint: "Bancos + FIDC" },
      { title: "Receita", value: receitaScore, tone: score(receitaScore), hint: "Base de faturamento histórica" },
      { title: "Governança", value: governancaScore, tone: score(governancaScore), hint: "Qualidade do contexto e validação" },
    ],
    attention: attention.length ? attention : [{ level: "Monitorar", title: "Nenhum ponto crítico registrado ainda.", impact: "Baixo", origin: "Aguardando insumos", recommendation: "Completar fluxo" }],
    stageLabel:
      project.workflow_state === "entrega_final" ? "Output" :
      project.workflow_state === "validacao_humana" ? "Validação" :
      project.workflow_state === "analise_ia" || project.workflow_state === "montagem_diagnostico" ? "Análise IA" :
      project.workflow_state === "conferencia_normalizacao" || project.workflow_state === "normalizacao" ? "Estruturação" :
      project.workflow_state === "upload_historico" || project.workflow_state === "cadastro" ? "Input" :
      "Narrativa",
  };
}
