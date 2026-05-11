import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { OpenCashForm } from "@/components/cash/open-cash-form";
import { CloseCashForm } from "@/components/cash/close-cash-form";
import { formatCurrency } from "@/lib/utils";
import { getActiveVenueId } from "@/lib/venues/active-venue";
import { VenueSwitcher } from "@/components/venues/venue-switcher";

export default async function CashPage() {
  const activeVenueId = await getActiveVenueId();

  const [venues, nights, cashBoxes] = await Promise.all([
    prisma.venue.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.night.findMany({
      where: {
        venueId: activeVenueId ?? undefined,
        status: "OPEN",
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.cashBox.findMany({
      where: {
        night: {
          venueId: activeVenueId ?? undefined,
        },
      },
      include: {
        night: true,
        movements: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const current = cashBoxes[0];

  const income = current
    ? current.movements
        .filter((movement) => movement.type === "INCOME")
        .reduce((acc, movement) => acc + movement.amount, 0)
    : 0;

  const expense = current
    ? current.movements
        .filter((movement) => movement.type === "EXPENSE")
        .reduce((acc, movement) => acc + movement.amount, 0)
    : 0;

  const calculatedExpected = current
    ? current.opening + income - expense
    : 0;

  const activeVenueName =
    venues.find((venue) => venue.id === activeVenueId)?.name ?? "Sin boliche";

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#D4AF37]/80">
              Caja
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-white">
              Caja del boliche
            </h1>
            <p className="mt-2 text-zinc-400">
              Apertura, movimientos y cierre de la caja activa.
            </p>
          </div>

          <VenueSwitcher venues={venues} activeVenueId={activeVenueId} />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Boliche activo</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {activeVenueName}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Ingresos</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {formatCurrency(income)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Egresos</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {formatCurrency(expense)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Esperado calculado</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {formatCurrency(calculatedExpected)}
            </p>
          </div>
        </div>

        {!current ? (
          <div className="rounded-[30px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#090909] p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Abrir caja
            </h2>
            <OpenCashForm nights={nights} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-[30px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#090909] p-6">
              <div className="grid gap-4 md:grid-cols-5">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-zinc-400">Noche</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {current.night.name}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-zinc-400">Apertura</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {formatCurrency(current.opening)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-zinc-400">Esperado</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {formatCurrency(current.expected ?? calculatedExpected)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-zinc-400">Cierre</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {current.closing !== null && current.closing !== undefined
                      ? formatCurrency(current.closing)
                      : "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-zinc-400">Diferencia</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {current.difference !== null &&
                    current.difference !== undefined
                      ? formatCurrency(current.difference)
                      : "-"}
                  </p>
                </div>
              </div>
            </div>

            {!current.closing && (
              <div className="rounded-[30px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#090909] p-6">
                <h2 className="mb-4 text-xl font-semibold text-white">
                  Cerrar caja
                </h2>
                <CloseCashForm cashBox={current} />
              </div>
            )}

            <div className="rounded-[30px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#090909] p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">
                Movimientos recientes
              </h2>

              <div className="space-y-3">
                {current.movements.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-zinc-400">
                    No hay movimientos registrados.
                  </div>
                ) : (
                  current.movements.map((movement) => (
                    <div
                      key={movement.id}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                    >
                      <div>
                        <p className="font-medium text-white">
                          {movement.type}
                        </p>
                        <p className="mt-1 text-sm text-zinc-400">
                          {movement.note || "Sin detalle"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-white">
                          {formatCurrency(movement.amount)}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {movement.method ?? "Sin método"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}