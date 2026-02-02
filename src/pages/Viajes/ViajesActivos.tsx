import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, MoreHorizontal, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { logisticaService } from "@/api/services/logisticaService";
import { cierreViajeSchema, type CierreViajeFormData } from "@/lib/validations/viaje";
import type { ViajeResponseDTO, ViajeDetalle } from "@/types/logistica";
import { EstadoViaje } from "@/types/common";

export default function ViajesActivos() {
  const navigate = useNavigate();
  const [viajes, setViajes] = useState<ViajeResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [viajeSeleccionado, setViajeSeleccionado] = useState<ViajeResponseDTO | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CierreViajeFormData>({
    resolver: zodResolver(cierreViajeSchema),
    defaultValues: {
      viajeId: 0,
      detallesFinales: [],
    },
  });

  const fetchViajesActivos = async () => {
    try {
      setLoading(true);
      const response = await logisticaService.buscarViajes(
        { estado: EstadoViaje.EN_PROCESO },
        0,
        100
      );
      setViajes(response.content);
    } catch (error) {
      console.error("Error cargando viajes activos:", error);
      toast.error("Error al cargar los viajes activos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViajesActivos();
  }, []);

  const abrirDialogFinalizacion = (viaje: ViajeResponseDTO) => {
    setViajeSeleccionado(viaje);
    
    // Inicializar el formulario con los detalles del viaje
    form.reset({
      viajeId: viaje.id,
      detallesFinales: viaje.detalles.map(detalle => ({
        detalleId: detalle.id,
        cantidadFinal: 0,
      })),
    });
    
    setIsDialogOpen(true);
  };

  const cerrarDialog = () => {
    setIsDialogOpen(false);
    setViajeSeleccionado(null);
    form.reset();
  };

  const onSubmit = async (data: CierreViajeFormData) => {
    if (!viajeSeleccionado) return;

    try {
      setSubmitting(true);

      // Validar que todas las cantidades finales sean válidas
      const erroresValidacion: string[] = [];
      
      data.detallesFinales.forEach((detalleFinal, index) => {
        const detalleOriginal = viajeSeleccionado.detalles.find(
          d => d.id === detalleFinal.detalleId
        );
        
        if (!detalleOriginal) {
          erroresValidacion.push(`Detalle ${index + 1}: No se encontró el detalle original`);
          return;
        }

        if (detalleFinal.cantidadFinal < 0) {
          erroresValidacion.push(
            `${detalleOriginal.productoNombre}: La cantidad final no puede ser negativa`
          );
        }

        if (detalleFinal.cantidadFinal > detalleOriginal.cantidadInicial) {
          erroresValidacion.push(
            `${detalleOriginal.productoNombre}: La cantidad final (${detalleFinal.cantidadFinal}) no puede ser mayor que la inicial (${detalleOriginal.cantidadInicial})`
          );
        }
      });

      if (erroresValidacion.length > 0) {
        erroresValidacion.forEach(error => toast.error(error));
        return;
      }

      // Verificar que se hayan completado todos los productos
      if (data.detallesFinales.length !== viajeSeleccionado.detalles.length) {
        toast.error("Debe informar las cantidades finales de todos los productos");
        return;
      }

      await logisticaService.finalizarViaje(data);
      toast.success("Viaje finalizado correctamente");
      cerrarDialog();
      fetchViajesActivos();
    } catch (error: any) {
      console.error("Error finalizando viaje:", error);
      const mensaje = error.response?.data?.message || "Error al finalizar el viaje";
      toast.error(mensaje);
    } finally {
      setSubmitting(false);
    }
  };

  const calcularVentaEstimada = (detalle: ViajeDetalle, cantidadFinal: number): number => {
    const unidadesVendidas = detalle.cantidadInicial - cantidadFinal;
    return unidadesVendidas * detalle.precioAplicado;
  };

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
              Control de Flota
            </h1>
            <p className="text-slate-500">
              Viajes en proceso y finalización de rutas
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchViajesActivos}
          disabled={loading}
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Listado de viajes activos */}
      <Card>
        <CardHeader>
          <CardTitle>Viajes en Proceso ({viajes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {viajes.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-lg font-medium">No hay viajes en proceso</p>
              <p className="text-sm mt-2">
                Los viajes activos aparecerán aquí cuando se inicien
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Conductor</TableHead>
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {viajes.map((viaje) => (
                  <TableRow key={viaje.id}>
                    <TableCell className="font-medium">
                      {format(new Date(viaje.fechaInicio), "dd/MM/yyyy HH:mm", { locale: es })}
                    </TableCell>
                    <TableCell>{viaje.vehiculoPatente}</TableCell>
                    <TableCell>{viaje.conductorNombre}</TableCell>
                    <TableCell>{viaje.supervisorNombre}</TableCell>
                    <TableCell>{viaje.detalles.length} productos</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        {viaje.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => abrirDialogFinalizacion(viaje)}>
                            Finalizar Viaje
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Finalización */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Finalizar Viaje</DialogTitle>
            <DialogDescription>
              Complete las cantidades finales de todos los productos para cerrar el viaje.
              {viajeSeleccionado && (
                <div className="mt-4 p-3 bg-slate-50 rounded-md text-sm">
                  <p><strong>Vehículo:</strong> {viajeSeleccionado.vehiculoPatente}</p>
                  <p><strong>Conductor:</strong> {viajeSeleccionado.conductorNombre}</p>
                  <p><strong>Inicio:</strong> {format(new Date(viajeSeleccionado.fechaInicio), "dd/MM/yyyy HH:mm", { locale: es })}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {viajeSeleccionado && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-center">Cant. Inicial</TableHead>
                      <TableHead className="text-center">Cant. Final</TableHead>
                      <TableHead className="text-right">Precio Unit.</TableHead>
                      <TableHead className="text-right">Venta Estimada</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viajeSeleccionado.detalles.map((detalle, index) => {
                      const cantidadFinal = form.watch(`detallesFinales.${index}.cantidadFinal`) || 0;
                      const ventaEstimada = calcularVentaEstimada(detalle, cantidadFinal);

                      return (
                        <TableRow key={detalle.id}>
                          <TableCell className="font-medium">
                            {detalle.productoNombre}
                          </TableCell>
                          <TableCell className="text-center">
                            {detalle.cantidadInicial}
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`detallesFinales.${index}.cantidadFinal`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      max={detalle.cantidadInicial}
                                      placeholder="0"
                                      className="text-center"
                                      {...field}
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            ${detalle.precioAplicado.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${ventaEstimada.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={cerrarDialog}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Finalizar Viaje
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
