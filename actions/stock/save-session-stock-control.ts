"use server";

import { revalidatePath } from "next/cache";
import { StockMovementType } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getCurrentAppUser, requireRole } from "@/lib/auth";
import { permissions } from "@/lib/permissions";
import {
  saveSessionStockControlSchema,
  type SaveSessionStockControlInput,
} from "@/lib/validations/stock";

type ActionState =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function saveSessionStockControl(
  input: SaveSessionStockControlInput
): Promise<ActionState> {
  await requireRole(permissions.manageProducts);

  const parsed = saveSessionStockControlSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos invalidos",
    };
  }

  const { nightId, productId, initialQuantity, finalQuantity } = parsed.data;

  const [night, product, saleItems, currentUser] = await Promise.all([
    prisma.night.findUnique({
      where: { id: nightId },
      select: { id: true, venueId: true, name: true },
    }),
    prisma.product.findUnique({
      where: { id: productId },
      include: { stock: true },
    }),
    prisma.saleItem.findMany({
      where: {
        productId,
        sale: {
          nightId,
        },
      },
      select: {
        quantity: true,
      },
    }),
    getCurrentAppUser(),
  ]);

  if (!night) {
    return { ok: false, message: "La jornada no existe" };
  }

  if (!product) {
    return { ok: false, message: "Producto no encontrado" };
  }

  if (product.venueId !== night.venueId) {
    return {
      ok: false,
      message: "El producto no pertenece a la sede de la jornada",
    };
  }

  const theoreticalConsumption = saleItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  );
  const realConsumption = initialQuantity - finalQuantity;
  const deviation = realConsumption - theoreticalConsumption;
  const averageCost = product.stock?.averageCost ?? product.cost ?? 0;
  const stockValueStart = initialQuantity * averageCost;
  const stockValueEnd = finalQuantity * averageCost;
  const currentQuantity = product.stock?.quantity ?? 0;
  const correctionDelta = finalQuantity - currentQuantity;

  const dbUser = currentUser
    ? await prisma.user.findUnique({
        where: { clerkUserId: currentUser.clerkUserId },
        select: { id: true },
      })
    : null;

  await prisma.$transaction(async (tx) => {
    await tx.sessionStockControl.upsert({
      where: {
        nightId_productId: {
          nightId,
          productId,
        },
      },
      create: {
        nightId,
        productId,
        initialQuantity,
        finalQuantity,
        theoreticalConsumption,
        realConsumption,
        deviation,
        stockValueStart,
        stockValueEnd,
      },
      update: {
        initialQuantity,
        finalQuantity,
        theoreticalConsumption,
        realConsumption,
        deviation,
        stockValueStart,
        stockValueEnd,
      },
    });

    if (product.stock) {
      await tx.stock.update({
        where: { productId },
        data: {
          quantity: finalQuantity,
          averageCost,
          stockValue: stockValueEnd,
        },
      });
    } else {
      await tx.stock.create({
        data: {
          productId,
          quantity: finalQuantity,
          minStock: 0,
          averageCost,
          stockValue: stockValueEnd,
        },
      });
    }

    await tx.stockMovement.create({
      data: {
        venueId: product.venueId,
        nightId,
        productId,
        createdById: dbUser?.id ?? null,
        type: StockMovementType.FINAL_STOCK,
        quantity: correctionDelta,
        unitCost: averageCost,
        note: `Conteo final ${finalQuantity}. Teorico ${theoreticalConsumption}. Desvio ${deviation}.`,
      },
    });
  });

  revalidatePath("/stock");
  revalidatePath(`/nights/${nightId}`);
  revalidatePath("/dashboard");

  return { ok: true, message: "Control de stock guardado" };
}
