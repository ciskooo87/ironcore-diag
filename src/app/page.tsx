import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { appPath } from "@/lib/app-path";

export default async function Home() {
  const user = await getSessionUser();
  if (user) redirect("/projetos");

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#FAFAF7]">
      <nav className="sticky top-0 z-50 border-b border-white/8 bg-[rgba(10,10,10,0.92)] px-5 py-4 backdrop-blur md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="font-['Syne',var(--font-geist-sans)] text-lg font-extrabold tracking-[-0.02em]">IRONCORE <span className="text-[#C8FF00]">DIAG</span></div>
          <div className="flex items-center gap-4 md:gap-6 text-sm text-[#6B6B6B]">
            <a href="#como-funciona" className="hover:text-[#FAFAF7]">Como funciona</a>
            <a href="#precos" className="hover:text-[#FAFAF7]">Preços</a>
            <Link href={appPath('/login/')} className="rounded-md bg-[#C8FF00] px-4 py-2 font-medium text-[#0A0A0A] hover:bg-[#d6ff4d]">Solicitar diagnóstico</Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-5xl px-5 py-20 md:px-10 md:py-24">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[rgba(200,255,0,0.2)] bg-[rgba(200,255,0,0.08)] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.08em] text-[#C8FF00]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C8FF00]" /> Diagnóstico financeiro com IA
        </div>
        <h1 className="max-w-4xl font-['Syne',var(--font-geist-sans)] text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] md:text-6xl">Você envia a base.<br />A IA entrega o <span className="text-[#C8FF00]">diagnóstico.</span></h1>
        <p className="mt-6 max-w-2xl text-lg font-light leading-8 text-[rgba(250,250,247,0.6)]">Análise histórica completa da sua empresa — gerada por inteligência artificial, validada por executivo, pronta pra apresentar ao sócio ou ao banco. Em minutos.</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href={appPath('/login/')} className="rounded-lg bg-[#C8FF00] px-8 py-3 text-sm font-medium text-[#0A0A0A] shadow-[0_8px_24px_rgba(200,255,0,0.25)] hover:-translate-y-0.5 hover:bg-[#d6ff4d]">Solicitar diagnóstico agora</Link>
          <a href="#output" className="rounded-lg border border-white/8 px-6 py-3 text-sm text-[rgba(250,250,247,0.6)] hover:border-white/20 hover:text-[#FAFAF7]">Ver exemplo de relatório</a>
        </div>
      </section>

      <div className="mx-auto h-px max-w-5xl bg-white/8" />

      <section className="mx-auto max-w-5xl px-5 py-20 md:px-10" id="problema">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.12em] text-[#6B6B6B]">O problema</p>
        <h2 className="font-['Syne',var(--font-geist-sans)] text-3xl font-bold leading-tight tracking-[-0.025em] md:text-5xl">O histórico financeiro da sua empresa existe. Só que ninguém leu direito.</h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-white/8 bg-white/8 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['📂','Planilhas sem conclusão','Dados existem, mas ninguém transformou em diagnóstico. O gestor opera no escuro.'],
            ['⏳','Contador leva semanas','Consultoria tradicional custa caro e demora. Quando chega, o momento de decidir já passou.'],
            ['🗣️','Reunião sem embasamento','Sócio pede análise. Banco pede histórico. Você precisa de algo concreto — não de suposições.'],
            ['🔁','Padrão que se repete','Todo ano o mesmo problema. Caixa aperta, mas ninguém sabe exatamente onde o sangramento começou.'],
          ].map(([icon,title,desc]) => <div key={title} className="bg-[#141414] p-7"><div className="mb-3 text-xl">{icon}</div><div className="font-['Syne',var(--font-geist-sans)] text-base font-semibold text-[#FAFAF7]">{title}</div><div className="mt-2 text-sm leading-7 text-[#6B6B6B]">{desc}</div></div>)}
        </div>
      </section>

      <div className="mx-auto h-px max-w-5xl bg-white/8" />

      <section className="mx-auto max-w-5xl px-5 py-20 md:px-10" id="como-funciona">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.12em] text-[#6B6B6B]">Como funciona</p>
        <h2 className="font-['Syne',var(--font-geist-sans)] text-3xl font-bold leading-tight tracking-[-0.025em] md:text-5xl">Do upload ao diagnóstico. Sem complicação.</h2>
        <div className="mt-12 space-y-0">
          {[
            ['01','Você envia a base histórica','Upload do histórico financeiro da empresa — extratos, DRE, fluxo de caixa. Formato padrão, sem adaptação necessária.'],
            ['02','A IA consolida e analisa','O IRONCORE DIAG processa os dados, identifica padrões, anomalias e tendências.'],
            ['03','Geração do diagnóstico','O sistema gera um diagnóstico executivo completo — com métricas, interpretações e alertas — pronto para leitura humana.'],
            ['04','Validação e entrega','Um executivo revisa o diagnóstico antes da entrega final. Você recebe um documento confiável, não uma saída bruta de IA.'],
          ].map(([n,t,d]) => <div key={n} className="grid gap-4 border-b border-white/8 py-8 md:grid-cols-[64px_1fr]"><div className="pt-1 font-['Syne',var(--font-geist-sans)] text-xs font-bold tracking-[0.08em] text-[#C8FF00]">{n}</div><div><div className="font-['Syne',var(--font-geist-sans)] text-xl font-bold tracking-[-0.02em] text-[#FAFAF7]">{t}</div><div className="mt-2 text-sm leading-7 text-[rgba(250,250,247,0.55)]">{d}</div></div></div>)}
        </div>
      </section>

      <section className="border-y border-white/8 bg-[#141414] px-5 py-20 md:px-10" id="output">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.12em] text-[#6B6B6B]">Exemplo de output</p>
          <h2 className="font-['Syne',var(--font-geist-sans)] text-3xl font-bold leading-tight tracking-[-0.025em] md:text-5xl">O que você recebe</h2>
          <div className="mt-10 overflow-hidden rounded-xl border border-white/8 bg-[#1E1E1E]">
            <div className="flex items-center gap-3 border-b border-[rgba(200,255,0,0.12)] bg-[rgba(200,255,0,0.05)] px-6 py-4"><div className="h-2 w-2 rounded-full bg-[#C8FF00]" /><div className="text-xs font-medium uppercase tracking-[0.06em] text-[#C8FF00]">Diagnóstico histórico — Empresa XYZ · Jan–Dez 2024</div></div>
            <div className="grid gap-6 p-6 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Receita consolidada', value: 'R$ 4,2M', sub: 'Crescimento de 18% vs. 2023', bad: false },
                { label: 'Margem operacional', value: '-4,7%', sub: 'Deterioração no 3º trimestre', bad: true },
                { label: 'Caixa disponível', value: 'R$ 87K', sub: 'Cobertura de 12 dias', bad: false },
                { label: 'Ciclo financeiro', value: '+41 dias', sub: 'Versus benchmark do setor: 28d', bad: true },
              ].map((item) => <div key={item.label} className="border-l-2 border-[rgba(200,255,0,0.3)] pl-4"><div className="text-[11px] uppercase tracking-[0.08em] text-[#6B6B6B]">{item.label}</div><div className={`mt-2 font-['Syne',var(--font-geist-sans)] text-3xl font-bold tracking-[-0.02em] ${item.bad ? 'text-[#FF3B30]' : 'text-[#FAFAF7]'}`}>{item.value}</div><div className="mt-1 text-xs text-[#6B6B6B]">{item.sub}</div></div>)}
            </div>
            <div className="border-t border-white/8 bg-black/20 p-6"><div className="mb-3 text-[11px] uppercase tracking-[0.08em] text-[#C8FF00]/70">Insight da IA</div><div className="text-sm italic leading-7 text-[rgba(250,250,247,0.7)]">&quot;A empresa apresenta crescimento de receita consistente, porém com compressão de margem iniciada em agosto — correlacionada ao aumento do custo de fornecedores e alongamento do prazo médio de recebimento.&quot;</div></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-20 md:px-10" id="precos">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.12em] text-[#6B6B6B]">Preços</p>
        <h2 className="font-['Syne',var(--font-geist-sans)] text-3xl font-bold leading-tight tracking-[-0.025em] md:text-5xl">Simples. Sem surpresa.</h2>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-white/8 bg-[#141414] p-8"><div className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6B6B6B]">Avulso</div><div className="mt-4 font-['Syne',var(--font-geist-sans)] text-5xl font-extrabold tracking-[-0.03em] text-[#FAFAF7]"><span className="text-base align-top">R$</span>497</div><div className="mt-2 text-sm text-[#6B6B6B]">por diagnóstico</div></div>
          <div className="relative rounded-xl border border-[#C8FF00] bg-[rgba(200,255,0,0.04)] p-8"><div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C8FF00] px-4 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#0A0A0A]">Mais escolhido</div><div className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6B6B6B]">Mensal</div><div className="mt-4 font-['Syne',var(--font-geist-sans)] text-5xl font-extrabold tracking-[-0.03em] text-[#FAFAF7]"><span className="text-base align-top">R$</span>297</div><div className="mt-2 text-sm text-[#6B6B6B]">por mês · mínimo 3 meses</div></div>
          <div className="rounded-xl border border-white/8 bg-[#141414] p-8"><div className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6B6B6B]">Empresa</div><div className="mt-4 font-['Syne',var(--font-geist-sans)] text-3xl font-extrabold tracking-[-0.03em] text-[#FAFAF7]">Sob consulta</div><div className="mt-2 text-sm text-[#6B6B6B]">para múltiplas empresas</div></div>
        </div>
      </section>

      <section className="border-t border-white/8 px-5 py-24 text-center md:px-10">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-['Syne',var(--font-geist-sans)] text-3xl font-bold leading-tight tracking-[-0.025em] md:text-5xl">Seu histórico financeiro tem resposta. A IA vai buscar.</h2>
          <p className="mt-4 text-base font-light text-[rgba(250,250,247,0.5)]">Envie a base, receba o diagnóstico. Sem proposta longa, sem espera de semanas.</p>
          <div className="mt-10"><Link href={appPath('/login/')} className="rounded-lg bg-[#C8FF00] px-10 py-4 text-base font-medium text-[#0A0A0A] shadow-[0_8px_24px_rgba(200,255,0,0.25)] hover:-translate-y-0.5 hover:bg-[#d6ff4d]">Solicitar diagnóstico agora</Link></div>
        </div>
      </section>
    </main>
  );
}
