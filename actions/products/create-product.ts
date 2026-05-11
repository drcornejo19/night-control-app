"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
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
  const parsed = createProductSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { venueId, name, price, cost, initialStock, minStock } = parsed.data;

  const venue = await prisma.venue.findUnique({
    where: { id: venueId },
  });

  if (!venue) {
    return {
      ok: false,
      message: "El boliche no existe",
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
      message: "Ya existe un producto con ese nombre en este boliche",
    };
  }

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
      },
    });

    if (initialStock > 0) {
      await tx.stockMovement.create({
        data: {
          productId: product.id,
          quantity: initialStock,
          note: "Stock inicial",
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