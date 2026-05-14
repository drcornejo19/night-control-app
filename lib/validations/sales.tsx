import { z } from "zod";

const paymentMethods = ["CASH", "TRANSFER", "CARD", "QR", "OTHER"] as const;
const saleTypes = ["BAR", "TICKET", "VIP", "TABLE", "DELIVERY", "OTHER"] as const;

export const saleItemSchema = z.object({
  productId: z.string().min(1, "Producto requerido"),
  quantity: z.coerce.number().int().positive("Cantidad invalida"),
});

export const createSaleSchema = z.object({
  nightId: z.string().min(1, "Noche requerida"),
  saleType: z.enum(saleTypes).default("BAR"),
  paymentMethod: z.enum(paymentMethods),
  discount: z.coerce.number().min(0, "Descuento invalido").default(0),
  items: z.array(saleItemSchema).min(1, "Agrega al menos un producto"),
});

export const createShiftSummarySchema = z
  .object({
    nightId: z.string().min(1, "Jornada requerida"),
    sector: z.string().min(2, "Sector requerido").max(60),
    cashSales: z.coerce.number().min(0, "Monto invalido").default(0),
    transferSales: z.coerce.number().min(0, "Monto invalido").default(0),
    cardSales: z.coerce.number().min(0, "Monto invalido").default(0),
    qrSales: z.coerce.number().min(0, "Monto invalido").default(0),
    observations: z.string().max(280, "Maximo 280 caracteres").optional(),
  })
  .refine(
    (data) =>
      data.cashSales + data.transferSales + data.cardSales + data.qrSales > 0,
    "Carga al menos un importe"
  );

export type CreateSaleInput = z.input<typeof createSaleSchema>;
export type CreateShiftSummaryInput = z.input<typeof createShiftSummarySchema>;
