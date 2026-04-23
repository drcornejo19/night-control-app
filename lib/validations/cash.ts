import { z } from "zod";

export const openCashSchema = z.object({
  nightId: z.string().min(1, "Noche requerida"),
  opening: z.coerce.number().min(0, "Monto inválido"),
});

export const closeCashSchema = z.object({
  cashBoxId: z.string().min(1),
  closing: z.coerce.number().min(0, "Monto inválido"),
});