import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function Page() {
  return (
    <div className="grid min-h-screen bg-[#050505] text-white lg:grid-cols-[1fr_520px]">
      <section className="flex flex-col justify-between px-6 py-8 md:px-10">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[#D4AF37]/80">
            Night Control
          </p>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight md:text-6xl">
            Control operativo y financiero para cada jornada.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400">
            Login seguro para operar sedes, jornadas, caja, ventas y reportes.
          </p>
        </div>

        <div className="mt-10 rounded-3xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 p-5">
          <p className="text-sm font-medium text-[#D4AF37]">
            Si el login externo no carga en la preview local
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Podes entrar a vistas visuales sin autenticar. Son solo para
            revisar diseno y flujo, no modifican datos reales.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/preview/jornadas"
              className="inline-flex rounded-2xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
            >
              Ver jornadas
            </Link>
            <Link
              href="/preview/caja"
              className="inline-flex rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Ver caja
            </Link>
            <Link
              href="/preview/ventas"
              className="inline-flex rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Ver ventas
            </Link>
            <Link
              href="/preview/stock"
              className="inline-flex rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Ver stock
            </Link>
            <Link
              href="/preview/gastos"
              className="inline-flex rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Ver gastos
            </Link>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center border-l border-white/10 bg-black/40 p-6">
        <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
          <SignIn />
        </div>
      </section>
    </div>
  );
}
