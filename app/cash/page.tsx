import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { OpenCashForm } from "@/components/cash/open-cash-form";
import { CloseCashForm } from "@/components/cash/close-cash-form";

export default async function CashPage() {
  const [nights, cashBoxes] = await Promise.all([
    prisma.night.findMany({
      where: { status: "OPEN" },
    }),
    prisma.cashBox.findMany({
      include: {
        night: true,
        movements: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const current = cashBoxes[0];

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-3xl text-white">Caja</h1>

        {!current && <OpenCashForm nights={nights} />}

        {current && (
          <div>
            <p>Caja activa: {current.night.name}</p>

            <p>Apertura: {current.opening}</p>
            <p>Esperado: {current.expected ?? "-"}</p>
            <p>Cierre: {current.closing ?? "-"}</p>
            <p>Diferencia: {current.difference ?? "-"}</p>

            {!current.closing && <CloseCashForm cashBox={current} />}
          </div>
        )}
      </div>
    </AppShell>
  );
}