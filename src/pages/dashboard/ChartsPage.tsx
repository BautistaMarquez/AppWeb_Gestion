import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DateRangePicker from '@/components/DateRangePicker';
import { useDashboardFilters } from '@/context/DashboardContext';
import { dashboardService } from '@/api/services/dashboardService';
import type { ProductoPerformance, VentaDiaria } from '@/types/dashboard';

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

export default function ChartsPage() {
  const { dateRange, supervisorId } = useDashboardFilters();
  const [trend, setTrend] = useState<VentaDiaria[]>([]);
  const [productMix, setProductMix] = useState<ProductoPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    Promise.all([
      dashboardService.getTrend(dateRange.from, dateRange.to, supervisorId),
      dashboardService.getProductMix(dateRange.from, dateRange.to, supervisorId),
    ])
      .then(([trendResponse, productResponse]) => {
        if (!active) return;
        setTrend(trendResponse);
        setProductMix(productResponse);
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err.message || 'Error al cargar gráficos');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [dateRange, supervisorId]);

  const trendData = useMemo(
    () =>
      trend.map((item) => ({
        fecha: item.fecha,
        total: Number(item.totalVenta) || 0,
      })),
    [trend]
  );

  const mixData = useMemo(
    () =>
      productMix.map((item) => ({
        producto: item.productoNombre,
        cantidad: Number(item.cantidadVendida) || 0,
        total: Number(item.totalFacturado) || 0,
      })),
    [productMix]
  );

  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button asChild variant="ghost" className="px-0 text-slate-600">
            <Link to="/dashboard">← Volver al Menú</Link>
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Análisis de Tendencias
          </h1>
          <p className="text-sm text-slate-600">
            Evolución de ventas y rendimiento por producto.
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

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base text-slate-900">
              Evolución de ventas
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={(value) =>
                    currencyFormatter.format(Number(value))
                  }
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) =>
                    currencyFormatter.format(Number(value))
                  }
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#2563eb"
                  fill="#93c5fd"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base text-slate-900">
              Mix de productos
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={mixData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="producto" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(value) =>
                    currencyFormatter.format(Number(value))
                  }
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'total') {
                      return currencyFormatter.format(Number(value));
                    }
                    return Number(value).toLocaleString('es-AR');
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="cantidad"
                  name="Cantidad"
                  barSize={24}
                  fill="#38bdf8"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="total"
                  name="Total ($)"
                  stroke="#0f172a"
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {loading && trendData.length === 0 && mixData.length === 0 ? (
        <p className="text-sm text-slate-500">Cargando gráficos...</p>
      ) : null}
    </div>
  );
}
