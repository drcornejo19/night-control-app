import {
  BarChart3,
  Boxes,
  CalendarRange,
  CreditCard,
  LayoutDashboard,
  Receipt,
  Settings,
  ShoppingCart,
  Ticket,
  Wallet,
} from "lucide-react";

export const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Noches",
    href: "/nights",
    icon: CalendarRange,
  },
  {
    title: "Caja",
    href: "/cash",
    icon: Wallet,
  },
  {
    title: "Ventas",
    href: "/sales",
    icon: Receipt,
  },
  {
    title: "Entradas",
    href: "/tickets",
    icon: Ticket,
  },
  {
    title: "Stock",
    href: "/stock",
    icon: Boxes,
  },
  {
    title: "Compras",
    href: "/purchases",
    icon: ShoppingCart,
  },
  {
    title: "Gastos",
    href: "/expenses",
    icon: CreditCard,
  },
  {
    title: "Reportes",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Configuración",
    href: "/settings",
    icon: Settings,
  },
];