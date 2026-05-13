import { z } from "zod";

export const createVenueSchema = z.object({
  name: z.string().min(2, "Nombre demasiado corto").max(120, "Nombre demasiado largo"),
  address: z.string().max(160, "MÃ¡ximo 160 caracteres").optional(),
  city: z.string().max(120, "MÃ¡ximo 120 caracteres").optional(),
  capacity: z.coerce.number().int().min(0, "Capacidad invÃ¡lida").optional(),
  businessType: z
    .enum(["BOLICHE", "BAR", "RESTAURANTE", "HAMBURGUESERIA", "EVENTO", "OTRO"])
    .default("BOLICHE"),
  timezone: z.string().min(1, "Timezone requerida").default("America/Argentina/Buenos_Aires"),
});

export type CreateVenueInput = z.infer<typeof createVenueSchema>;
