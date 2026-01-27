import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface KpiCardProps {
  title: string;
  value: string;
  hint: string;
}

function KpiCard({ title, value, hint }: KpiCardProps) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="space-y-1">
        <CardTitle className="text-sm font-semibold text-slate-900">{title}</CardTitle>
        <CardDescription className="text-xs">{hint}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight text-slate-900">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function DashboardStats() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <section className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Dashboard y Estadísticas
        </h1>
        <p className="text-sm text-slate-600">
          Visualización de KPIs (placeholder). Acá se conectará a `@DashboardController`.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard title="Viajes en proceso" value="—" hint="Estado EN_PROCESO" />
        <KpiCard title="Unidades disponibles" value="—" hint="Flota DISPONIBLE" />
        <KpiCard title="Alertas operativas" value="—" hint="Pendientes / críticas" />
      </section>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base text-slate-900">Filtros</CardTitle>
          <CardDescription className="text-sm">
            Próximo paso: filtros por supervisor y rangos de fecha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-700">
            Placeholder: controles de filtros (TanStack Query + parámetros).
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

