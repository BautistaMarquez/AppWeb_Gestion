import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Truck, 
  ArrowRight,
  Route,
  Warehouse,
  UserCheck
} from "lucide-react";

// Tipos para los módulos del sistema
type UserRole = 'ADMIN' | 'SUPERVISOR' | 'CONDUCTOR' | 'OPERADOR';

interface ModuleConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  requiredRole: UserRole[];
  color: string;
}

// Configuración de módulos basada en el modelo DER y HUs
const modules: ModuleConfig[] = [
  {
    id: 'viajes',
    title: 'Gestión de Viajes',
    description: 'Despacho y cierre de carga. Control completo del ciclo de viajes logísticos (HU#1, HU#2).',
    icon: Route,
    href: '/viajes',
    requiredRole: ['ADMIN', 'SUPERVISOR', 'OPERADOR'],
    color: 'from-blue-600 to-slate-700'
  },
  {
    id: 'inventario',
    title: 'Inventario de Productos',
    description: 'Control de stock, precios y disponibilidad de productos en almacén.',
    icon: Warehouse,
    href: '/inventario',
    requiredRole: ['ADMIN', 'SUPERVISOR', 'OPERADOR'],
    color: 'from-slate-600 to-slate-800'
  },
  {
    id: 'flota',
    title: 'Control de Flota',
    description: 'Estado de camiones, mantenimiento y seguimiento de vehículos en tiempo real.',
    icon: Truck,
    href: '/flota',
    requiredRole: ['ADMIN', 'SUPERVISOR'],
    color: 'from-blue-700 to-slate-600'
  },
  {
    id: 'rrhh',
    title: 'Recursos Humanos',
    description: 'Gestión de choferes, supervisores y equipos de trabajo.',
    icon: UserCheck,
    href: '/rrhh',
    requiredRole: ['ADMIN', 'SUPERVISOR'],
    color: 'from-slate-700 to-slate-900'
  }
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

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Banner de Bienvenida */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 shadow-lg">
        <div className="absolute inset-0 bg-grid-slate-900/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative px-6 py-12 md:px-12 md:py-16">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 md:text-4xl lg:text-5xl">
            Panel de Control Logístico
          </h1>
          <p className="text-lg text-slate-200 md:text-xl">
            {welcomeMessage}, bienvenido al sistema de gestión de logística de bebidas
          </p>
        </div>
      </section>

      {/* Grilla de Módulos */}
      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-6">
          Módulos del Sistema
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {modules.map((module) => {
            const IconComponent = module.icon;
            return (
              <Card 
                key={module.id} 
                className="group hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-slate-300"
              >
                <CardHeader className="pb-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${module.color} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-900">
                    {module.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600 leading-relaxed">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Roles:</span>
                    <span className="font-medium">
                      {module.requiredRole.join(', ')}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button 
                    className="w-full group/btn" 
                    variant="default"
                    asChild
                  >
                    <a href={module.href} className="flex items-center justify-center gap-2">
                      Acceder
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
