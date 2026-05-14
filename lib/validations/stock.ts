import { z } from "zod";

const stockMovementTypes = [
  "ADJUSTMENT",
  "WASTE",
  "INTERNAL_CONSUMPTION",
] as const;

export const createStockMovementSchema = z.object({
  productId: z.string().min(1, "Producto requerido"),
  nightId: z.string().optional(),
  type: z.enum(stockMovementTypes),
  quantity: z.coerce
    .number()
    .int("Cantidad invalida")
    .refine((value) => value !== 0, "Cantidad requerida"),
  unitCost: z.coerce.number().min(0, "Costo invalido").optional(),
  note: z.string().max(220, "Maximo 220 caracteres").optional(),
});

export const saveSessionStockControlSchema = z.object({
  nightId: z.string().min(1, "Jornada requerida"),
  productId: z.string().min(1, "Producto requerido"),
  initialQuantity: z.coerce.number().int().min(0, "Stock inicial invalido"),
  finalQuantity: z.coerce.number().int().min(0, "Stock final invalido"),
});

export type CreateStockMovementInput = z.input<
  typeof createStockMovementSchema
>;
export type SaveSessionStockControlInput = z.input<
  typeof saveSessionStockControlSchema
>;
