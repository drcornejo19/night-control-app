"use client";

import { Bell, ChevronDown, MoonStar } from "lucide-react";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="flex min-h-[84px] items-center justify-between gap-4 px-4 md:px-6 xl:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
              Boliche
            </p>
            <button className="mt-1 flex items-center gap-2 text-sm font-medium text-white">
              Black Club Palermo
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            </button>
          </div>

          <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#D4AF37]/70">
              Noche / Evento
            </p>
            <div className="mt-1 flex items-center gap-3">
              <button className="flex items-center gap-2 text-sm font-medium text-white">
                Sábado 18 Mayo
                <ChevronDown className="h-4 w-4 text-zinc-400" />
              </button>

              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                En curso
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-300 transition hover:bg-white/10 md:flex">
            <MoonStar className="h-5 w-5" />
          </button>

          <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-300 transition hover:bg-white/10">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#D4AF37]" />
          </button>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6A18] text-sm font-bold text-black">
              JP
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-white">Juan Perez</p>
              <p className="text-xs text-zinc-400">Gerente</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}