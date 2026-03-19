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
  const pressure = aggregate.totals.contasPagar - aggregate.totals.contasReceber;
  const debt = aggregate.totals.endividamentoBancos + aggregate.totals.endividamentoFidc;
  const revenue = aggregate.totals.faturamento;

  function actionPlan(item: string, i: number) {
    const lower = item.toLowerCase();
    if (lower.includes("caixa") || lower.includes("car") || lower.includes("cap") || pressure > 0) {
      return {
        what: "Estancar pressão imediata de caixa e reordenar pagamentos críticos",
        why: `CAP supera CAR em ${Math.abs(pressure).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}, pressionando liquidez operacional.`,
        who: "CFO / consultor líder / financeiro",
        when: "Próximos 7 dias",
        where: "Contas a pagar, contas a receber e comitê de caixa",
        how: "Criar rotina diária de caixa, travar desembolsos não essenciais, renegociar passivos urgentes e acelerar cobrança dos maiores clientes.",
        howMuch: "Impacto alto e imediato sobre liquidez",
      };
    }
    if (lower.includes("banco") || lower.includes("fidc") || lower.includes("dívida") || debt > revenue * 0.8) {
      return {
        what: "Reestruturar passivos bancários e exposição em FIDC",
        why: `Endividamento consolidado de ${debt.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} está desalinhado com a capacidade atual de geração de caixa.`,
        who: "Sócios / consultor líder / jurídico financeiro",
        when: "Próximos 15 dias",
        where: "Bancos, fundos e contratos de dívida",
        how: "Mapear cronograma da dívida, buscar alongamento, carência, revisão de custo e saída de estruturas financeiramente destrutivas.",
        howMuch: "Redução potencial relevante no serviço da dívida",
      };
    }
    if (lower.includes("receita") || lower.includes("faturamento") || revenue < 10000000) {
      return {
        what: "Redefinir foco operacional para geração rápida de receita com margem",
        why: `Receita histórica consolidada em ${revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} não sustenta a estrutura atual.`,
        who: "Diretoria / comercial / operação",
        when: "Próximos 30 dias",
        where: "Portfólio, vendas e operação principal",
        how: "Suspender frentes sem retorno, priorizar ofertas com caixa curto, rever pricing e reduzir dispersão operacional.",
        howMuch: "Impacto moderado a alto em retomada de caixa",
      };
    }
    return {
      what: `Tratar: ${item}`,
      why: i === 0 ? "Evitar deterioração do diagnóstico e impacto financeiro imediato." : "Reduzir risco e elevar qualidade da decisão.",
      who: i === 0 ? "Responsável do projeto + consultor líder" : "Consultor responsável",
      when: i === 0 ? "Imediato" : "Próxima revisão",
      where: "No fluxo do diagnóstico /diag",
      how: "Validar evidências, ajustar narrativa e definir ação corretiva.",
      howMuch: i === 0 ? "Impacto financeiro potencial alto" : "Impacto moderado / a confirmar",
    };
  }

  const attention = (project.ai_attention_points || []).map((item, i) => ({
    level: i === 0 ? "Crítico" : i === 1 ? "Atenção" : "Monitorar",
    title: item,
    impact: i === 0 ? "Alto impacto potencial" : i === 1 ? "Impacto relevante" : "Impacto monitorável",
    origin: "Leitura IA + contexto do projeto",
    recommendation: i === 0 ? "Validar imediatamente" : "Revisar na próxima etapa",
    action5w2h: actionPlan(item, i),
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
