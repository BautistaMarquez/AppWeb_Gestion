import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { logisticaService } from "@/api/services/logisticaService";
import { maestrosService } from "@/api/services/maestroService";
import { iniciarViajeSchema, type IniciarViajeFormData } from "@/lib/validations/viaje";
import type { Vehiculo, Conductor, Producto, ProductoPrecio } from "@/types/maestros";

export default function IniciarViaje() {
  const navigate = useNavigate();
  
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [precios, setPrecios] = useState<Record<number, ProductoPrecio[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<IniciarViajeFormData>({
    resolver: zodResolver(iniciarViajeSchema),
    defaultValues: {
      vehiculoId: 0,
      conductorId: 0,
      supervisorId: 0,
      detalles: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "detalles",
  });

  // Cargar recursos disponibles
  useEffect(() => {
    const fetchRecursos = async () => {
      try {
        setLoading(true);
        const [vehiculosData, conductoresData, productosData] = await Promise.all([
          maestrosService.getVehiculosDisponibles(),
          maestrosService.getConductoresDisponiblesConEquipo(),
          maestrosService.getProductos(0, 100),
        ]);

        setVehiculos(vehiculosData);
        setConductores(conductoresData);
        setProductos(productosData.content.filter((p: Producto) => p.activo));
      } catch (error) {
        console.error("Error cargando recursos:", error);
        toast.error("Error al cargar los recursos necesarios");
      } finally {
        setLoading(false);
      }
    };

    fetchRecursos();
  }, []);

  // Cuando se selecciona un conductor, asignar automáticamente el supervisor del equipo
  const handleConductorChange = (conductorId: number) => {
    console.log("🔄 Conductor seleccionado ID:", conductorId);
    const conductorSeleccionado = conductores.find(c => c.id === conductorId);
    console.log("👤 Conductor encontrado:", conductorSeleccionado);
    
    if (conductorSeleccionado && conductorSeleccionado.supervisorId) {
      form.setValue('supervisorId', conductorSeleccionado.supervisorId);
      console.log("✅ Supervisor asignado automáticamente:", conductorSeleccionado.supervisorId, conductorSeleccionado.supervisorNombre);
    } else {
      console.warn("⚠️ El conductor no tiene supervisor asignado");
      toast.warning("Este conductor no tiene un supervisor asignado");
    }
  };

  // Cargar precios cuando se selecciona un producto
  const handleProductoChange = async (productoId: number) => {
    if (!precios[productoId]) {
      try {
        const preciosData = await maestrosService.getPreciosPorProducto(productoId);
        setPrecios(prev => ({ ...prev, [productoId]: preciosData }));
      } catch (error) {
        console.error("Error cargando precios:", error);
        toast.error("Error al cargar los precios del producto");
      }
    }
  };

  const agregarProducto = () => {
    console.log("➕ Agregando nueva fila de producto");
    append({
      productoId: 0,
      cantidadInicial: undefined as any, // Vacío inicialmente para mejor UX
      productoPrecioId: 0,
    });
  };

  // Verificar si una combinación producto-precio ya existe
  const esCombinacionDuplicada = (currentIndex: number, productoId: number, precioId: number): boolean => {
    if (!productoId || !precioId) return false;
    
    const detalles = form.getValues('detalles');
    return detalles.some((detalle, index) => 
      index !== currentIndex && 
      detalle.productoId === productoId && 
      detalle.productoPrecioId === precioId
    );
  };

  const onSubmit = async (data: IniciarViajeFormData) => {
    console.log("🚀 onSubmit ejecutado - Datos del formulario:", data);
    console.log("📋 Estado del formulario:", {
      isValid: form.formState.isValid,
      errors: form.formState.errors,
      isDirty: form.formState.isDirty,
      isSubmitting: form.formState.isSubmitting
    });

    try {
      setSubmitting(true);
      
      // Validaciones manuales adicionales
      if (!data.vehiculoId || data.vehiculoId === 0) {
        toast.error("Debe seleccionar un vehículo");
        setSubmitting(false);
        return;
      }

      if (!data.conductorId || data.conductorId === 0) {
        toast.error("Debe seleccionar un conductor");
        setSubmitting(false);
        return;
      }

      if (!data.supervisorId || data.supervisorId === 0) {
        toast.error("El supervisor no se asignó correctamente. Seleccione un conductor con equipo asignado.");
        setSubmitting(false);
        return;
      }

      if (data.detalles.length === 0) {
        toast.error("Debe agregar al menos un producto al viaje");
        setSubmitting(false);
        return;
      }

      // Validar que todos los campos estén completos
      const detallesIncompletos = data.detalles.filter(
        d => !d.productoId || !d.cantidadInicial || !d.productoPrecioId
      );

      if (detallesIncompletos.length > 0) {
        toast.error("Complete todos los campos de los productos antes de continuar");
        setSubmitting(false);
        return;
      }

      // Validación adicional: verificar combinaciones únicas de producto-precio
      const combinaciones = data.detalles.map(d => `${d.productoId}-${d.productoPrecioId}`);
      const combinacionesUnicas = new Set(combinaciones);
      
      if (combinaciones.length !== combinacionesUnicas.size) {
        toast.error("No puede agregar la misma combinación de producto y precio más de una vez");
        setSubmitting(false);
        return;
      }

      // Mostrar que estamos enviando los datos
      console.log("📤 Enviando datos de viaje al backend:", JSON.stringify(data, null, 2));
      toast.loading("Procesando inicio de viaje...");

      const respuesta = await logisticaService.iniciarViaje(data);
      
      console.log("✅ Viaje creado exitosamente:", respuesta);
      toast.success("Viaje iniciado correctamente");
      
      // Esperar un poco para que el toast sea visible
      setTimeout(() => {
        navigate("/logistica/viajes-activos");
      }, 1000);
    } catch (error: any) {
      console.error("❌ Error iniciando viaje:", error);
      const mensaje = error.response?.data?.message || error.message || "Error al iniciar el viaje";
      console.error("Detalles del error:", error.response?.data);
      toast.error(mensaje);
    } finally {
      setSubmitting(false);
    }
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Iniciar Viaje</h1>
          <p className="text-slate-500">Complete los datos para registrar un nuevo viaje</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Datos del Viaje */}
          <Card>
            <CardHeader>
              <CardTitle>Datos del Viaje</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vehículo */}
              <FormField
                control={form.control}
                name="vehiculoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehículo *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un vehículo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehiculos.length === 0 ? (
                          <SelectItem value="0" disabled>
                            No hay vehículos disponibles
                          </SelectItem>
                        ) : (
                          vehiculos.map((vehiculo) => (
                            <SelectItem key={vehiculo.id} value={vehiculo.id.toString()}>
                              {vehiculo.patente} - {vehiculo.modelo}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conductor */}
              <FormField
                control={form.control}
                name="conductorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conductor *</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(Number(value));
                        handleConductorChange(Number(value));
                      }}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un conductor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {conductores.length === 0 ? (
                          <SelectItem value="0" disabled>
                            No hay conductores disponibles (deben tener equipo asignado)
                          </SelectItem>
                        ) : (
                          conductores.map((conductor) => (
                            <SelectItem key={conductor.id} value={conductor.id.toString()}>
                              {conductor.nombre} {conductor.apellido} ({conductor.nombreEquipo})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Productos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Carga de Productos</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={agregarProducto}
                disabled={submitting}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Producto
              </Button>
            </CardHeader>
            <CardContent>
              {fields.length === 0 ? (
                <p className="text-center text-slate-500 py-8">
                  No hay productos agregados. Haga clic en "Agregar Producto" para comenzar.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cantidad Inicial</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead className="w-20">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => {
                      const productoIdActual = form.watch(`detalles.${index}.productoId`);
                      const precioIdActual = form.watch(`detalles.${index}.productoPrecioId`);
                      const preciosDisponibles = precios[productoIdActual] || [];
                      const esDuplicado = esCombinacionDuplicada(index, productoIdActual, precioIdActual);

                      return (
                        <TableRow key={field.id} className={esDuplicado ? "bg-red-50" : ""}>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`detalles.${index}.productoId`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select
                                    onValueChange={(value) => {
                                      field.onChange(Number(value));
                                      handleProductoChange(Number(value));
                                      form.setValue(`detalles.${index}.productoPrecioId`, 0);
                                    }}
                                    value={field.value?.toString()}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Seleccione producto" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {productos.map((producto) => (
                                        <SelectItem key={producto.id} value={producto.id.toString()}>
                                          {producto.nombre}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`detalles.${index}.cantidadInicial`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      placeholder="Ingrese cantidad"
                                      value={field.value ? field.value : ""}
                                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`detalles.${index}.productoPrecioId`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    value={field.value?.toString()}
                                    disabled={!productoIdActual || preciosDisponibles.length === 0}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Precio" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {preciosDisponibles.map((precio) => (
                                        <SelectItem key={precio.id} value={precio.id.toString()}>
                                          {precio.etiqueta} - ${precio.valor.toFixed(2)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                  {esDuplicado && (
                                    <p className="text-xs text-red-500 mt-1">
                                      ⚠️ Combinación duplicada
                                    </p>
                                  )}
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              disabled={submitting}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/logistica")}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={submitting || fields.length === 0}
              onClick={() => {
                console.log("🖱️ Click en botón Iniciar Viaje");
                console.log("📝 Valores actuales del formulario:", form.getValues());
                console.log("❌ Errores del formulario:", form.formState.errors);
              }}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar Viaje
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
