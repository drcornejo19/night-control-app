import Link from "next/link";
import { ArrowRight, Martini, ShieldCheck, Wallet, BarChart3 } from "lucide-react";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.16),transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.45))]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]">
              <Martini className="h-7 w-7" />
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-[#D4AF37]/80">
                Night Control
              </p>
              <h1 className="text-xl font-semibold tracking-tight">
                Sistema de gestión para boliches
              </h1>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
          >
            Entrar al dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-12 py-16 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="inline-flex rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">
              Control total de tu noche
            </div>

            <h2 className="mt-8 max-w-4xl text-5xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
              Controlá ventas, caja, stock y rentabilidad
              <span className="text-[#D4AF37]"> en tiempo real</span>.
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
              Night Control es una plataforma premium para boliches y actividad
              nocturna, diseñada para centralizar toda la operación desde una
              sola interfaz clara, rápida y mobile-first.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#D4AF37] px-6 py-3.5 text-sm font-semibold text-black transition hover:brightness-110"
              >
                Ver sistema
                <ArrowRight className="h-4 w-4" />
              </Link>

              <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">
                Ver demo comercial
              </button>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <Wallet className="h-6 w-6 text-[#D4AF37]" />
                <h3 className="mt-4 text-lg font-semibold">Caja nocturna</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Apertura, cierre, diferencia y control de medios de pago.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <BarChart3 className="h-6 w-6 text-[#D4AF37]" />
                <h3 className="mt-4 text-lg font-semibold">Dashboard real</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Recaudación, gastos, ganancias y operación en vivo.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <ShieldCheck className="h-6 w-6 text-[#D4AF37]" />
                <h3 className="mt-4 text-lg font-semibold">Control premium</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Gestión multi-boliche pensada para nocturnidad real.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[36px] border border-[#D4AF37]/20 bg-gradient-to-br from-[#131313] to-[#080808] p-5 shadow-[0_0_0_1px_rgba(212,175,55,0.08)]">
              <div className="rounded-[30px] border border-white/10 bg-black/30 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                      Recaudación total
                    </p>
                    <h3 className="mt-3 text-4xl font-semibold tracking-tight text-white">
                      $4.350.000
                    </h3>
                  </div>

                  <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-3 py-2 text-sm font-semibold text-[#D4AF37]">
                    +18%
                  </div>
                </div>

                <div className="mt-8 h-48 rounded-[24px] border border-white/10 bg-[linear-gradient(to_bottom,rgba(212,175,55,0.10),transparent)]" />

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                      Ventas barra
                    </p>
                    <p className="mt-2 text-2xl font-semibold">$2.850.000</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                      Ganancia neta
                    </p>
                    <p className="mt-2 text-2xl font-semibold">$3.730.000</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 -left-6 hidden w-56 rounded-[28px] border border-white/10 bg-[#0B0B0B]/95 p-4 shadow-2xl md:block">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#D4AF37]/80">
                Noche abierta
              </p>
              <p className="mt-3 text-sm text-zinc-400">Desde 22:15 hs</p>
              <p className="mt-1 text-lg font-semibold text-white">
                Black Club Palermo
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}