import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  CalendarRange,
  LayoutDashboard,
  PackagePlus,
  Receipt,
  ScanLine,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Wallet,
  Building2,
  ShoppingBag,
} from "lucide-react";

import type { AppRole } from "@/lib/constants/roles";

const managerRoles = [
  "SUPER_ADMIN",
  "OWNER",
  "MANAGER",
  "GERENTE",
  "ENCARGADO",
] satisfies AppRole[];

const operatorRoles = [
  ...managerRoles,
  "CASHIER",
  "CAJERO",
] satisfies AppRole[];

const barRoles = [
  ...operatorRoles,
  "BAR",
  "BARRA",
] satisfies AppRole[];

export type NavigationItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: AppRole[];
};

export const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: [...managerRoles, "AUDITOR"],
  },
  {
    title: "POS",
    href: "/pos",
    icon: ScanLine,
    roles: barRoles,
  },
  {
    title: "Ventas",
    href: "/sales",
    icon: ShoppingBag,
    roles: barRoles,
  },
  {
    title: "Gastos",
    href: "/expenses",
    icon: Receipt,
    roles: operatorRoles,
  },
  {
    title: "Caja",
    href: "/cash",
    icon: Wallet,
    roles: operatorRoles,
  },
  {
    title: "Productos",
    href: "/products",
    icon: PackagePlus,
    roles: managerRoles,
  },
  {
    title: "Stock",
    href: "/stock",
    icon: Boxes,
    roles: managerRoles,
  },
  {
    title: "Compras",
    href: "/purchases",
    icon: ShoppingCart,
    roles: managerRoles,
  },
  {
    title: "Proveedores",
    href: "/suppliers",
    icon: Truck,
    roles: managerRoles,
  },
  {
    title: "Noches",
    href: "/nights",
    icon: CalendarRange,
    roles: managerRoles,
  },
  {
    title: "Boliches",
    href: "/venues",
    icon: Building2,
    roles: ["SUPER_ADMIN", "OWNER"],
  },
  {
    title: "Usuarios",
    href: "/admin/users",
    icon: ShieldCheck,
    roles: ["SUPER_ADMIN", "OWNER"],
  },
];

export const sidebarItems = navigationItems;
