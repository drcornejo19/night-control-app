import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { PosClient } from "@/components/pos/pos-client";

export default async function PosPage() {
  const [products, nights] = await Promise.all([
    prisma.product.findMany({
      include: {
        stock: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.night.findMany({
      where: {
        status: "OPEN",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  const posProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    stock: product.stock?.quantity ?? 0,
  }));

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-[#D4AF37]/80">
            POS
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-white">
            Caja rápida
          </h1>
          <p className="mt-2 text-zinc-400">
            Registrá ventas en segundos con una interfaz operativa.
          </p>
        </div>

        <PosClient products={posProducts} nights={nights} />
      </div>
    </AppShell>
  );
}