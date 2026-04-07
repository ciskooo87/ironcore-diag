import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { appPath } from "@/lib/app-path";

const painPoints = [
  {
    title: "Caixa pressionado sem causa clara",
    description: "O faturamento cresce, mas a operação segue apertada e a leitura financeira não mostra exatamente onde o valor está ficando pelo caminho.",
  },
  {
    title: "Margens instáveis ao longo do tempo",
    description: "Oscilações importantes aparecem nos números, mas sem uma interpretação objetiva fica difícil agir com velocidade e confiança.",
  },
  {
    title: "Decisão sem visão consolidada",
    description: "Diretoria, controladoria e sócios operam com dados fragmentados, o que aumenta ruído e atrasa prioridades críticas.",
  },
];

const deliveries = [
  "Identificação dos principais riscos financeiros",
  "Estimativa de impacto no resultado e no caixa",
  "Leitura executiva pronta para diretoria",
  "Plano de ação estruturado (5W2H)",
];

const workflow = [
  {
    step: "01",
    title: "Envio de dados",
    description:
      "Você compartilha sua base financeira — DRE, fluxo de caixa, contas a receber e demais arquivos relevantes.",
  },
  {
    step: "02",
    title: "Processamento IronCore",
    description:
      "A plataforma estrutura, valida e destaca os fatos mais relevantes para leitura executiva.",
  },
  {
    step: "03",
    title: "Diagnóstico executivo",
    description:
      "Você recebe uma leitura consolidada com riscos prioritários, impacto estimado e ações recomendadas.",
  },
];

const audiences = [
  "Empresas com faturamento relevante e pressão de caixa",
  "CFOs e controllers que precisam de clareza rápida",
  "Consultorias que precisam padronizar diagnóstico",
  "Fundos e operações em turnaround",
];

const differentiators = [
  "Estruturação automática de informações",
  "Priorização de riscos por impacto",
  "Linguagem executiva pronta para decisão",
  "Rastreabilidade entre dado e conclusão",
];

const proofs = [
  "Pressão de caixa não mapeada em 60 dias",
  "Margem negativa oculta por estrutura comercial",
  "Dependência crítica de antecipação de recebíveis",
];

const offerItems = [
  "Entrega em até 48h",
  "3 principais riscos",
  "Impacto estimado",
  "Plano de ação",
];

