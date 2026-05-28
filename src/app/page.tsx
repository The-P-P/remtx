import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { isClerkConfigured } from "@/lib/clerk-config";

const vantagens = [
  "Visão em tempo real da frota, locações, manutenção e financeiro em um só lugar.",
  "Menos retrabalho e menos erros com processos padronizados para a equipe.",
  "Melhor controle de caixa para proteger margem e aumentar lucro mensal.",
  "Histórico centralizado para facilitar decisões e reduzir riscos operacionais.",
];

const desvantagens = [
  "Exige disciplina inicial para manter cadastros e lançamentos organizados.",
  "A equipe pode precisar de alguns dias de adaptação ao novo processo.",
  "Sem dados atualizados, os relatórios perdem precisão e valor estratégico.",
];

const metricas = [
  { valor: "+35%", label: "mais previsibilidade financeira" },
  { valor: "-42%", label: "menos retrabalho operacional" },
  { valor: "24h", label: "visao ativa do negocio" },
];

export default async function HomePage() {
  if (isClerkConfigured()) {
    const { userId } = await auth();
    if (userId) {
      redirect("/dashboard");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-cyan-500/25 blur-3xl md:h-96 md:w-96" />
        <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-violet-500/25 blur-3xl md:h-[30rem] md:w-[30rem]" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-500/20 blur-3xl md:h-[32rem] md:w-[32rem]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),rgba(255,255,255,0))]" />
      </div>

      <section className="relative mx-auto w-full max-w-6xl px-4 pb-12 pt-10 md:px-8 md:pt-16">
        <div className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-10">
          <span className="inline-flex w-fit items-center rounded-full border border-cyan-300/35 bg-cyan-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
            REMTX | Plataforma Premium para Locadoras
          </span>

          <div className="mt-5 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <h1 className="max-w-4xl text-3xl font-black leading-tight md:text-6xl md:leading-[1.05]">
                O site que faz sua locadora parecer grande, organizada e
                lucrativa desde o primeiro clique.
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-200/90 md:text-lg">
                O REMTX centraliza frota, locacoes, contratos, manutencao e
                financeiro em uma experiencia visual moderna, elegante e
                confortavel. O empresario entende o negocio em segundos e toma
                decisoes com seguranca.
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href="/sign-in"
                  className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-400/30 transition duration-300 hover:-translate-y-0.5 hover:brightness-110"
                >
                  Entrar no sistema
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white/20"
                >
                  Criar conta agora
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-slate-900/65 p-5 shadow-inner shadow-black/40">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/90">
                Visao em tempo real
              </p>
              <div className="mt-4 space-y-3">
                {metricas.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <p className="text-2xl font-black text-white">{item.valor}</p>
                    <p className="mt-1 text-sm text-slate-300">{item.label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                O foco e simples: diminuir perda, aumentar controle e deixar o
                empresario no comando total da operacao.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto grid w-full max-w-6xl gap-5 px-4 pb-12 md:grid-cols-2 md:px-8">
        <article className="rounded-2xl border border-emerald-300/20 bg-gradient-to-br from-emerald-400/20 via-emerald-300/5 to-transparent p-6 shadow-xl shadow-emerald-950/30">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
            Perfil locatario
          </p>
          <h2 className="mt-3 text-2xl font-bold text-white">
            Experiencia clara para quem aluga
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-200/90">
            O cliente encontra contratos, valores, vencimentos e historico em
            um painel limpo e facil. Menos ruido no atendimento e mais confianca
            na relacao com a locadora.
          </p>
        </article>

        <article className="rounded-2xl border border-violet-300/20 bg-gradient-to-br from-violet-400/20 via-violet-300/5 to-transparent p-6 shadow-xl shadow-violet-950/30">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
            Perfil empresario
          </p>
          <h2 className="mt-3 text-2xl font-bold text-white">
            Controle que protege e multiplica lucro
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-200/90">
            O empresario acompanha frota, manutencoes, recebimentos e
            desempenho sem depender de planilhas espalhadas. Sem esse controle,
            o crescimento vira prejuizo escondido.
          </p>
        </article>
      </section>

      <section className="relative mx-auto grid w-full max-w-6xl gap-5 px-4 pb-12 md:grid-cols-2 md:px-8">
        <article className="rounded-2xl border border-cyan-300/20 bg-slate-900/60 p-6 shadow-xl shadow-cyan-900/20 backdrop-blur">
          <h2 className="text-2xl font-bold text-white">Vantagens do sistema</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-200/90">
            {vantagens.map((item) => (
              <li
                key={item}
                className="rounded-lg border border-white/10 bg-white/5 p-3"
              >
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-amber-300/20 bg-slate-900/60 p-6 shadow-xl shadow-amber-900/20 backdrop-blur">
          <h2 className="text-2xl font-bold text-white">Pontos de atencao</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-200/90">
            {desvantagens.map((item) => (
              <li
                key={item}
                className="rounded-lg border border-white/10 bg-white/5 p-3"
              >
                {item}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-4 pb-16 md:px-8">
        <div className="rounded-3xl border border-white/20 bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-fuchsia-500/20 p-6 shadow-2xl shadow-black/30 backdrop-blur md:p-10">
          <h2 className="max-w-4xl text-3xl font-black leading-tight text-white md:text-4xl">
            Empresario de locadora que trabalha no escuro paga caro todo mes.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-100/90 md:text-base">
            Com o REMTX, voce enxerga com clareza onde ganha, onde perde e onde
            acelerar. A plataforma foi desenhada para ser bonita, fluida e
            extremamente confortavel no uso diario da equipe.
          </p>
          <div className="flex flex-wrap gap-3 pt-6">
            <Link
              href="/sign-in"
              className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-900 shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-slate-100"
            >
              Acessar login
            </Link>
            <Link
              href="/sign-up"
              className="rounded-xl border border-white/35 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white/20"
            >
              Quero usar o REMTX
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
