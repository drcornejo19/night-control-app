import { z } from "zod";

export const createBreakEvenScenarioSchema = z.object({
  venueId: z.string().min(1, "Sede requerida"),
  nightId: z.string().optional(),
  name: z.string().min(2, "Nombre demasiado corto").max(90),
  fixedCosts: z.coerce.number().min(0, "Costo fijo invalido"),
  variableCosts: z.coerce.number().min(0, "Costo variable invalido"),
  expectedAverageTicket: z.coerce
    .number()
    .positive("Ticket promedio invalido"),
  expectedAttendees: z.coerce
    .number()
    .int("Cantidad invalida")
    .positive("Cantidad invalida"),
});

export type CreateBreakEvenScenarioInput = z.input<
  typeof createBreakEvenScenarioSchema
>;
