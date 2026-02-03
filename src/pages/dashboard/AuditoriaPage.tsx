import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Download } from 'lucide-react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DateRangePicker from '@/components/DateRangePicker';
import { useDashboardFilters } from '@/context/DashboardContext';
import { dashboardService } from '@/api/services/dashboardService';
import type { DetalleAuditoria, PagedResponse } from '@/types/dashboard';

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
});

export default function AuditoriaPage() {
  const { dateRange, supervisorId } = useDashboardFilters();
  const [response, setResponse] = useState<PagedResponse<DetalleAuditoria> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    setPageIndex(0);
  }, [dateRange]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    dashboardService
      .getAuditReport(
        dateRange.from,
        dateRange.to,
        pageIndex,
        pageSize,
        supervisorId
      )
      .then((data) => {
        if (!active) return;
        setResponse(data);
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err.message || 'Error al cargar auditoría');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [dateRange, pageIndex, pageSize, supervisorId]);

  const columns = useMemo<ColumnDef<DetalleAuditoria>[]>(
    () => [
      {
        accessorKey: 'fechaCierre',
        header: 'Fecha',
        cell: ({ getValue }) => (
          <div className="text-sm">
            {new Date(getValue<string>()).toLocaleDateString('es-AR')}
          </div>
        ),
      },
      {
        accessorKey: 'nombreConductor',
        header: 'Conductor',
        cell: ({ getValue }) => (
          <div className="text-sm">{getValue<string>()}</div>
        ),
      },
      {
        accessorKey: 'vehiculoPatente',
        header: 'Vehículo',
        cell: ({ getValue }) => (
          <div className="text-sm font-medium">{getValue<string>()}</div>
        ),
      },
      {
        accessorKey: 'nombreEquipo',
        header: 'Equipo',
        cell: ({ getValue }) => (
          <div className="text-sm">{getValue<string>()}</div>
        ),
      },
      {
        accessorKey: 'nombreProducto',
        header: 'Producto',
        cell: ({ getValue }) => (
          <div className="text-sm">{getValue<string>()}</div>
        ),
      },
      {
        id: 'unidadesVendidas',
        accessorKey: 'unidadesVendidas',
        header: () => <div className="text-center">Cant. Vendida</div>,
        cell: ({ getValue }) => (
          <div className="text-center text-sm font-medium">
            {getValue<number>().toLocaleString('es-AR')}
          </div>
        ),
      },
      {
        id: 'subtotalVenta',
        header: () => <div className="text-right">Venta ($)</div>,
        cell: ({ row }) => (
          <div className="text-right text-sm font-medium">
            {currencyFormatter.format(row.original.subtotalVenta || 0)}
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: response?.content ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: response?.totalPages ?? 0,
  });

  const handleExport = () => {
    const exportRows = (response?.content ?? []).map((row) => ({
      Fecha: new Date(row.fechaCierre).toLocaleDateString('es-AR'),
      Conductor: row.nombreConductor,
      'Vehículo': row.vehiculoPatente,
      Equipo: row.nombreEquipo,
      Producto: row.nombreProducto,
      'Cantidad Vendida': row.unidadesVendidas,
      'Venta ($)': row.subtotalVenta,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Auditoria');
    XLSX.writeFile(workbook, 'auditoria_dashboard.xlsx');
  };

  const totalPages = response?.totalPages ?? 0;

  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button asChild variant="ghost" className="px-0 text-slate-600">
            <Link to="/dashboard">← Volver al Menú</Link>
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Auditoría Detallada
          </h1>
          <p className="text-sm text-slate-600">
            Validación de ventas, cargas y cierres de viaje.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <DateRangePicker />
          <Button onClick={handleExport} variant="secondary" size="sm">
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      ) : null}

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base text-slate-900">
            Reporte de auditoría
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    Cargando datos...
                  </TableCell>
                </TableRow>
              ) : null}
              {!loading && (response?.content.length ?? 0) === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    No hay registros en el período seleccionado.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-slate-600">
              Página {pageIndex + 1} de {totalPages || 1}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
                disabled={pageIndex === 0}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPageIndex((prev) =>
                    totalPages ? Math.min(prev + 1, totalPages - 1) : prev + 1
                  )
                }
                disabled={totalPages ? pageIndex >= totalPages - 1 : true}
              >
                Siguiente
              </Button>
              <select
                className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPageIndex(0);
                }}
              >
                {[10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size} / página
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
