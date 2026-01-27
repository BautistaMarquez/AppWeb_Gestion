import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RolUsuario } from "@/types/auth";
import { useAuthStore } from "@/store/authStore";
import type { LucideIcon } from "lucide-react";
import { Car, LayoutDashboard, Package, Truck, Users } from "lucide-react";

interface ModuleConfig {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  routeFront: string;
  allowedRoles: RolUsuario[];
  gradient: string;
}

// Configuración de módulos basada en `Docs/MODULOS_SISTEMA.md`
const modules: readonly ModuleConfig[] = [
  {
    id: "logistica",
    title: "Logística",
    description:
      "Iniciar viajes, controlar flota en ruta y finalizar con auditoría y stock de retorno.",
    icon: Truck,
    routeFront: "/logistica",
    allowedRoles: ["SUPERVISOR_PLANTA", "ADMIN", "TOTAL"],
    gradient: "from-blue-600 to-slate-700",
  },
  {
    id: "productos",
    title: "Productos",
    description:
      "ABM de productos y gestión de tarifarios (etiquetas mayorista/minorista y valores).",
    icon: Package,
    routeFront: "/productos",
    allowedRoles: ["ADMINISTRATIVO", "ADMIN", "TOTAL"],
    gradient: "from-slate-600 to-slate-800",
  },
  {
    id: "personal",
    title: "Personal",
    description:
      "Usuarios, conductores y equipos de trabajo (asignación de roles y asociaciones).",
    icon: Users,
    routeFront: "/personal",
    allowedRoles: ["ADMINISTRATIVO", "ADMIN", "TOTAL"],
    gradient: "from-blue-700 to-slate-700",
  },
  {
    id: "vehiculos",
    title: "Vehículos",
    description:
      "Registro de unidades y control de estado (DISPONIBLE, MANTENIMIENTO, EN_VIAJE).",
    icon: Car,
    routeFront: "/vehiculos",
    allowedRoles: ["ADMINISTRATIVO", "ADMIN", "TOTAL"],
    gradient: "from-slate-700 to-slate-900",
  },
  {
    id: "dashboard",
    title: "Dashboard",
    description: "KPIs globales y filtros por supervisor para seguimiento operativo.",
    icon: LayoutDashboard,
    routeFront: "/dashboard",
    allowedRoles: ["SUPERVISOR", "ADMIN", "TOTAL"],
    gradient: "from-indigo-600 to-slate-800",
  },
];

// Función para obtener mensaje de bienvenida dinámico
const getWelcomeMessage = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
};

export default function DashboardHome() {
  const welcomeMessage = getWelcomeMessage();
  const navigate = useNavigate();
  const userRole = useAuthStore((state) => state.user?.rol);

  const visibleModules = useMemo(() => {
    if (!userRole) return [];
    return modules.filter((m) => m.allowedRoles.includes(userRole));
  }, [userRole]);

  const openModule = (module: ModuleConfig) => {
    // Excepción: el "Dashboard" navega directo a la visualización (ruta `/dashboard`)
    navigate(module.routeFront);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Banner de Bienvenida */}
      <section className="relative overflow-hidden rounded-xl bg-linear-to-r from-slate-700 via-slate-600 to-slate-800 shadow-lg">
        <div className="absolute inset-0 bg-grid-slate-900/10 mask-[linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative px-6 py-12 md:px-12 md:py-16">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 md:text-4xl lg:text-5xl">
            Panel de Control Logístico
          </h1>
          <p className="text-lg text-slate-200 md:text-xl">
            {welcomeMessage}, bienvenido al sistema de gestión de logística de bebidas
          </p>
          {userRole && (
            <p className="mt-3 text-sm text-slate-200/90">
              Rol activo: <span className="font-semibold text-white">{userRole}</span>
            </p>
          )}
        </div>
      </section>

      {/* Grilla de Módulos */}
      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-6">
          Módulos del Sistema
        </h2>
        {visibleModules.length === 0 ? (
          <Card className="border-dashed border-slate-300 bg-white">
            <CardHeader>
              <CardTitle className="text-slate-900">Sin módulos disponibles</CardTitle>
              <CardDescription>
                No hay módulos habilitados para tu rol actual o no se detectó un rol válido.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {visibleModules.map((module) => {
              const IconComponent = module.icon;
              return (
                <Card
                  key={module.id}
                  role="link"
                  tabIndex={0}
                  aria-label={`Abrir módulo ${module.title}`}
                  onClick={() => openModule(module)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openModule(module);
                    }
                  }}
                  className="group cursor-pointer select-none border-slate-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <CardHeader className="space-y-3">
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br ${module.gradient} shadow-sm transition-transform duration-300 group-hover:scale-110`}
                    >
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-semibold text-slate-900">
                        {module.title}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed text-slate-600">
                        {module.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
