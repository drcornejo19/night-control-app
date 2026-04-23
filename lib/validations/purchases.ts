import { z } from "zod";

export const purchaseItemSchema = z.object({
  productId: z.string().min(1, "Producto requerido"),
  quantity: z.coerce.number().int().positive("Cantidad inválida"),
  cost: z.coerce.number().positive("Costo inválido"),
});

export const createPurchaseSchema = z.object({
  nightId: z.string().optional(),
  supplierId: z.string().min(1, "Proveedor requerido"),
  items: z.array(purchaseItemSchema).min(1, "Agregá al menos un producto"),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;