import { z } from "zod";

export const createExpenseSchema = z.object({
  nightId: z.string().min(1, "Noche requerida"),
  category: z.enum(["STAFF", "DJ", "SUPPLIER", "SERVICES", "OTHER"]),
  amount: z.coerce.number().positive("Monto invÃ¡lido"),
  note: z.string().max(200, "MÃ¡ximo 200 caracteres").optional(),
  paymentMethod: z.enum(["CASH", "TRANSFER", "CARD", "QR", "OTHER"]),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
