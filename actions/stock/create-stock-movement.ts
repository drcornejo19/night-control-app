"use server";

import { revalidatePath } from "next/cache";
import { StockMovementType } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getCurrentAppUser, requireRole } from "@/lib/auth";
import { permissions } from "@/lib/permissions";
import {
  createStockMovementSchema,
  type CreateStockMovementInput,
} from "@/lib/validations/stock";

type ActionState =
  | { ok: true; message: string }
  | { ok: false; message: string };

function movementDelta(type: string, quantity: number) {
  if (type === "ADJUSTMENT") return quantity;
  return -Math.abs(quantity);
}

export async function createStockMovement(
  input: CreateStockMovementInput
): Promise<ActionState> {
  await requireRole(permissions.manageProducts);

  const parsed = createStockMovementSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos invalidos",
    };
  }

  const { productId, nightId, type, quantity, unitCost, note } = parsed.data;
  const delta = movementDelta(type, quantity);

  const [product, currentUser, night] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
      include: { stock: true },
    }),
    getCurrentAppUser(),
    nightId
      ? prisma.night.findUnique({
          where: { id: nightId },
          select: { id: true, venueId: true },
        })
      : Promise.resolve(null),
  ]);

  if (!product) {
    return { ok: false, message: "Producto no encontrado" };
  }

  if (nightId && !night) {
    return { ok: false, message: "La jornada no existe" };
  }

  if (night && night.venueId !== product.venueId) {
    return {
      ok: false,
      message: "La jornada no pertenece a la sede del producto",
    };
  }

  const currentQuantity = product.stock?.quantity ?? 0;
  const nextQuantity = currentQuantity + delta;

  if (nextQuantity < 0) {
    return { ok: false, message: "El movimiento deja stock negativo" };
  }

  const currentAverageCost =
    product.stock?.averageCost ?? product.cost ?? unitCost ?? 0;

  const nextAverageCost =
    delta > 0 && unitCost !== undefined
      ? (currentQuantity * currentAverageCost + delta * unitCost) / nextQuantity
      : currentAverageCost;

  const nextStockValue = nextQuantity * nextAverageCost;

  const dbUser = currentUser
    ? await prisma.user.findUnique({
        where: { clerkUserId: currentUser.clerkUserId },
        select: { id: true },
      })
    : null;

  await prisma.$transaction(async (tx) => {
    if (product.stock) {
      await tx.stock.update({
        where: { productId },
        data: {
          quantity: nextQuantity,
          averageCost: nextAverageCost,
          stockValue: nextStockValue,
        },
      });
    } else {
      await tx.stock.create({
        data: {
          productId,
          quantity: nextQuantity,
          minStock: 0,
          averageCost: nextAverageCost,
          stockValue: nextStockValue,
        },
      });
    }

    if (nextAverageCost > 0) {
      await tx.product.update({
        where: { id: productId },
        data: { cost: nextAverageCost },
      });
    }

    await tx.stockMovement.create({
      data: {
        venueId: product.venueId,
        nightId: nightId || null,
        productId,
        createdById: dbUser?.id ?? null,
        type: type as StockMovementType,
        quantity: delta,
        unitCost: unitCost ?? nextAverageCost,
        note: note || null,
      },
    });
  });

  revalidatePath("/stock");
  revalidatePath("/products");
  revalidatePath("/dashboard");

  return { ok: true, message: "Movimiento de stock registrado" };
}
