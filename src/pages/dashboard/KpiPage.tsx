import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import DateRangePicker from '@/components/DateRangePicker';
import { useDashboardFilters } from '@/context/DashboardContext';
import { dashboardService } from '@/api/services/dashboardService';
import type { KpiStats } from '@/types/dashboard';

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
});

export default function KpiPage() {
  const { dateRange, supervisorId } = useDashboardFilters();
  const [data, setData] = useState<KpiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    dashboardService
      .getKpiStats(dateRange.from, dateRange.to, supervisorId)
      .then((response) => {
        if (!active) return;
        setData(response);
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err.message || 'Error al cargar KPIs');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [dateRange, supervisorId]);

  const cards = useMemo(() => {
    const totalViajes = data?.totalViajesFinalizados ?? 0;
    const viajesEnRuta = data?.viajesEnRuta ?? 0;
    const ventasTotales = data?.ventasTotales ?? 0;
    const efectividad = data?.efectividadCarga ?? 0;

    return [
      {
        title: 'Total Viajes',
        value: loading ? '—' : totalViajes.toLocaleString('es-AR'),
        hint: 'Finalizados en el período seleccionado',
      },
      {
        title: 'Viajes en Ruta',
        value: loading ? '—' : viajesEnRuta.toLocaleString('es-AR'),
        hint: 'Estado EN_PROCESO',
        highlight: viajesEnRuta > 0,
      },
      {
        title: 'Ventas Totales',
        value: loading ? '—' : currencyFormatter.format(ventasTotales),
        hint: 'Suma de venta total efectiva',
      },
      {
        title: 'Efectividad de Carga',
        value: loading ? '—' : `${efectividad.toFixed(1)}%`,
        hint: '% de mercadería vendida del total cargado',
      },
    ];
  }, [data, loading]);

  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button asChild variant="ghost" className="px-0 text-slate-600">
            <Link to="/dashboard">← Volver al Menú</Link>
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Flash Report
          </h1>
          <p className="text-sm text-slate-600">
            KPIs claves del período seleccionado.
          </p>
        </div>
        <DateRangePicker />
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Card
            key={card.title}
            className="border-slate-200 bg-white shadow-sm"
          >
            <CardHeader className="space-y-1">
              <CardTitle className="text-sm font-semibold text-slate-900">
                {card.title}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                {card.hint}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`text-4xl font-semibold tracking-tight text-slate-900 ${
                  card.highlight ? 'text-emerald-600' : ''
                }`}
              >
                {card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
