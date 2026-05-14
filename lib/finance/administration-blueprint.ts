import {
  AlertTriangle,
  BadgeDollarSign,
  BarChart3,
  Boxes,
  Building2,
  ClipboardList,
  CreditCard,
  Landmark,
  LineChart,
  LucideIcon,
  Receipt,
  Scale,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

export type AdminAccountFamily = {
  code: string;
  title: string;
  description: string;
  count: number;
  examples: string[];
  systemModule: string;
};

export type AdminKpi = {
  title: string;
  formula: string;
  systemUse: string;
  tone: "gold" | "green" | "red" | "blue" | "zinc";
};

export type AdminModule = {
  title: string;
  description: string;
  icon: LucideIcon;
  items: string[];
};

export const administrationWorkbook = {
  fileName: "Administracion Bottom Guemes Marzo.xlsx",
  sheets: [
    "B1-CFP",
    "B2-CFL",
    "B3 Semana 1 a 5",
    "B4 estado de Deuda",
    "B7 R. Mensual",
    "Indicadores",
    "B9-CCS",
    "Desplegables",
  ],
  paymentMethods: ["Efectivo", "MP", "Fidelius", "Otros"],
  fixedCostSections: [
    "Propiedad",
    "Servicios",
    "Tecnica",
    "Impuestos actividad",
    "Sueldos / honorarios",
    "Otros",
  ],
};

export const accountFamilies: AdminAccountFamily[] = [
  {
    code: "1",
    title: "Caja, bancos e ingresos",
    description: "Medios de cobro, caja chica, ticketera, senas e inversiones.",
    count: 16,
    examples: [
      "Efectivo pesos",
      "Mercado Pago",
      "BIND",
      "Fidelius",
      "Ticketera",
      "Caja chica",
    ],
    systemModule: "Caja + medios de pago + ingresos",
  },
  {
    code: "2",
    title: "Proveedores",
    description: "Bebida, alimentos, limpieza y otros proveedores operativos.",
    count: 73,
    examples: [
      "Quilmes",
      "Mosto",
      "Speed",
      "Dilcor",
      "Pollos",
      "Limpieza",
    ],
    systemModule: "Compras + proveedores + deuda",
  },
  {
    code: "3",
    title: "Propiedad y servicios",
    description: "Alquiler, impuestos de propiedad, expensas, luz, agua, gas e internet.",
    count: 25,
    examples: [
      "Alquiler",
      "IVA alquiler",
      "EPEC",
      "Agua",
      "Gas",
      "Internet",
    ],
    systemModule: "Costos fijos prorrateados",
  },
  {
    code: "4",
    title: "Personal",
    description: "Sueldos, cargas, seguros, encargados y personal de operacion.",
    count: 21,
    examples: [
      "Gerente general",
      "Encargado",
      "Seguridad social",
      "Seguros",
      "Limpieza interna",
    ],
    systemModule: "Costos fijos/variables + jornada",
  },
  {
    code: "5",
    title: "Impuestos, tasas y canones",
    description: "IVA, ganancias, IIBB, comercio e industria, SADAIC y AADI CAPIF.",
    count: 23,
    examples: ["IVA", "Ganancias", "IIBB", "CII", "SADAIC", "AADI CAPIF"],
    systemModule: "Gastos + estimaciones fiscales",
  },
  {
    code: "7",
    title: "Atraccion y marketing",
    description: "RRPP, premios, mesas, pautas, embajadoras, promotoras y grafica.",
    count: 9,
    examples: ["RRPP comision", "RRPP premios", "Mesas", "Pautas", "Grafica"],
    systemModule: "Costos variables + CAC operativo",
  },
  {
    code: "8/9/10",
    title: "Activos, insumos y servicios externos",
    description: "Equipamiento, vajilla, uniformes, obras, legales, contables y auditoria.",
    count: 42,
    examples: ["Heladeras", "Sonido", "Luces", "Uniformes", "Auditoria", "Diseno"],
    systemModule: "Compras + gastos + activos",
  },
  {
    code: "13/14/15",
    title: "Stock, resultados y deuda",
    description: "Stock valorizado, resultado economico, resultado financiero y deuda.",
    count: 6,
    examples: [
      "Variacion de stock",
      "Stock valorizado",
      "Resultado economico",
      "Resultado financiero",
      "Pago de deuda",
    ],
    systemModule: "Reportes gerenciales",
  },
];

export const administrationModules: AdminModule[] = [
  {
    title: "Plan de cuentas",
    description: "La planilla ya organiza el negocio por cuentas numeradas.",
    icon: ClipboardList,
    items: [
      "Cuenta mayor y subcuentas",
      "Categoria operativa",
      "Tipo: ingreso, gasto, deuda, activo o stock",
      "Modulo destino dentro del sistema",
    ],
  },
  {
    title: "Costos fijos",
    description: "Existe una separacion clara entre proyectado y liquidado.",
    icon: Landmark,
    items: [
      "Monto proyectado mensual",
      "Fecha y monto pagado",
      "Medio de pago",
      "Prorrateo diario/semanal/mensual",
    ],
  },
  {
    title: "Operacion semanal",
    description: "Cada semana combina ingresos, proveedores, gastos y resultado.",
    icon: BarChart3,
    items: [
      "Facturacion por dia",
      "Costos nocturnos",
      "Proveedores y saldos",
      "Resultado semanal",
    ],
  },
  {
    title: "Indicadores",
    description: "La hoja de indicadores define los KPIs gerenciales que debe mostrar Night Control.",
    icon: LineChart,
    items: [
      "Costo de bebida",
      "Costo de comida",
      "Per capita",
      "Costo de atraccion",
    ],
  },
  {
    title: "Deuda y socios",
    description: "Hay control financiero fuera de la operacion diaria.",
    icon: Users,
    items: [
      "Estado de deuda",
      "Cuenta de socios",
      "Adelantos de utilidad",
      "Resultado financiero",
    ],
  },
  {
    title: "Stock valorizado",
    description: "El stock no es solo cantidad, tambien impacta el resultado economico.",
    icon: Boxes,
    items: [
      "Stock inicial/final",
      "Variacion de stock",
      "Costo de reposicion",
      "Resultado con ajuste de inventario",
    ],
  },
];

export const administrationKpis: AdminKpi[] = [
  {
    title: "Costo de bebida",
    formula: "Costo bebida despachada / venta total de bebidas",
    systemUse: "Detecta mermas, consumos internos y regalos fuera de margen.",
    tone: "gold",
  },
  {
    title: "Costo de comida",
    formula: "Costo comida despachada / venta total de comida",
    systemUse: "Mide margen real de cocina o alimentos.",
    tone: "gold",
  },
  {
    title: "Incidencia de cuentas corrientes",
    formula: "Costo CC bebida / costo bebida despachada",
    systemUse: "Mide el peso de consumos no cobrados sobre la barra.",
    tone: "red",
  },
  {
    title: "Costo de atraccion",
    formula: "RRPP + premios + marketing / facturacion o asistentes",
    systemUse: "Permite saber cuanto cuesta traer publico.",
    tone: "blue",
  },
  {
    title: "Costo capital humano",
    formula: "Personal operativo / facturacion semanal",
    systemUse: "Controla peso de staff fijo y eventual.",
    tone: "zinc",
  },
  {
    title: "Per capita",
    formula: "Facturacion / personas totales",
    systemUse: "Ticket promedio real por asistente o cliente.",
    tone: "green",
  },
  {
    title: "Punto de equilibrio",
    formula: "Costos fijos / ratio de margen de contribucion",
    systemUse: "Define cuanto necesita vender la jornada para empatar.",
    tone: "gold",
  },
  {
    title: "Resultado economico",
    formula: "Resultado operativo +/- variacion de stock",
    systemUse: "Separa utilidad real de caja momentanea.",
    tone: "green",
  },
];

export const missingSystemPieces = [
  {
    title: "Modelo de cuenta contable",
    description:
      "Falta una entidad para guardar codigo, nombre, tipo, familia y modulo destino.",
    icon: ClipboardList,
  },
  {
    title: "Presupuesto vs real",
    description:
      "El Excel compara costos proyectados y liquidados. Conviene llevar eso a reportes.",
    icon: Target,
  },
  {
    title: "Deuda por proveedor",
    description:
      "Compras necesita saldos, vencimientos, pagos parciales e historial.",
    icon: Receipt,
  },
  {
    title: "Resultado economico vs financiero",
    description:
      "Caja no siempre es rentabilidad. Hay que separar flujo, deuda y stock.",
    icon: Scale,
  },
  {
    title: "Cuentas de socios",
    description:
      "Para negocios con socios, falta registrar adelantos, retiros y distribucion.",
    icon: Users,
  },
  {
    title: "Templates por tipo de negocio",
    description:
      "Boliche, bar, restaurante y local deberian activar cuentas y KPIs distintos.",
    icon: Building2,
  },
];

export const mockupPrinciples = [
  {
    title: "Primer golpe visual",
    description: "KPIs grandes arriba, negro/dorado, estado operativo claro.",
    icon: BadgeDollarSign,
  },
  {
    title: "Mobile owner view",
    description: "El dueno debe entender caja, ventas y alertas en 20 segundos.",
    icon: Wallet,
  },
  {
    title: "Control por alertas",
    description: "No mostrar solo tablas: avisar desviaciones y riesgos.",
    icon: AlertTriangle,
  },
  {
    title: "Trazabilidad",
    description: "Cada peso debe tener origen, responsable y medio de pago.",
    icon: ShieldCheck,
  },
  {
    title: "Medios de pago reales",
    description: "Mapear MP, Fidelius, efectivo y otros a metodos internos.",
    icon: CreditCard,
  },
  {
    title: "Rentabilidad antes que ventas",
    description: "La meta no es vender mas: es saber si la jornada gana plata.",
    icon: TrendingUp,
  },
];
