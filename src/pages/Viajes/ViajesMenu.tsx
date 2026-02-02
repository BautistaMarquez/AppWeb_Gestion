import { useNavigate } from "react-router-dom";
import { ArrowLeft, TruckIcon, MapPin, History } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const subModules = [
  {
    id: "iniciar-viaje",
    title: "Iniciar Viaje",
    description: "Registrar nuevo viaje con asignación de vehículo, conductor y carga de productos.",
    icon: TruckIcon,
    route: "/logistica/iniciar-viaje",
    gradient: "from-blue-600 to-slate-700",
  },
  {
    id: "viajes-activos",
    title: "Control de Flota",
    description: "Monitoreo de viajes en proceso y finalización de rutas con liquidación de stock.",
    icon: MapPin,
    route: "/logistica/viajes-activos",
    gradient: "from-slate-600 to-slate-800",
  },
  {
    id: "historial",
    title: "Historial de Viajes",
    description: "Consulta de viajes finalizados con detalles de ventas y auditoría.",
    icon: History,
    route: "/logistica/historial",
    gradient: "from-blue-700 to-slate-700",
  },
];

export default function ViajesMenu() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header con botón de retorno */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/")}
          className="hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestión de Logística</h1>
          <p className="text-slate-500">Control de viajes, flota y distribución de productos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {subModules.map((item) => {
          const IconComponent = item.icon;
          return (
            <Card
              key={item.id}
              onClick={() => navigate(item.route)}
              className="group cursor-pointer border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
            >
              <CardHeader className="space-y-4">
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                  <IconComponent className="h-7 w-7 text-white" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-xl font-bold text-slate-900">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-slate-600">
                    {item.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
