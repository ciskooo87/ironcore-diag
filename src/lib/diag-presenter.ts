import type { Project } from "@/lib/projects";
import { getHistoricalUploadAggregate, getLatestHistoricalDiagnosis } from "@/lib/historical-diagnosis";
import { buildWorkflowChecklist } from "@/lib/diag-workflow";

function scoreBand(value: number) {
  if (value >= 75) return "ok" as const;
  if (value >= 45) return "warn" as const;
  return "bad" as const;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

export async function buildProjectPresentation(project: Project) {
  const aggregate = await getHistoricalUploadAggregate(project.id);
  const latest = await getLatestHistoricalDiagnosis(project.id);
  const normalized = (project.normalization_payload || {}) as Record<string, any>;
  const finalDiagnosis = (project.final_diagnosis || {}) as Record<string, any>;
  const workflow = await buildWorkflowChecklist(project);
  const pressure = aggregate.totals.contasPagar - aggregate.totals.contasReceber;
  const debt = aggregate.totals.endividamentoBancos + aggregate.totals.endividamentoFidc;
  const revenue = aggregate.totals.faturamento;
  const overdueDebt = aggregate.debtRows.reduce((sum, row) => sum + row.overdue, 0);
  const debtRatio = debt / Math.max(revenue, 1);
  const pressureRatio = pressure / Math.max(revenue, 1);

  function actionPlan(item: string, i: number) {
    const lower = item.toLowerCase();
    const caixaTema = lower.includes("caixa") || lower.includes("car") || lower.includes("cap") || lower.includes("capital de giro") || lower.includes("liquidez");
    const dividaTema = lower.includes("banco") || lower.includes("fidc") || lower.includes("dívida") || lower.includes("vencido") || lower.includes("endivid");
    const governancaTema = lower.includes("upload") || lower.includes("leitura") || lower.includes("contexto") || lower.includes("cobertura") || lower.includes("confer");

    if (lower.includes("vencido")) {
      return {
        what: "Atacar imediatamente o passivo vencido e reduzir risco de ruptura",
        why: `Há vencido consolidado de ${overdueDebt.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}, com potencial de travar caixa e relacionamento financeiro.`,
        who: "CFO / tesouraria / sócios",
        when: "Próximas 72 horas",
        where: "Credores críticos, bancos e fundos com parcelas em atraso",
        how: "Separar vencido crítico, negociar standstill pontual, priorizar quitação/repactuação e montar trilha diária de saneamento.",
        howMuch: "Impacto imediato sobre risco financeiro e continuidade operacional",
      };
    }

    if (lower.includes("fidc")) {
      return {
        what: "Reduzir dependência de FIDC e renegociar estruturas mais caras",
        why: `A exposição em FIDC está pressionando margem e reduzindo flexibilidade financeira da operação.`,
        who: "Sócios / financeiro / consultor líder",
        when: "Próximos 10 dias",
        where: "Fundos, cessões e contratos de antecipação",
        how: "Mapear custo efetivo, revisar elegibilidade das carteiras, reduzir concentração e buscar alternativas menos destrutivas ao caixa.",
        howMuch: "Redução potencial relevante no custo financeiro recorrente",
      };
    }

    if (lower.includes("banco") || lower.includes("endivid") || lower.includes("dívida")) {
      return {
        what: "Reestruturar passivos bancários e alongar perfil da dívida",
        why: `Endividamento consolidado de ${debt.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} está acima do conforto para a geração operacional atual.`,
        who: "Sócios / consultor líder / jurídico financeiro",
        when: "Próximos 15 dias",
        where: "Bancos, garantias e contratos de dívida",
        how: "Mapear cronograma completo da dívida, negociar alongamento/carência, revisar custo financeiro e redistribuir peso do curto prazo.",
        howMuch: "Redução potencial relevante no serviço da dívida",
      };
    }

    if (lower.includes("cap") || lower.includes("car") || lower.includes("caixa") || lower.includes("liquidez")) {
      return {
        what: "Estancar pressão imediata de caixa e reordenar pagamentos críticos",
        why: `Há descasamento entre entradas e saídas, com pressão CAP x CAR de ${Math.abs(pressure).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`,
        who: "CFO / consultor líder / financeiro",
        when: "Próximos 7 dias",
        where: "Contas a pagar, contas a receber e comitê de caixa",
        how: "Implantar rotina diária de caixa, priorizar desembolsos essenciais, renegociar vencimentos urgentes e acelerar cobrança dos maiores recebíveis.",
        howMuch: "Impacto alto e imediato sobre liquidez",
      };
    }

    if (governancaTema) {
      return {
        what: "Corrigir base analítica e reforçar governança do diagnóstico",
        why: "A qualidade da decisão depende de cobertura completa, leitura confiável dos insumos e narrativa validada.",
        who: "Consultor responsável / operação do projeto / responsável financeiro",
        when: "Antes da próxima rodada decisória",
        where: "Fluxo /diag, base histórica e conferência executiva",
        how: "Revisar uploads, eliminar inconsistências, validar contexto do caso e reconfirmar o consolidado antes da decisão final.",
        howMuch: "Impacto alto na confiabilidade do diagnóstico",
      };
    }

    if (dividaTema || caixaTema) {
      return {
        what: "Tratar o vetor financeiro dominante do diagnóstico",
        why: "O alerta aponta deterioração financeira que exige intervenção específica, não só acompanhamento passivo.",
        who: "Consultor líder / financeiro / direção",
        when: "Próxima rodada executiva",
        where: "Governança financeira e plano de ação do projeto",
        how: "Abrir frente dedicada para o alerta, definir responsável, meta e critério de reversão do risco.",
        howMuch: "Impacto potencial alto sobre margem e caixa",
      };
    }

    return {
      what: `Tratar: ${item}`,
      why: i === 0 ? "Evitar deterioração adicional do caso e proteger o resultado." : "Reduzir risco e elevar qualidade da decisão executiva.",
      who: i === 0 ? "Responsável do projeto + consultor líder" : "Consultor responsável",
      when: i === 0 ? "Imediato" : "Próxima revisão",
      where: "No fluxo do diagnóstico /diag",
      how: "Validar evidências, ajustar narrativa, definir responsável e acompanhar execução em ciclos curtos.",
      howMuch: i === 0 ? "Impacto financeiro potencial alto" : "Impacto moderado / a confirmar",
    };
  }

  const baseAttention = [
    pressure > 0 ? `Pressão de caixa relevante: CAP acima de CAR em ${pressure.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.` : null,
    debtRatio > 0.6 ? `Dívida consolidada elevada frente à receita histórica (${(debtRatio * 100).toFixed(1)}%).` : null,
    overdueDebt > 0 ? `Há vencido consolidado em ${overdueDebt.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}, exigindo ação imediata.` : null,
    workflow.weakUploads > 0 ? `${workflow.weakUploads} upload(s) vieram com leitura fraca e merecem revisão manual.` : null,
    ...(project.ai_attention_points || []),
  ].filter(Boolean) as string[];

  const uniqueAttention = Array.from(new Set(baseAttention));
  const attention = uniqueAttention.map((item, i) => ({
    level: i === 0 ? "Crítico" : i <= 2 ? "Atenção" : "Monitorar",
    title: item,
    impact: i === 0 ? "Alto impacto potencial" : i <= 2 ? "Impacto relevante" : "Impacto monitorável",
    origin: i < 3 ? "Motor financeiro do diagnóstico" : "Leitura IA + contexto do projeto",
    recommendation: i === 0 ? "Validar imediatamente" : "Revisar na próxima etapa",
    action5w2h: actionPlan(item, i),
  }));

  const caixaScore = clamp(72 - pressureRatio * 140 - (overdueDebt / Math.max(revenue, 1)) * 120, 10, 95);
  const operacaoScore = clamp(30 + workflow.progressPercent * 0.5 - workflow.weakUploads * 8, 10, 95);
  const endividamentoScore = clamp(85 - debtRatio * 70 - (overdueDebt > 0 ? 12 : 0), 10, 95);
  const receitaScore = clamp(revenue > 0 ? 55 + Math.min(20, Math.log10(revenue + 1) * 8) : 20, 10, 95);
  const governancaScore = clamp((project.historical_context ? 35 : 0) + (project.normalization_status === 'confirmado' ? 20 : 0) + (latest ? 20 : 0) + (workflow.validations > 0 ? 20 : 0), 10, 95);
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
      { title: "Caixa", value: caixaScore, tone: scoreBand(caixaScore), hint: "Liquidez, pressão CAP x CAR e vencidos" },
      { title: "Operação", value: operacaoScore, tone: scoreBand(operacaoScore), hint: "Cobertura, qualidade de upload e avanço do fluxo" },
      { title: "Endividamento", value: endividamentoScore, tone: scoreBand(endividamentoScore), hint: "Bancos + FIDC + vencidos" },
      { title: "Receita", value: receitaScore, tone: scoreBand(receitaScore), hint: "Escala histórica de faturamento" },
      { title: "Governança", value: governancaScore, tone: scoreBand(governancaScore), hint: "Contexto, conferência, IA e validação" },
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
