import { z } from "zod";

export const createExpenseSchema = z.object({
  nightId: z.string().min(1, "Noche requerida"),
  category: z.enum(["STAFF", "DJ", "SUPPLIER", "SERVICES", "OTHER"]),
  amount: z.coerce.number().positive("Monto inválido"),
  note: z.string().max(200, "Máximo 200 caracteres").optional(),
  paymentMethod: z.enum(["CASH", "TRANSFER", "CARD", "OTHER"]),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;