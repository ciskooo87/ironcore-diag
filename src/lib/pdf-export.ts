type Action5w2h = {
  what: string;
  why: string;
  who: string;
  when: string;
  where: string;
  how: string;
  howMuch: string;
};

type StatementRow = { label: string; values: number[] };
type DebtTableRow = { type: "fidc" | "bancario"; group: string; modality: string; overdue: number; upcoming: number; total: number };

type Report = {
  executiveSummary?: string;
  scenarioReading?: string;
  rootCauses?: string[];
  debtAnalysis?: { banks?: string; fidc?: string; consolidated?: string };
  debtTable?: DebtTableRow[];
  cashImpact?: string;
  priorityRisks?: string[];
  strategicDirection?: string[];
  conclusion?: string;
  dreHistoricalStatement?: { periods: string[]; rows: StatementRow[] };
  dreProjectedStatement?: { periods: string[]; rows: StatementRow[] };
  dfcHistoricalStatement?: { periods: string[]; rows: StatementRow[] };
  dfcProjectedStatement?: { periods: string[]; rows: StatementRow[] };
  projectedCashflowStatement?: { periods: string[]; rows: StatementRow[] };
  kpis?: { label: string; value: string; tone: string }[];
};

function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function statementTable(title: string, statement?: { periods: string[]; rows: StatementRow[] }) {
  if (!statement) return `<section class="box"><h2>${title}</h2><p>Demonstrativo não consolidado.</p></section>`;
  const head = statement.periods.map((p) => `<th>${p}</th>`).join("");
  const body = statement.rows.map((row) => `<tr><td><strong>${row.label}</strong></td>${row.values.map((v) => `<td class="num">${money(v)}</td>`).join("")}</tr>`).join("");
  return `<section class="box"><h2>${title}</h2><table><thead><tr><th>Linha</th>${head}</tr></thead><tbody>${body}</tbody></table></section>`;
}

export function diagnosisHtml(input: {
  title: string;
  projectName: string;
  summary: string;
  attentionPoints: string[];
  narrative: string;
  client?: string;
  score?: number;
  actions5w2h?: Action5w2h[];
  report?: Report;
}) {
  const items = input.attentionPoints.map((item) => `<li>${item}</li>`).join("");
  const actions = (input.actions5w2h || [])
    .map((a) => `<div class="box"><strong>${a.what}</strong><p><b>Why:</b> ${a.why}</p><p><b>Who:</b> ${a.who} | <b>When:</b> ${a.when}</p><p><b>Where:</b> ${a.where}</p><p><b>How:</b> ${a.how}</p><p><b>How much:</b> ${a.howMuch}</p></div>`)
    .join("");
  const causes = (input.report?.rootCauses || []).map((x) => `<li>${x}</li>`).join("");
  const directions = (input.report?.strategicDirection || []).map((x) => `<li>${x}</li>`).join("");
  const kpis = (input.report?.kpis || []).map((k) => `<div class="kpi"><div class="muted">${k.label}</div><div class="kpi-value">${k.value}</div></div>`).join("");
  const debtRows = (input.report?.debtTable || []).map((row) => `<tr><td>${row.type}</td><td>${row.group}</td><td>${row.modality}</td><td class="num">${money(row.overdue)}</td><td class="num">${money(row.upcoming)}</td><td class="num">${money(row.total)}</td></tr>`).join("");
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${input.title}</title><style>body{font-family:Inter,Arial,sans-serif;padding:32px;color:#111827;background:#fff}h1,h2{margin:0 0 12px}p,li,td,th{line-height:1.5;font-size:14px}section{margin:24px 0}.cover{padding:24px;border:1px solid #dbe3f0;border-radius:20px;background:linear-gradient(135deg,#eff6ff,#ffffff)}.muted{color:#475569;font-size:12px}.score{display:inline-block;padding:10px 14px;border-radius:999px;border:1px solid #bfdbfe;background:#dbeafe;color:#1d4ed8;font-weight:700}.box{border:1px solid #e2e8f0;border-radius:18px;padding:18px;background:#fafafa;margin-bottom:14px}.kpis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:18px}.kpi{border:1px solid #dbe3f0;border-radius:16px;padding:14px;background:#fff}.kpi-value{font-size:18px;font-weight:700;margin-top:6px}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border-bottom:1px solid #e2e8f0;padding:8px;text-align:left;vertical-align:top}th{background:#f8fafc}.num{text-align:right}pre{white-space:pre-wrap;font-family:Inter,Arial,sans-serif}</style></head><body><div class="cover"><div class="muted">IRONCORE DIAG · Documento Final</div><h1>${input.title}</h1><p><strong>Cliente:</strong> ${input.client || input.projectName}</p><p><strong>Projeto:</strong> ${input.projectName}</p>${typeof input.score === "number" ? `<div class="score">Score Geral: ${input.score}</div>` : ""}<div class="kpis">${kpis}</div></div><section class="box"><h2>Resumo executivo</h2><p>${input.summary}</p></section><section class="box"><h2>Leitura do cenário</h2><p>${input.report?.scenarioReading || input.narrative}</p></section><section class="box"><h2>Causas raiz</h2><ul>${causes || '<li>Não consolidado.</li>'}</ul></section><section class="box"><h2>Endividamento analítico</h2><table><thead><tr><th>Tipo</th><th>Projeto</th><th>Modalidade</th><th>Vencido</th><th>A vencer</th><th>Total</th></tr></thead><tbody>${debtRows || '<tr><td colspan="6">Não consolidado.</td></tr>'}</tbody></table></section><section class="box"><h2>Impacto em caixa</h2><p>${input.report?.cashImpact || '-'}</p></section><section class="box"><h2>Riscos prioritários</h2><ul>${items}</ul></section><section class="box"><h2>Direcionamento estratégico</h2><ul>${directions || '<li>Não consolidado.</li>'}</ul></section>${statementTable('DRE Histórico', input.report?.dreHistoricalStatement)}${statementTable('DRE Projetado', input.report?.dreProjectedStatement)}${statementTable('DFC Histórico', input.report?.dfcHistoricalStatement)}${statementTable('DFC Projetado', input.report?.dfcProjectedStatement)}${statementTable('Fluxo de Caixa Projetado', input.report?.projectedCashflowStatement)}<section class="box"><h2>Conclusão</h2><p>${input.report?.conclusion || input.narrative}</p></section><section><h2>Plano de ação 5W2H</h2>${actions || '<div class="box">Nenhuma ação estruturada ainda.</div>'}</section></body></html>`;
}
