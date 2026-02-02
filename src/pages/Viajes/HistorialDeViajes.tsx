import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, RefreshCcw, Search, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { logisticaService } from "@/api/services/logisticaService";
import type { ViajeResponseDTO } from "@/types/logistica";
import { EstadoViaje } from "@/types/common";

export default function HistorialDeViajes() {
  const navigate = useNavigate();
  const [viajes, setViajes] = useState<ViajeResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viajeSeleccionado, setViajeSeleccionado] = useState<ViajeResponseDTO | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchHistorial = async () => {
    try {
      setLoading(true);
      const response = await logisticaService.buscarViajes(
        { estado: EstadoViaje.FINALIZADO },
        0,
        100
      );
      setViajes(response.content);
    } catch (error) {
      console.error("Error cargando historial:", error);
      toast.error("Error al cargar el historial de viajes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, []);

  const abrirDetalleViaje = (viaje: ViajeResponseDTO) => {
    setViajeSeleccionado(viaje);
    setIsDialogOpen(true);
  };

  const cerrarDialog = () => {
    setIsDialogOpen(false);
    setViajeSeleccionado(null);
  };

  const calcularDuracionViaje = (fechaInicio: string, fechaFin: string | null): string => {
    if (!fechaFin) return "N/A";
    
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffMs = fin.getTime() - inicio.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}h ${diffMinutes}m`;
  };

  // Filtrar viajes por término de búsqueda
  const viajesFiltrados = viajes.filter(viaje => {
    if (!searchTerm) return true;
    
    const termLower = searchTerm.toLowerCase();
    return (
      viaje.vehiculoPatente.toLowerCase().includes(termLower) ||
      viaje.conductorNombre.toLowerCase().includes(termLower) ||
      viaje.supervisorNombre.toLowerCase().includes(termLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/logistica")}
            className="hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Historial de Viajes
            </h1>
            <p className="text-slate-500">
              Consulta de viajes finalizados y auditoría de ventas
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchHistorial}
          disabled={loading}
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Buscador */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por patente, conductor o supervisor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Listado de viajes */}
      <Card>
        <CardHeader>
          <CardTitle>
            Viajes Finalizados ({viajesFiltrados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viajesFiltrados.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-lg font-medium">
                {searchTerm ? "No se encontraron viajes" : "No hay viajes finalizados"}
              </p>
              <p className="text-sm mt-2">
                {searchTerm
                  ? "Intente con otros términos de búsqueda"
                  : "Los viajes finalizados aparecerán aquí"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha Salida</TableHead>
                  <TableHead>Fecha Llegada</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Conductor</TableHead>
                  <TableHead className="text-right">Venta Total</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {viajesFiltrados.map((viaje) => (
                  <TableRow key={viaje.id}>
                    <TableCell className="font-medium">
                      {format(new Date(viaje.fechaInicio), "dd/MM/yyyy HH:mm", { locale: es })}
                    </TableCell>
                    <TableCell>
                      {viaje.fechaFin
                        ? format(new Date(viaje.fechaFin), "dd/MM/yyyy HH:mm", { locale: es })
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {calcularDuracionViaje(viaje.fechaInicio, viaje.fechaFin)}
                    </TableCell>
                    <TableCell>{viaje.vehiculoPatente}</TableCell>
                    <TableCell>{viaje.conductorNombre}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${viaje.ventaTotal.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        {viaje.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => abrirDetalleViaje(viaje)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalle del Viaje */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Viaje #{viajeSeleccionado?.id}</DialogTitle>
            <DialogDescription>
              Información completa del viaje finalizado
            </DialogDescription>
          </DialogHeader>

          {viajeSeleccionado && (
            <div className="space-y-6">
              {/* Información General */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-500">Vehículo</p>
                  <p className="font-medium">{viajeSeleccionado.vehiculoPatente}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Conductor</p>
                  <p className="font-medium">{viajeSeleccionado.conductorNombre}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Supervisor</p>
                  <p className="font-medium">{viajeSeleccionado.supervisorNombre}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Estado</p>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    {viajeSeleccionado.estado}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Fecha de Salida</p>
                  <p className="font-medium">
                    {format(new Date(viajeSeleccionado.fechaInicio), "dd/MM/yyyy HH:mm", { locale: es })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Fecha de Llegada</p>
                  <p className="font-medium">
                    {viajeSeleccionado.fechaFin
                      ? format(new Date(viajeSeleccionado.fechaFin), "dd/MM/yyyy HH:mm", { locale: es })
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Duración del Viaje</p>
                  <p className="font-medium">
                    {calcularDuracionViaje(viajeSeleccionado.fechaInicio, viajeSeleccionado.fechaFin)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Venta Total</p>
                  <p className="font-medium text-lg text-green-600">
                    ${viajeSeleccionado.ventaTotal.toFixed(2)}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Detalle de Productos */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Detalle de Productos</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-center">Cant. Inicial</TableHead>
                      <TableHead className="text-center">Cant. Final</TableHead>
                      <TableHead className="text-center">Vendido</TableHead>
                      <TableHead className="text-right">Precio Unit.</TableHead>
                      <TableHead className="text-right">Venta Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viajeSeleccionado.detalles.map((detalle) => {
                      const cantidadVendida = detalle.cantidadInicial - (detalle.cantidadFinal || 0);
                      
                      return (
                        <TableRow key={detalle.id}>
                          <TableCell className="font-medium">
                            {detalle.productoNombre}
                          </TableCell>
                          <TableCell className="text-center">
                            {detalle.cantidadInicial}
                          </TableCell>
                          <TableCell className="text-center">
                            {detalle.cantidadFinal ?? "N/A"}
                          </TableCell>
                          <TableCell className="text-center font-medium text-blue-600">
                            {cantidadVendida}
                          </TableCell>
                          <TableCell className="text-right">
                            ${detalle.precioAplicado.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${detalle.ventaRealizada.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Resumen de Ventas */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-600">Total de Productos Vendidos</p>
                    <p className="text-2xl font-bold">
                      {viajeSeleccionado.detalles.reduce(
                        (sum, d) => sum + (d.cantidadInicial - (d.cantidadFinal || 0)),
                        0
                      )} unidades
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Venta Total del Viaje</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${viajeSeleccionado.ventaTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={cerrarDialog}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
