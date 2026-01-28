import { useNavigate } from "react-router-dom";
import { Users, Contact, ShieldCheck, ArrowLeft } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const subModules = [
  {
    id: "usuarios",
    title: "Gestión de Usuarios",
    description: "Administración de cuentas, roles (RBAC) y permisos de acceso al sistema.",
    icon: Users,
    route: "/personal/usuarios",
    gradient: "from-blue-600 to-slate-700",
  },
  {
    id: "conductores",
    title: "Gestión de Conductores",
    description: "Control de choferes, legajos, estados de disponibilidad y licencias.",
    icon: Contact,
    route: "/personal/conductores",
    gradient: "from-slate-600 to-slate-800",
  },
  {
    id: "equipos",
    title: "Gestión de Equipos",
    description: "Asociación de conductores con supervisores y conformación de equipos.",
    icon: ShieldCheck,
    route: "/personal/equipos",
    gradient: "from-blue-700 to-slate-700",
  },
];

export default function PersonalMenu() {
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestión de Personal</h1>
          <p className="text-slate-500">Selecciona una categoría para administrar los recursos humanos.</p>
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
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br ${item.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}>
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