"use server";

import { revalidatePath } from "next/cache";
import { PurchasePaymentStatus, StockMovementType } from "@prisma/client";

import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { permissions } from "@/lib/permissions";
import {
  createPurchaseSchema,
  type CreatePurchaseInput,
} from "@/lib/validations/purchases";

type ActionState =
  | { ok: true; message: string }
  | { ok: false; message: string };

type AggregatedItem = {
  quantity: number;
  totalCost: number;
};

export async function createPurchase(
  input: CreatePurchaseInput
): Promise<ActionState> {
  const currentUser = await requireRole(permissions.purchasesCreate);

  const parsed = createPurchaseSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos invalidos",
    };
  }

  const { nightId, supplierId, items } = parsed.data;
  const aggregatedItems = items.reduce((map, item) => {
    const current = map.get(item.productId) ?? { quantity: 0, totalCost: 0 };
    current.quantity += item.quantity;
    current.totalCost += item.quantity * item.cost;
    map.set(item.productId, current);
    return map;
  }, new Map<string, AggregatedItem>());
  const productIds = Array.from(aggregatedItems.keys());

  const [supplier, products, dbUser] = await Promise.all([
    prisma.supplier.findUnique({
      where: { id: supplierId },
    }),
    prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      include: {
        stock: true,
      },
    }),
    prisma.user.findUnique({
      where: { clerkUserId: currentUser.clerkUserId },
      select: { id: true },
    }),
  ]);

  if (!supplier) {
    return {
      ok: false,
      message: "El proveedor no existe",
    };
  }

  const productMap = new Map(products.map((product) => [product.id, product]));

  for (const productId of productIds) {
    const product = productMap.get(productId);

    if (!product) {
      return {
        ok: false,
        message: "Uno de los productos no existe",
      };
    }

    if (product.venueId !== supplier.venueId) {
      return {
        ok: false,
        message: "La compra contiene productos de otra sede",
      };
    }
  }

  const total = items.reduce((acc, item) => acc + item.quantity * item.cost, 0);

  await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.create({
      data: {
        venueId: supplier.venueId,
        nightId: nightId || null,
        supplierId,
        total,
        paymentStatus: PurchasePaymentStatus.PENDING,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            cost: item.cost,
            unitCost: item.cost,
            total: item.quantity * item.cost,
          })),
        },
      },
    });

    for (const [productId, aggregate] of aggregatedItems.entries()) {
      const product = productMap.get(productId);

      if (!product) {
        throw new Error("Producto invalido al actualizar stock");
      }

      const purchaseUnitCost = aggregate.totalCost / aggregate.quantity;
      const currentQuantity = product.stock?.quantity ?? 0;
      const currentAverageCost =
        product.stock?.averageCost ?? product.cost ?? purchaseUnitCost;
      const nextQuantity = currentQuantity + aggregate.quantity;
      const nextAverageCost =
        (currentQuantity * currentAverageCost + aggregate.totalCost) /
        nextQuantity;
      const nextStockValue = nextQuantity * nextAverageCost;

      if (product.stock) {
        await tx.stock.update({
          where: {
            productId: product.id,
          },
          data: {
            quantity: nextQuantity,
            averageCost: nextAverageCost,
            stockValue: nextStockValue,
          },
        });
      } else {
        await tx.stock.create({
          data: {
            productId: product.id,
            quantity: nextQuantity,
            minStock: 0,
            averageCost: nextAverageCost,
            stockValue: nextStockValue,
          },
        });
      }

      await tx.product.update({
        where: { id: product.id },
        data: { cost: nextAverageCost },
      });

      await tx.stockMovement.create({
        data: {
          venueId: supplier.venueId,
          nightId: nightId || null,
          productId: product.id,
          createdById: dbUser?.id ?? null,
          type: StockMovementType.PURCHASE,
          quantity: aggregate.quantity,
          unitCost: purchaseUnitCost,
          note: `Compra ${purchase.id}`,
        },
      });
    }
  });

  revalidatePath("/purchases");
  revalidatePath("/products");
  revalidatePath("/stock");
  revalidatePath("/dashboard");

  return {
    ok: true,
    message: "Compra registrada correctamente",
  };
}
