import { z } from "zod";

export const createNightSchema = z.object({
  venueId: z.string().min(1, "Boliche requerido"),
  name: z.string().min(2, "Nombre demasiado corto").max(100, "Nombre demasiado largo"),
  date: z.string().min(1, "Fecha requerida"),
  responsibleUserId: z.string().optional(),
  openedAt: z.string().optional(),
  openNow: z.boolean().optional(),
  observations: z.string().max(500, "Maximo 500 caracteres").optional(),
});

export const updateNightStatusSchema = z.object({
  nightId: z.string().min(1, "Noche requerida"),
  status: z.enum(["PLANNED", "OPEN", "CLOSED", "AUDITED", "CANCELLED"]),
});

export type CreateNightInput = z.infer<typeof createNightSchema>;
export type UpdateNightStatusInput = z.infer<typeof updateNightStatusSchema>;
