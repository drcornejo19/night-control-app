import { z } from "zod";

export const createVenueSchema = z.object({
  name: z.string().min(2, "Nombre demasiado corto").max(120, "Nombre demasiado largo"),
  city: z.string().max(120, "Máx 120 caracteres").optional(),
});

export type CreateVenueInput = z.infer<typeof createVenueSchema>;