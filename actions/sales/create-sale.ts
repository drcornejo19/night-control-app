"use server";

import { revalidatePath } from "next/cache";
import {
  MovementType,
  PaymentMethod,
  Prisma,
  SaleType,
  StockMovementType,
} from "@prisma/client";

import { prisma } from "@/lib/db";
import {
  createSaleSchema,
  type CreateSaleInput,
} from "@/lib/validations/sales";

type ActionState =
  | { ok: true; message: string }
  | { ok: false; message: string };

type NightWithCashBox = Prisma.NightGetPayload<{
  include: { cashBox: true };
}>;

type ProductWithStock = Prisma.ProductGetPayload<{
  include: { stock: true };
}>;

export async function createSale(
  input: CreateSaleInput
): Promise<ActionState> {
  const parsed = createSaleSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos invÃ¡lidos",
    };
  }

  const { nightId, paymentMethod, items } = parsed.data;

  const productIds = items.map((item) => item.productId);

  const [nightRaw, productsRaw] = await Promise.all([
    prisma.night.findUnique({
      where: { id: nightId },
      include: { cashBox: true },
    }),
    prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: {
        stock: true,
      },
    }),
  ]);

  const night = nightRaw as NightWithCashBox | null;
  const products = productsRaw as ProductWithStock[];

  if (!night) {
    return { ok: false, message: "La noche no existe" };
  }

  const productMap = new Map<string, ProductWithStock>(
    products.map((product) => [product.id, product])
  );

  let total = 0;

  for (const item of items) {
    const product = productMap.get(item.productId);

    if (!product) {
      return {
        ok: false,
        message: "Uno de los productos no existe",
      };
    }

    const stock = product.stock;

    if (!stock) {
      return {
        ok: false,
        message: `El producto ${product.name} no tiene stock cargado`,
      };
    }

    if (stock.quantity < item.quantity) {
      return {
        ok: false,
        message: `Stock insuficiente para ${product.name}`,
      };
    }

    total += product.price * item.quantity;
  }

  await prisma.$transaction(async (tx) => {
    const createdSale = await tx.sale.create({
      data: {
        venueId: night.venueId,
        nightId,
        type: SaleType.BAR,
        subtotal: total,
        total,
        items: {
          create: items.map((item) => {
            const product = productMap.get(item.productId);

            if (!product) {
              throw new Error("Producto invÃ¡lido al crear la venta");
            }

            return {
              productId: item.productId,
              quantity: item.quantity,
              price: product.price,
              unitCost: product.cost ?? null,
              total: product.price * item.quantity,
              grossProfit:
                product.cost !== null && product.cost !== undefined
                  ? (product.price - product.cost) * item.quantity
                  : null,
            };
          }),
        },
        payments: {
          create: [
            {
              method: paymentMethod as PaymentMethod,
              amount: total,
            },
          ],
        },
      },
    });

    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new Error("Producto invÃ¡lido al actualizar stock");
      }

      const stock = product.stock;

      if (!stock) {
        throw new Error(`El producto ${product.name} no tiene stock`);
      }

      await tx.stock.update({
        where: {
          productId: product.id,
        },
        data: {
          quantity: stock.quantity - item.quantity,
        },
      });

      await tx.stockMovement.create({
        data: {
          venueId: night.venueId,
          nightId,
          productId: product.id,
          type: StockMovementType.SALE,
          quantity: -item.quantity,
          unitCost: product.cost ?? null,
          note: `Venta ${createdSale.id}`,
        },
      });
    }

    if (night.cashBox) {
      await tx.cashMovement.create({
        data: {
          cashBoxId: night.cashBox.id,
          type: MovementType.INCOME,
          category: "SALE",
          amount: total,
          method: paymentMethod as PaymentMethod,
          note: `Ingreso por venta ${createdSale.id}`,
        },
      });
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/sales");
  revalidatePath("/stock");
  revalidatePath("/cash");

  return {
    ok: true,
    message: "Venta registrada correctamente",
  };
}
