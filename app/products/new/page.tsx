import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { NewProductForm } from "@/components/products/new-product-form";

export default async function NewProductPage() {
  const venues = await prisma.venue.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-[#D4AF37]/80">
            Productos
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-white">
            Nuevo producto
          </h1>
          <p className="mt-2 text-zinc-400">
            Cargá productos reales para vender en el POS y controlar stock.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#131313] to-[#090909] p-6">
          <NewProductForm venues={venues} />
        </div>
      </div>
    </AppShell>
  );
}