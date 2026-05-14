import type { AppRole } from "@/lib/constants/roles";

const ownerRoles = ["SUPER_ADMIN", "OWNER"] satisfies AppRole[];
const managerRoles = [
  "SUPER_ADMIN",
  "OWNER",
  "MANAGER",
  "GERENTE",
  "ENCARGADO",
] satisfies AppRole[];

const operatorRoles = [
  "SUPER_ADMIN",
  "OWNER",
  "MANAGER",
  "GERENTE",
  "ENCARGADO",
  "CASHIER",
  "CAJERO",
] satisfies AppRole[];

const barRoles = [
  "SUPER_ADMIN",
  "OWNER",
  "MANAGER",
  "GERENTE",
  "ENCARGADO",
  "CASHIER",
  "CAJERO",
  "BAR",
  "BARRA",
] satisfies AppRole[];

export const permissions = {
  dashboard: [...managerRoles, "AUDITOR"] satisfies AppRole[],
  pos: barRoles,
  salesCreate: barRoles,
  expensesCreate: operatorRoles,
  manageCosts: managerRoles,
  manageBreakEven: managerRoles,
  purchasesCreate: managerRoles,
  cashOpenClose: operatorRoles,
  manageProducts: managerRoles,
  manageSuppliers: managerRoles,
  manageNights: managerRoles,
  manageVenues: ownerRoles,
  manageUsers: ownerRoles,
};