function SectionTag({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div
      className={[
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        dark
          ? "border border-white/12 bg-white/8 text-white/72"
          : "border border-[rgba(16,24,40,0.08)] bg-white text-[#667085] shadow-[0_8px_24px_rgba(15,23,42,0.04)]",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-sm leading-6 text-[#344054] md:text-[15px]">
      <span className="mt-1 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#0F172A] text-[11px] font-bold text-white">
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}

export default async function Home() {
  const user = await getSessionUser();
  if (user) redirect("/projetos");

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F7F8FA] text-[#0F172A]">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[680px] bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.08),transparent_38%),radial-gradient(circle_at_top_right,rgba(148,163,184,0.18),transparent_28%),linear-gradient(180deg,#FFFFFF_0%,#F7F8FA_58%,#F7F8FA_100%)]" />

      <nav className="sticky top-0 z-50 border-b border-black/5 bg-[rgba(247,248,250,0.82)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-[52px] w-[52px] flex-none items-center justify-center overflow-hidden rounded-xl border border-black/5 bg-white shadow-[0_10px_25px_rgba(15,23,42,0.06)]">
              <Image src="/brand/ironcore-mark.webp" alt="IronCore" width={28} height={28} className="h-9 w-9 object-contain" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-[0.08em] text-[#111827]">IRONCORE DIAG</div>
              <div className="truncate text-xs text-[#667085]">Diagnóstico executivo financeiro</div>
            </div>
          </div>

          <div className="hidden items-center gap-7 text-sm text-[#475467] lg:flex">
            <a href="#como-funciona" className="transition hover:text-[#111827]">Como funciona</a>
            <a href="#para-quem" className="transition hover:text-[#111827]">Para quem é</a>
            <a href="#oferta" className="transition hover:text-[#111827]">Oferta</a>
          </div>

          <Link
            href={appPath("/login/")}
            className="inline-flex flex-none items-center justify-center rounded-xl bg-[#0F172A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#111827] md:px-5"
          >
            Solicitar diagnóstico
          </Link>
        </div>
      </nav>

      <section className="px-4 pb-14 pt-8 md:px-8 md:pb-24 md:pt-12 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <SectionTag>Diagnóstico executivo em até 48h</SectionTag>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-[#101828] sm:text-5xl md:text-6xl lg:text-7xl">
              Descubra onde sua empresa está perdendo dinheiro — antes que apareça no caixa
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#475467] sm:text-lg md:text-xl">
              A IronCore entrega um diagnóstico executivo com riscos, impacto financeiro e plano de ação em até 48h.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={appPath("/login/")}
                className="inline-flex items-center justify-center rounded-xl bg-[#0F172A] px-7 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#111827]"
              >
                Solicitar diagnóstico
              </Link>
              <a
                href="#entrega"
                className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-7 py-4 text-sm font-semibold text-[#344054] transition hover:border-black/15 hover:text-[#111827]"
              >
                Ver o que você recebe
              </a>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ["48h", "Prazo de entrega"],
                ["3 riscos", "Priorizados no diagnóstico express"],
                ["5W2H", "Plano de ação estruturado"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-black/5 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                  <div className="text-2xl font-semibold tracking-[-0.03em] text-[#101828]">{value}</div>
                  <div className="mt-1 text-sm leading-6 text-[#667085]">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-3 top-10 hidden h-24 w-24 rounded-full bg-[#E2E8F0] blur-3xl md:block" />
            <div className="absolute -right-4 bottom-16 hidden h-24 w-24 rounded-full bg-[#CBD5E1] blur-3xl md:block" />

            <div className="relative overflow-hidden rounded-[30px] border border-black/5 bg-white p-4 shadow-[0_28px_90px_rgba(15,23,42,0.10)] sm:p-5 md:p-7">
              <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(248,250,252,0))]" />

              <div className="relative rounded-[26px] border border-black/5 bg-[#F8FAFC] p-5 sm:p-6">
                <div className="flex flex-col gap-4 border-b border-black/5 pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#98A2B3]">Prévia executiva</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#101828]">Diagnóstico IronCore</h2>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-[#667085]">
                      Leitura objetiva sobre riscos financeiros, impacto estimado e prioridades de ação.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-start rounded-2xl border border-black/5 bg-white px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                    <Image src="/brand/ironcore-mark.webp" alt="Marca IronCore" width={44} height={44} className="h-12 w-12 rounded-xl object-contain p-0.5" />
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#98A2B3]">Entrega</div>
                      <div className="text-sm font-semibold text-[#101828]">Pronta para diretoria</div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {[
                    ["Risco prioritário", "Pressão de caixa projetada nos próximos 60 dias"],
                    ["Impacto estimado", "Redução potencial de liquidez operacional"],
                    ["Causa provável", "Alongamento de recebíveis e margem comprimida"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                      <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#98A2B3]">{label}</div>
                      <div className="mt-2 text-sm font-medium leading-6 text-[#101828]">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[0.88fr_1.12fr]">
                  <div className="rounded-2xl border border-[#D0D5DD] bg-[#FCFCFD] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#667085]">Mapa de riscos</div>
                      <div className="rounded-full bg-[#ECFDF3] px-3 py-1 text-[11px] font-semibold text-[#027A48]">Consolidado</div>
                    </div>
                    <div className="mt-4 space-y-4">
                      {[
                        ["Caixa", "Alto", "bg-[#FEF3F2] text-[#B42318]"],
                        ["Margem", "Alto", "bg-[#FEF3F2] text-[#B42318]"],
                        ["Recebíveis", "Médio", "bg-[#FFFAEB] text-[#B54708]"],
                      ].map(([label, level, className]) => (
                        <div key={label} className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3">
                          <div className="text-sm font-medium text-[#101828]">{label}</div>
                          <div className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${className}`}>{level}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#0F172A] p-5 text-white shadow-[0_14px_40px_rgba(15,23,42,0.18)]">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">Plano de ação</div>
                    <ul className="mt-4 space-y-3 text-sm leading-6 text-white/88">
                      <li>• Revisar política comercial e prazo médio de recebimento</li>
                      <li>• Recalibrar mix com foco em margem real</li>
                      <li>• Priorizar medidas de caixa no horizonte imediato</li>
                    </ul>
                    <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/72">
                      Diagnóstico desenhado para acelerar decisão, não para gerar mais camada de análise.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/5 bg-white px-4 py-16 md:px-8 md:py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionTag>Dor</SectionTag>
          <div className="mt-6 grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
            <div>
              <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#101828] md:text-5xl">
                Empresas não quebram por falta de dados. Quebram por falta de leitura.
              </h2>
              <p className="mt-6 max-w-lg text-lg leading-8 text-[#475467]">
                O problema não está na informação. Está na interpretação.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {painPoints.map((item) => (
                <div key={item.title} className="rounded-2xl border border-black/5 bg-[#F8FAFC] p-6">
                  <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-white text-base font-semibold text-[#0F172A] shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
                    •
                  </div>
                  <p className="mt-5 text-base font-semibold leading-7 text-[#101828]">{item.title}</p>
                  <p className="mt-3 text-sm leading-7 text-[#667085]">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="entrega" className="px-4 py-16 md:px-8 md:py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionTag>O que a IronCore entrega</SectionTag>
          <div className="mt-6 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <h2 className="text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#101828] md:text-5xl">
                Diagnóstico Executivo Estruturado
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#475467]">
                Uma leitura que organiza o que importa, mostra onde está o risco e orienta o próximo movimento da gestão.
              </p>
              <ul className="mt-8 space-y-3">
                <CheckItem>Sem dashboards. Sem ruído. Apenas decisão.</CheckItem>
                <CheckItem>Formato objetivo para diretoria, sócios e operação financeira.</CheckItem>
                <CheckItem>Entrega pensada para virar ação, não apresentação esquecida.</CheckItem>
              </ul>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {deliveries.map((item) => (
                <div key={item} className="rounded-2xl border border-black/5 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                  <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[#98A2B3]">Entrega</div>
                  <p className="mt-4 text-base font-medium leading-7 text-[#101828]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="border-y border-black/5 bg-[#FCFCFD] px-4 py-16 md:px-8 md:py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionTag>Como funciona</SectionTag>
          <div className="mt-6 flex max-w-3xl flex-col gap-4">
            <h2 className="text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#101828] md:text-5xl">
              Um processo enxuto para chegar rápido à leitura certa.
            </h2>
            <p className="text-lg leading-8 text-[#475467]">
              O foco é reduzir tempo entre dado bruto e decisão executiva.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {workflow.map((item) => (
              <div key={item.step} className="rounded-[24px] border border-black/5 bg-white p-7 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
                <div className="text-sm font-semibold tracking-[0.18em] text-[#98A2B3]">{item.step}</div>
                <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-[#101828]">{item.title}</h3>
                <p className="mt-4 text-base leading-7 text-[#475467]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="para-quem" className="px-4 py-16 md:px-8 md:py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionTag>Para quem é</SectionTag>
          <div className="mt-6 grid gap-10 lg:grid-cols-[0.88fr_1.12fr]">
            <div>
              <h2 className="text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#101828] md:text-5xl">
                Clareza financeira para decisões que não podem esperar.
              </h2>
              <p className="mt-6 max-w-lg text-lg leading-8 text-[#475467]">
                Ideal para operações que precisam enxergar risco, priorizar ação e reduzir incerteza rapidamente.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {audiences.map((item) => (
                <div key={item} className="rounded-2xl border border-black/5 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
                  <p className="text-base font-medium leading-7 text-[#101828]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/5 bg-white px-4 py-16 md:px-8 md:py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionTag>Diferencial</SectionTag>
          <div className="mt-6 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <h2 className="text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#101828] md:text-5xl">
                A IronCore não entrega dados. Entrega interpretação.
              </h2>
              <p className="mt-6 max-w-lg text-lg leading-8 text-[#475467]">
                O valor está em transformar base financeira dispersa em leitura útil, rastreável e acionável.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {differentiators.map((item) => (
                <div key={item} className="rounded-2xl bg-[#F8FAFC] p-6">
                  <p className="text-base font-medium leading-7 text-[#101828]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8 md:py-24 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-[32px] border border-black/5 bg-[#0F172A] px-6 py-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] md:px-10 md:py-12">
          <SectionTag dark>Prova</SectionTag>
          <div className="mt-6 grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div>
              <h2 className="text-3xl font-semibold leading-tight tracking-[-0.03em] text-white md:text-5xl">
                Em testes recentes, a IronCore identificou:
              </h2>
              <p className="mt-6 max-w-lg text-lg leading-8 text-white/72">
                Casos abaixo usados como placeholder até entrada dos cases públicos. A seção já está preparada para receber prova comercial real.
              </p>
            </div>
            <div className="grid gap-4">
              {proofs.map((item, index) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">Achado {index + 1}</div>
                  <p className="mt-3 text-base font-medium leading-7 text-white">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="oferta" className="border-y border-black/5 bg-[#FCFCFD] px-4 py-16 md:px-8 md:py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionTag>Oferta</SectionTag>
          <div className="mt-6 grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch">
            <div>
              <h2 className="text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#101828] md:text-5xl">
                Diagnóstico Express
              </h2>
              <p className="mt-6 max-w-lg text-lg leading-8 text-[#475467]">
                Uma entrega objetiva para identificar rapidamente os riscos mais críticos da operação e orientar a próxima decisão.
              </p>
            </div>

            <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                {offerItems.map((item) => (
                  <div key={item} className="rounded-2xl bg-[#F8FAFC] p-5 text-sm font-medium leading-6 text-[#101828]">
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 border-t border-black/5 pt-8">
                <div className="text-sm uppercase tracking-[0.14em] text-[#98A2B3]">Investimento</div>
                <div className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#101828] md:text-5xl">
                  A partir de R$2.000
                </div>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[#667085] md:text-base">
                  Escopo ideal para uma primeira leitura executiva com foco em clareza, urgência e tomada de decisão.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8 md:py-24 lg:px-10">
        <div className="mx-auto max-w-5xl rounded-[32px] border border-black/5 bg-white px-6 py-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:px-10 md:py-14">
          <SectionTag>CTA final</SectionTag>
          <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#101828] md:text-5xl">
            Se sua operação precisa de clareza, não de mais dados:
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#475467] md:text-lg">
            Solicite o diagnóstico e receba uma leitura objetiva para decidir com mais segurança.
          </p>
          <div className="mt-10">
            <Link
              href={appPath("/login/")}
              className="inline-flex items-center justify-center rounded-xl bg-[#0F172A] px-8 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#111827]"
            >
              Solicitar diagnóstico IronCore
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
