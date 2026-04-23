
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  createPurchaseSchema,
  type CreatePurchaseInput,
} from "@/lib/validations/purchases";

type ActionState =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function createPurchase(
  input: CreatePurchaseInput
): Promise<ActionState> {
  const parsed = createPurchaseSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { nightId, supplierId, items } = parsed.data;

  const productIds = items.map((item) => item.productId);

  const [supplier, products] = await Promise.all([
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
  ]);

  if (!supplier) {
    return {
      ok: false,
      message: "El proveedor no existe",
    };
  }

  const productMap = new Map(products.map((product) => [product.id, product]));

  for (const item of items) {
    const product = productMap.get(item.productId);

    if (!product) {
      return {
        ok: false,
        message: "Uno de los productos no existe",
      };
    }
  }

  const total = items.reduce((acc, item) => acc + item.quantity * item.cost, 0);

  await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.create({
      data: {
        nightId: nightId || null,
        supplierId,
        total,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            cost: item.cost,
          })),
        },
      },
    });

    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new Error("Producto inválido al actualizar stock");
      }

      if (product.stock) {
        await tx.stock.update({
          where: {
            productId: product.id,
          },
          data: {
            quantity: product.stock.quantity + item.quantity,
          },
        });
      } else {
        await tx.stock.create({
          data: {
            productId: product.id,
            quantity: item.quantity,
            minStock: 0,
          },
        });
      }

      await tx.stockMovement.create({
        data: {
          productId: product.id,
          quantity: item.quantity,
          note: `Compra ${purchase.id}`,
        },
      });
    }
  });

  revalidatePath("/purchases");
  revalidatePath("/stock");
  revalidatePath("/dashboard");

  return {
    ok: true,
    message: "Compra registrada correctamente",
  };
}