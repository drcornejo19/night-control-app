import type { LucideIcon } from "lucide-react";
import {
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

import type { AppRole } from "@/lib/auth";

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
    roles: ["SUPER_ADMIN", "OWNER", "MANAGER"],
  },
  {
    title: "POS",
    href: "/pos",
    icon: ScanLine,
    roles: ["SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER", "BAR"],
  },
  {
    title: "Ventas",
    href: "/sales",
    icon: ShoppingBag,
    roles: ["SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER", "BAR"],
  },
  {
    title: "Gastos",
    href: "/expenses",
    icon: Receipt,
    roles: ["SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER"],
  },
  {
    title: "Caja",
    href: "/cash",
    icon: Wallet,
    roles: ["SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER"],
  },
  {
    title: "Productos",
    href: "/products",
    icon: PackagePlus,
    roles: ["SUPER_ADMIN", "OWNER", "MANAGER"],
  },
  {
    title: "Compras",
    href: "/purchases",
    icon: ShoppingCart,
    roles: ["SUPER_ADMIN", "OWNER", "MANAGER"],
  },
  {
    title: "Proveedores",
    href: "/suppliers",
    icon: Truck,
    roles: ["SUPER_ADMIN", "OWNER", "MANAGER"],
  },
  {
    title: "Noches",
    href: "/nights",
    icon: CalendarRange,
    roles: ["SUPER_ADMIN", "OWNER", "MANAGER"],
  },
  {
    title: "Boliches",
    href: "/venues",
    icon: Building2,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Usuarios",
    href: "/admin/users",
    icon: ShieldCheck,
    roles: ["SUPER_ADMIN", "OWNER"],
  },
];