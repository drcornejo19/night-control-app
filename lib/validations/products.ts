import { z } from "zod";

export const createProductSchema = z.object({
  venueId: z.string().min(1, "Boliche requerido"),
  name: z.string().min(2, "Nombre demasiado corto").max(100, "Nombre demasiado largo"),
  price: z.coerce.number().positive("Precio inválido"),
  cost: z.coerce.number().min(0, "Costo inválido").optional(),
  initialStock: z.coerce.number().int().min(0, "Stock inicial inválido"),
  minStock: z.coerce.number().int().min(0, "Stock mínimo inválido"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;