"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Martini, ChevronRight } from "lucide-react";

import { sidebarItems } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[280px] shrink-0 border-r border-white/10 bg-black/60 xl:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-white/10 px-6 py-6">
          <Link href="/dashboard" className="group block">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] transition group-hover:scale-[1.03]">
                <Martini className="h-7 w-7" />
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-[#D4AF37]/80">
                  Night Control
                </p>
                <h1 className="mt-1 text-xl font-semibold tracking-tight text-white">
                  Control total
                </h1>
                <p className="text-sm text-zinc-400">de tu noche</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="flex-1 px-4 py-6">
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center justify-between rounded-2xl border px-4 py-3.5 transition-all duration-200",
                    isActive
                      ? "border-[#D4AF37]/30 bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/5 text-white shadow-[0_0_0_1px_rgba(212,175,55,0.12)]"
                      : "border-transparent bg-transparent text-zinc-400 hover:border-white/10 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl transition",
                        isActive
                          ? "bg-[#D4AF37]/15 text-[#D4AF37]"
                          : "bg-white/5 text-zinc-400 group-hover:text-white"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>

                    <span className="text-sm font-medium">{item.title}</span>
                  </div>

                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition",
                      isActive
                        ? "text-[#D4AF37]"
                        : "text-zinc-600 group-hover:text-zinc-300"
                    )}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-3xl border border-[#D4AF37]/20 bg-gradient-to-br from-[#1B1407] to-[#0D0A04] p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-[#D4AF37]/75">
              Noche activa
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <p className="text-sm text-zinc-400">Boliche</p>
                <p className="text-base font-semibold text-white">
                  Black Club Palermo
                </p>
              </div>

              <div>
                <p className="text-sm text-zinc-400">Evento</p>
                <p className="text-base font-semibold text-white">
                  Sábado Principal
                </p>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-[#D4AF37]/20 bg-black/20 px-3 py-2">
                <span className="text-sm text-zinc-300">Estado</span>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                  En curso
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}