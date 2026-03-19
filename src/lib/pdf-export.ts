type Action5w2h = {
  what: string;
  why: string;
  who: string;
  when: string;
  where: string;
  how: string;
  howMuch: string;
};

export function diagnosisHtml(input: {
  title: string;
  projectName: string;
  summary: string;
  attentionPoints: string[];
  narrative: string;
  client?: string;
  score?: number;
  actions5w2h?: Action5w2h[];
}) {
  const items = input.attentionPoints.map((item) => `<li>${item}</li>`).join("");
  const actions = (input.actions5w2h || [])
    .map(
      (a) => `
        <div class="box">
          <strong>${a.what}</strong>
          <p><b>Why:</b> ${a.why}</p>
          <p><b>Who:</b> ${a.who} | <b>When:</b> ${a.when}</p>
          <p><b>Where:</b> ${a.where}</p>
          <p><b>How:</b> ${a.how}</p>
          <p><b>How much:</b> ${a.howMuch}</p>
        </div>
      `
    )
    .join("");

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <title>${input.title}</title>
    <style>
      body{font-family:Inter,Arial,sans-serif;padding:40px;color:#111827;background:#fff}
      h1,h2{margin:0 0 12px}
      p,li{line-height:1.6}
      section{margin:28px 0}
      .cover{padding:24px;border:1px solid #dbe3f0;border-radius:20px;background:linear-gradient(135deg,#eff6ff,#ffffff)}
      .muted{color:#475569}
      .score{display:inline-block;padding:10px 14px;border-radius:999px;border:1px solid #bfdbfe;background:#dbeafe;color:#1d4ed8;font-weight:700}
      .box{border:1px solid #e2e8f0;border-radius:18px;padding:18px;background:#fafafa;margin-bottom:14px}
      pre{white-space:pre-wrap;font-family:Inter,Arial,sans-serif}
    </style>
  </head>
  <body>
    <div class="cover">
      <div class="muted">IRONCORE DIAG · Documento Final</div>
      <h1>${input.title}</h1>
      <p><strong>Cliente:</strong> ${input.client || input.projectName}</p>
      <p><strong>Projeto:</strong> ${input.projectName}</p>
      ${typeof input.score === "number" ? `<div class="score">Score Geral: ${input.score}</div>` : ""}
    </div>

    <section class="box">
      <h2>Resumo executivo</h2>
      <p>${input.summary}</p>
    </section>

    <section class="box">
      <h2>Pontos de atenção</h2>
      <ul>${items}</ul>
    </section>

    <section class="box">
      <h2>Narrativa diagnóstica</h2>
      <pre>${input.narrative}</pre>
    </section>

    <section>
      <h2>Plano de ação 5W2H</h2>
      ${actions || '<div class="box">Nenhuma ação estruturada ainda.</div>'}
    </section>
  </body>
</html>`;
}
