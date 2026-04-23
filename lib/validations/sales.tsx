import { z } from "zod";

export const saleItemSchema = z.object({
  productId: z.string().min(1, "Producto requerido"),
  quantity: z.coerce.number().int().positive("Cantidad inválida"),
});

export const createSaleSchema = z.object({
  nightId: z.string().min(1, "Noche requerida"),
  paymentMethod: z.enum(["CASH", "TRANSFER", "CARD", "OTHER"]),
  items: z.array(saleItemSchema).min(1, "Agregá al menos un producto"),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;