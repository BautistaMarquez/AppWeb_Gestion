import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction } from "lucide-react";

interface ModuleMenuPlaceholderProps {
  title: string;
  description: string;
  actions: string[];
}

export default function ModuleMenuPlaceholder({
  title,
  description,
  actions,
}: ModuleMenuPlaceholderProps) {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          <p className="text-sm text-slate-600">{description}</p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="h-11 w-full sm:w-auto"
          onClick={() => navigate("/", { replace: false })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Inicio
        </Button>
      </section>

      <Card className="border-slate-200 bg-white">
        <CardHeader className="space-y-2">
          <div className="inline-flex items-center gap-2 text-slate-900">
            <Construction className="h-4 w-4 text-slate-700" />
            <CardTitle className="text-base">Sub-menú (placeholder)</CardTitle>
          </div>
          <CardDescription className="text-sm">
            Esta pantalla es un placeholder. Acá va el sub-menú con accesos rápidos del módulo.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Acciones previstas
          </div>
          <ul className="space-y-2 text-sm text-slate-700">
            {actions.map((action) => (
              <li key={action} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

