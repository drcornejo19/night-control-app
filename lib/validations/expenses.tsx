import { z } from "zod";

const paymentMethods = ["CASH", "TRANSFER", "CARD", "QR", "OTHER"] as const;
const expenseCategories = ["STAFF", "DJ", "SUPPLIER", "SERVICES", "OTHER"] as const;
const expenseCategoryTypes = [
  "FIXED",
  "VARIABLE",
  "OPERATIONAL",
  "EXTRAORDINARY",
] as const;
const fixedCostPeriodicities = ["DAILY", "WEEKLY", "MONTHLY"] as const;
const variableCostRelationTypes = [
  "PER_SESSION",
  "PER_SALE",
  "PER_ATTENDEE",
  "PER_PRODUCT",
  "OTHER",
] as const;

export const createExpenseSchema = z
  .object({
    venueId: z.string().optional(),
    nightId: z.string().optional(),
    expenseCategoryId: z.string().optional(),
    category: z.enum(expenseCategories).default("OTHER"),
    amount: z.coerce.number().positive("Monto invalido"),
    note: z.string().max(240, "Maximo 240 caracteres").optional(),
    paymentMethod: z.enum(paymentMethods).default("CASH"),
  })
  .refine((data) => data.venueId || data.nightId, {
    message: "Selecciona una sede o jornada",
    path: ["venueId"],
  });

export const createExpenseCategoryConfigSchema = z.object({
  venueId: z.string().min(1, "Sede requerida"),
  name: z.string().min(2, "Nombre demasiado corto").max(80),
  type: z.enum(expenseCategoryTypes).default("OPERATIONAL"),
});

export const createFixedCostSchema = z.object({
  venueId: z.string().min(1, "Sede requerida"),
  name: z.string().min(2, "Nombre demasiado corto").max(90),
  amount: z.coerce.number().positive("Monto invalido"),
  periodicity: z.enum(fixedCostPeriodicities).default("MONTHLY"),
  active: z.coerce.boolean().default(true),
});

export const createVariableCostSchema = z.object({
  venueId: z.string().min(1, "Sede requerida"),
  nightId: z.string().optional(),
  name: z.string().min(2, "Nombre demasiado corto").max(90),
  amount: z.coerce.number().positive("Monto invalido"),
  relationType: z.enum(variableCostRelationTypes).default("PER_SESSION"),
  active: z.coerce.boolean().default(true),
});

export type CreateExpenseInput = z.input<typeof createExpenseSchema>;
export type CreateExpenseCategoryConfigInput = z.input<
  typeof createExpenseCategoryConfigSchema
>;
export type CreateFixedCostInput = z.input<typeof createFixedCostSchema>;
export type CreateVariableCostInput = z.input<typeof createVariableCostSchema>;
