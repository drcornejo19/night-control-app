"use server";

import { revalidatePath } from "next/cache";
import { StockMovementType } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getCurrentAppUser, requireRole } from "@/lib/auth";
import { permissions } from "@/lib/permissions";
import {
  createProductSchema,
  type CreateProductInput,
} from "@/lib/validations/products";

type ActionState =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function createProduct(
  input: CreateProductInput
): Promise<ActionState> {
  await requireRole(permissions.manageProducts);

  const parsed = createProductSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos invalidos",
    };
  }

  const { venueId, name, price, cost, initialStock, minStock } = parsed.data;
  const averageCost = cost ?? 0;
  const initialStockValue = initialStock * averageCost;

  const [venue, currentUser] = await Promise.all([
    prisma.venue.findUnique({
      where: { id: venueId },
    }),
    getCurrentAppUser(),
  ]);

  if (!venue) {
    return {
      ok: false,
      message: "La sede no existe",
    };
  }

  const existing = await prisma.product.findFirst({
    where: {
      venueId,
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });

  if (existing) {
    return {
      ok: false,
      message: "Ya existe un producto con ese nombre en esta sede",
    };
  }

  const dbUser = currentUser
    ? await prisma.user.findUnique({
        where: { clerkUserId: currentUser.clerkUserId },
        select: { id: true },
      })
    : null;

  await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        venueId,
        name,
        price,
        cost: cost ?? null,
      },
    });

    await tx.stock.create({
      data: {
        productId: product.id,
        quantity: initialStock,
        minStock,
        averageCost,
        stockValue: initialStockValue,
      },
    });

    if (initialStock > 0) {
      await tx.stockMovement.create({
        data: {
          venueId,
          productId: product.id,
          type: StockMovementType.INITIAL_STOCK,
          quantity: initialStock,
          unitCost: cost ?? null,
          note: "Stock inicial",
          createdById: dbUser?.id ?? null,
        },
      });
    }
  });

  revalidatePath("/products");
  revalidatePath("/stock");
  revalidatePath("/pos");
  revalidatePath("/dashboard");

  return {
    ok: true,
    message: "Producto creado correctamente",
  };
}
