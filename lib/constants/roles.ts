export const appRoles = [
  "SUPER_ADMIN",
  "OWNER",
  "MANAGER",
  "CASHIER",
  "BAR",
  "SECURITY",
  "GERENTE",
  "ENCARGADO",
  "CAJERO",
  "BARRA",
  "SEGURIDAD",
  "AUDITOR",
] as const;

export type AppRole = (typeof appRoles)[number];

export const roleLabels: Record<AppRole, string> = {
  SUPER_ADMIN: "Administrador general",
  OWNER: "DueÃ±o",
  MANAGER: "Gerente",
  CASHIER: "Cajero",
  BAR: "Barra",
  SECURITY: "Seguridad",
  GERENTE: "Gerente",
  ENCARGADO: "Encargado",
  CAJERO: "Cajero",
  BARRA: "Barra",
  SEGURIDAD: "Seguridad",
  AUDITOR: "Auditor",
};

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && appRoles.includes(value as AppRole);
}
