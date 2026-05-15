import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  FileSpreadsheet,
  Layers3,
  Settings2,
  Sparkles,
} from "lucide-react";

import {
  accountFamilies,
  administrationKpis,
  administrationModules,
  administrationWorkbook,
  missingSystemPieces,
  mockupPrinciples,
} from "@/lib/finance/administration-blueprint";
import { formatNumber } from "@/lib/utils";

const accountCount = accountFamilies.reduce((acc, family) => acc + family.count, 0);
const kpiCount = administrationKpis.length;

export default function PreviewAdministracionPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al login
            </Link>
            <p className="mt-5 text-sm uppercase tracking-[0.28em] text-[#D4AF37]/80">
              Lectura del Excel
            </p>
            <h1 className="mt-2 text-4xl font-semibold md:text-5xl">
              Administracion inteligente
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 md:text-base">
              Esta vista traduce la administracion real del cliente en
              configuracion para Night Control: plan de cuentas, costos,
              indicadores, deuda, stock valorizado y reportes gerenciales.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <PreviewLink href="/preview/reportes">Ver reportes</PreviewLink>
            <PreviewLink href="/preview/equilibrio">Ver equilibrio</PreviewLink>
            <PreviewLink href="/preview/gastos">Ver gastos</PreviewLink>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Metric
            icon={FileSpreadsheet}
            label="Hojas detectadas"
            value={formatNumber(administrationWorkbook.sheets.length)}
            detail="Excel administrativo"
          />
          <Metric
            icon={Layers3}
            label="Cuentas mapeadas"
            value={formatNumber(accountCount)}
            detail="Plan de cuentas"
            tone="gold"
          />
          <Metric
            icon={Settings2}
            label="Secciones de fijos"
            value={formatNumber(administrationWorkbook.fixedCostSections.length)}
            detail="Proyectado vs real"
          />
          <Metric
            icon={Sparkles}
            label="KPIs base"
            value={formatNumber(kpiCount)}
            detail="Indicadores gerenciales"
            tone="green"
          />
          <Metric
            icon={ArrowRight}
            label="Proxima capa"
            value="SaaS"
            detail="Configurable por negocio"
            tone="gold"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Panel
            eyebrow="Arquitectura administrativa"
            title="Lo que el Excel ya esta haciendo"
          >
            <div className="grid gap-3 md:grid-cols-2">
              {administrationModules.map((module) => (
                <ModuleCard key={module.title} module={module} />
              ))}
            </div>
          </Panel>

          <Panel eyebrow="Mockup" title="Como se traduce a interfaz">
            <div className="space-y-3">
              {mockupPrinciples.map((principle) => {
                const Icon = principle.icon;

                return (
                  <article
                    key={principle.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-white">{principle.title}</p>
                        <p className="mt-1 text-sm leading-6 text-zinc-400">
                          {principle.description}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </Panel>
        </section>

        <Panel eyebrow="Plan de cuentas" title="Familias detectadas">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {accountFamilies.map((family) => (
              <article
                key={family.code}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#D4AF37]/80">
                      Cuenta {family.code}
                    </p>
                    <h3 className="mt-2 text-base font-semibold text-white">
                      {family.title}
                    </h3>
                  </div>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-zinc-300">
                    {family.count}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {family.description}
                </p>
                <div className="mt-4 rounded-2xl border border-[#D4AF37]/15 bg-[#D4AF37]/10 px-3 py-2 text-xs text-[#D4AF37]">
                  {family.systemModule}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {family.examples.slice(0, 4).map((example) => (
                    <span
                      key={example}
                      className="rounded-full bg-black/30 px-2.5 py-1 text-xs text-zinc-400"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Panel eyebrow="Indicadores" title="KPIs que deberia calcular">
            <div className="space-y-3">
              {administrationKpis.map((kpi) => (
                <KpiRow key={kpi.title} kpi={kpi} />
              ))}
            </div>
          </Panel>

          <Panel eyebrow="Brechas reales" title="Lo que falta sumar al sistema">
            <div className="grid gap-3 sm:grid-cols-2">
              {missingSystemPieces.map((piece) => {
                const Icon = piece.icon;

                return (
                  <article
                    key={piece.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <Icon className="h-5 w-5 text-[#D4AF37]" />
                    <h3 className="mt-3 font-semibold text-white">{piece.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {piece.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </Panel>
        </section>

        <section className="rounded-[28px] border border-[#D4AF37]/20 bg-gradient-to-br from-[#1B1407] to-[#080602] p-5">
          <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-[#D4AF37]/80">
                Decision de producto
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                La proxima etapa no es otra pantalla: es configuracion financiera.
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-300">
                Night Control tiene que permitir cargar el plan de cuentas de
                cada cliente y decidir que conceptos impactan en caja, stock,
                deuda, punto de equilibrio y resultado.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Decision label="Crear" value="FinancialAccount" />
              <Decision label="Asignar" value="Tipo de cuenta y modulo" />
              <Decision label="Comparar" value="Presupuesto vs real" />
              <Decision label="Mostrar" value="Economico vs financiero" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function PreviewLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/10"
    >
      {children}
    </Link>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
  tone = "zinc",
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail: string;
  tone?: "gold" | "green" | "zinc";
}) {
  const color =
    tone === "gold"
      ? "text-[#D4AF37]"
      : tone === "green"
        ? "text-emerald-400"
        : "text-zinc-300";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <Icon className={`h-5 w-5 ${color}`} />
      <p className="mt-3 text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{detail}</p>
    </div>
  );
}

function Panel({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#090909] p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-[#D4AF37]/70">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-semibold text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ModuleCard({ module }: { module: (typeof administrationModules)[number] }) {
  const Icon = module.icon;

  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <Icon className="h-5 w-5 text-[#D4AF37]" />
      <h3 className="mt-3 font-semibold text-white">{module.title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{module.description}</p>
      <div className="mt-4 space-y-2">
        {module.items.map((item) => (
          <div key={item} className="flex items-center gap-2 text-sm text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
            {item}
          </div>
        ))}
      </div>
    </article>
  );
}

function KpiRow({ kpi }: { kpi: (typeof administrationKpis)[number] }) {
  const toneClass =
    kpi.tone === "green"
      ? "text-emerald-400"
      : kpi.tone === "red"
        ? "text-red-300"
        : kpi.tone === "blue"
          ? "text-sky-300"
          : kpi.tone === "gold"
            ? "text-[#D4AF37]"
            : "text-zinc-300";

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className={`font-semibold ${toneClass}`}>{kpi.title}</h3>
          <p className="mt-1 text-sm text-zinc-400">{kpi.formula}</p>
        </div>
        <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs text-zinc-400">
          KPI
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-zinc-300">{kpi.systemUse}</p>
    </article>
  );
}

function Decision({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#D4AF37]/20 bg-black/20 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.22em] text-[#D4AF37]/70">
        {label}
      </p>
      <p className="mt-2 font-semibold text-white">{value}</p>
    </div>
  );
}
