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
import { getCurrentAppUser, requireRole } from "@/lib/auth";
import { permissions } from "@/lib/permissions";
import {
  createSaleSchema,
  type CreateSaleInput,
} from "@/lib/validations/sales";

type ActionState =
  | { ok: true; message: string; saleId?: string }
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
  await requireRole(permissions.salesCreate);

  const parsed = createSaleSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos invalidos",
    };
  }

  const { nightId, saleType, paymentMethod, discount, items } = parsed.data;
  const normalizedItems = Array.from(
    items
      .filter((item) => item.productId && item.quantity > 0)
      .reduce((map, item) => {
        map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity);
        return map;
      }, new Map<string, number>())
      .entries()
  ).map(([productId, quantity]) => ({ productId, quantity }));

  if (normalizedItems.length === 0) {
    return { ok: false, message: "Agrega al menos un producto" };
  }

  const productIds = normalizedItems.map((item) => item.productId);

  const [nightRaw, productsRaw, currentUser] = await Promise.all([
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
    getCurrentAppUser(),
  ]);

  const night = nightRaw as NightWithCashBox | null;
  const products = productsRaw as ProductWithStock[];

  if (!night) {
    return { ok: false, message: "La jornada no existe" };
  }

  if (night.status !== "OPEN") {
    return {
      ok: false,
      message: "Solo se pueden registrar ventas en jornadas abiertas",
    };
  }

  const dbUser = currentUser
    ? await prisma.user.findUnique({
        where: { clerkUserId: currentUser.clerkUserId },
        select: { id: true },
      })
    : null;

  const productMap = new Map<string, ProductWithStock>(
    products.map((product) => [product.id, product])
  );

  let subtotal = 0;

  for (const item of normalizedItems) {
    const product = productMap.get(item.productId);

    if (!product) {
      return {
        ok: false,
        message: "Uno de los productos no existe",
      };
    }

    if (!product.active) {
      return {
        ok: false,
        message: `El producto ${product.name} no esta activo`,
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

    const unitPrice = product.salePrice ?? product.price;
    subtotal += unitPrice * item.quantity;
  }

  const safeDiscount = Math.min(discount, subtotal);
  const total = subtotal - safeDiscount;

  const createdSale = await prisma.$transaction(async (tx) => {
    const sale = await tx.sale.create({
      data: {
        venueId: night.venueId,
        nightId,
        userId: dbUser?.id ?? null,
        type: saleType as SaleType,
        subtotal,
        discount: safeDiscount,
        total,
        items: {
          create: normalizedItems.map((item) => {
            const product = productMap.get(item.productId);

            if (!product) {
              throw new Error("Producto invalido al crear la venta");
            }

            const unitPrice = product.salePrice ?? product.price;
            const unitCost = product.cost ?? null;

            return {
              productId: item.productId,
              quantity: item.quantity,
              price: unitPrice,
              unitCost,
              total: unitPrice * item.quantity,
              grossProfit:
                unitCost !== null
                  ? (unitPrice - unitCost) * item.quantity
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

    for (const item of normalizedItems) {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new Error("Producto invalido al actualizar stock");
      }

      await tx.stock.update({
        where: {
          productId: product.id,
        },
        data: {
          quantity: {
            decrement: item.quantity,
          },
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
          note: `Venta ${sale.id}`,
          createdById: dbUser?.id ?? null,
        },
      });
    }

    if (night.cashBox?.status === "OPEN" && total > 0) {
      await tx.cashMovement.create({
        data: {
          cashBoxId: night.cashBox.id,
          userId: dbUser?.id ?? null,
          type: MovementType.INCOME,
          category: `Venta ${saleType}`,
          amount: total,
          method: paymentMethod as PaymentMethod,
          note: `Ingreso por venta ${sale.id}`,
        },
      });
    }

    return sale;
  });

  revalidatePath("/dashboard");
  revalidatePath("/sales");
  revalidatePath("/sales/new");
  revalidatePath("/stock");
  revalidatePath("/cash");
  revalidatePath(`/nights/${nightId}`);

  return {
    ok: true,
    message: "Venta registrada correctamente",
    saleId: createdSale.id,
  };
}
