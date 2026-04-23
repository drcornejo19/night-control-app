import { z } from "zod";

export const createSupplierSchema = z.object({
  venueId: z.string().min(1, "Boliche requerido"),
  name: z.string().min(2, "Nombre demasiado corto").max(100, "Nombre demasiado largo"),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;