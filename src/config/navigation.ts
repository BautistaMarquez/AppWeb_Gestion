import { Truck, Package, Users, Car, BarChart3, LayoutDashboard, type LucideIcon } from "lucide-react";
import type { RolUsuario } from "@/types/auth";

export interface ModuleConfig {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  routeFront: string;
  allowedRoles: RolUsuario[];
  gradient: string;
  group: "operaciones" | "maestros";
}

export const MODULES_CONFIG: readonly ModuleConfig[] = [
  {
    id: "inicio",
    title: "Inicio",
    description: "Panel principal con acceso directo a los módulos del sistema.",
    icon: LayoutDashboard,
    routeFront: "/",
    allowedRoles: ["ADMIN", "SUPERVISOR", "ADMINISTRATIVO", "SUPERVISOR_PLANTA", "TOTAL"],
    gradient: "from-slate-600 to-slate-800",
    group: "operaciones",
  },
  {
    id: "estadisticas",
    title: "Estadísticas",
    description: "Visualización de KPIs globales y filtrados por supervisor.",
    icon: BarChart3,
    routeFront: "/dashboard",
    allowedRoles: ["SUPERVISOR", "ADMIN", "TOTAL"],
    gradient: "from-indigo-600 to-slate-800",
    group: "operaciones",
  },
  {
    id: "logistica",
    title: "Logística",
    description: "Iniciar viajes, controlar flota en ruta y finalizar con auditoría.",
    icon: Truck,
    routeFront: "/logistica",
    allowedRoles: ["SUPERVISOR_PLANTA", "ADMIN", "TOTAL"],
    gradient: "from-blue-600 to-slate-700",
    group: "operaciones",
  },
  {
    id: "productos",
    title: "Productos",
    description: "ABM de productos y gestión de tarifarios (Mayorista/Minorista).",
    icon: Package,
    routeFront: "/productos",
    allowedRoles: ["ADMINISTRATIVO", "ADMIN", "TOTAL"],
    gradient: "from-slate-600 to-slate-800",
    group: "maestros",
  },
  {
    id: "personal",
    title: "Personal",
    description: "Usuarios, conductores y equipos de trabajo.",
    icon: Users,
    routeFront: "/personal",
    allowedRoles: ["ADMINISTRATIVO", "ADMIN", "TOTAL"],
    gradient: "from-blue-700 to-slate-700",
    group: "maestros",
  },
  {
    id: "vehiculos",
    title: "Vehículos",
    description: "Registro de unidades y control de estado (Mantenimiento/Viaje).",
    icon: Car,
    routeFront: "/vehiculos",
    allowedRoles: ["ADMINISTRATIVO", "ADMIN", "TOTAL"],
    gradient: "from-slate-700 to-slate-900",
    group: "maestros",
  },
];