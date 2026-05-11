import type { AppRole } from "@/lib/auth";

export const permissions = {
  dashboard: ["SUPER_ADMIN", "OWNER", "MANAGER"] satisfies AppRole[],
  pos: ["SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER", "BAR"] satisfies AppRole[],
  salesCreate: ["SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER", "BAR"] satisfies AppRole[],
  expensesCreate: ["SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER"] satisfies AppRole[],
  purchasesCreate: ["SUPER_ADMIN", "OWNER", "MANAGER"] satisfies AppRole[],
  cashOpenClose: ["SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER"] satisfies AppRole[],
  manageProducts: ["SUPER_ADMIN", "OWNER", "MANAGER"] satisfies AppRole[],
  manageSuppliers: ["SUPER_ADMIN", "OWNER", "MANAGER"] satisfies AppRole[],
  manageNights: ["SUPER_ADMIN", "OWNER", "MANAGER"] satisfies AppRole[],
  manageVenues: ["SUPER_ADMIN"] satisfies AppRole[],
  manageUsers: ["SUPER_ADMIN", "OWNER"] satisfies AppRole[],
};