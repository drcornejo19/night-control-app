import { z } from "zod";

export const createNightSchema = z.object({
  venueId: z.string().min(1, "Boliche requerido"),
  name: z.string().min(2, "Nombre demasiado corto").max(100, "Nombre demasiado largo"),
  date: z.string().min(1, "Fecha requerida"),
  openedAt: z.string().optional(),
});

export const updateNightStatusSchema = z.object({
  nightId: z.string().min(1, "Noche requerida"),
  status: z.enum(["OPEN", "CLOSED", "CANCELLED"]),
});

export type CreateNightInput = z.infer<typeof createNightSchema>;
export type UpdateNightStatusInput = z.infer<typeof updateNightStatusSchema>;