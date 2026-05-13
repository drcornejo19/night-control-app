import { z } from "zod";

const paymentMethods = ["CASH", "TRANSFER", "CARD", "QR", "OTHER"] as const;
const movementTypes = ["INCOME", "EXPENSE", "ADJUSTMENT"] as const;

export const openCashSchema = z.object({
  nightId: z.string().min(1, "Noche requerida"),
  opening: z.coerce.number().min(0, "Monto invalido"),
});

export const closeCashSchema = z.object({
  cashBoxId: z.string().min(1, "Caja requerida"),
  closing: z.coerce.number().min(0, "Monto invalido"),
});

export const createCashMovementSchema = z.object({
  cashBoxId: z.string().min(1, "Caja requerida"),
  type: z.enum(movementTypes),
  category: z.string().min(2, "Categoria requerida").max(60),
  amount: z.coerce.number().min(0.01, "Monto invalido"),
  method: z.enum(paymentMethods).optional(),
  note: z.string().max(220, "Maximo 220 caracteres").optional(),
});

export type OpenCashInput = z.input<typeof openCashSchema>;
export type CloseCashInput = z.input<typeof closeCashSchema>;
export type CreateCashMovementInput = z.input<
  typeof createCashMovementSchema
>;
