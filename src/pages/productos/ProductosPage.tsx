import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Search, 
  ArrowLeft,
  Loader2,
  DollarSign,
  Edit2,
  Eye,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { maestrosService } from "@/api/services/maestroService";
import { useAuthStore } from "@/store/authStore";
import type { Producto, ProductoPrecio } from "@/types/maestros";
import { CreateProductoForm } from "@/components/CreateProductoForm";
import { agregarPrecioSchema, actualizarPrecioSchema, type AgregarPrecioFormValues, type ActualizarPrecioFormValues } from "@/lib/validations/producto";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type ModalType = 'crear' | 'agregarPrecio' | 'actualizarPrecio' | 'verValores' | null;

export default function ProductosPage() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados para Control de Modales
  const [modalType, setModalType] = useState<ModalType>(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [precioSeleccionado, setPrecioSeleccionado] = useState<ProductoPrecio | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const myRole = useAuthStore((state) => state.user?.rol);

  // Form para agregar precio
  const agregarPrecioForm = useForm<AgregarPrecioFormValues>({
    resolver: zodResolver(agregarPrecioSchema),
    defaultValues: {
      etiqueta: "",
      valor: undefined,
    },
  });

  // Form para actualizar precio
  const actualizarPrecioForm = useForm<ActualizarPrecioFormValues>({
    resolver: zodResolver(actualizarPrecioSchema),
    defaultValues: {
      etiqueta: "",
      valor: undefined,
    },
  });

  const fetchProductos = async () => {
    try {
      setLoading(true);
      // Usar el endpoint que trae TODOS los productos (activos e inactivos)
      const response = await maestrosService.getAllProductosForAdmin();
      setProductos(response.content);
    } catch (error) {
      console.error("Error fetching productos:", error);
      toast.error("No se pudo cargar la lista de productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // Toggle producto activo/desactivar
  const handleToggleActivoProducto = async (producto: Producto) => {
    const accion = producto.activo ? "desactivar" : "activar";
    if (window.confirm(`¿Estás seguro de ${accion} el producto ${producto.nombre}?`)) {
      try {
        setIsProcessing(true);
        if (producto.activo) {
          await maestrosService.deleteProducto(producto.id);
          toast.success(`Producto ${producto.nombre} desactivado`);
        } else {
          await maestrosService.reactivarProducto(producto.id);
          toast.success(`Producto ${producto.nombre} activado`);
        }
        fetchProductos();
      } catch (error) {
        toast.error(`Error al ${accion} el producto`);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Abrir modal para ver valores de un producto
  const handleAbrirVerValores = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setModalType('verValores');
  };

  // Abrir modal para agregar precio desde Ver Valores
  const handleAbrirAgregarPrecioDesdeVerValores = () => {
    agregarPrecioForm.reset();
    setModalType('agregarPrecio');
  };

  // Abrir modal para agregar precio (directo)
  const handleAbrirAgregarPrecio = (producto: Producto) => {
    setProductoSeleccionado(producto);
    agregarPrecioForm.reset();
    setModalType('agregarPrecio');
  };

  // Agregar precio
  const handleAgregarPrecio = async (data: AgregarPrecioFormValues) => {
    if (!productoSeleccionado) return;

    try {
      setIsProcessing(true);
      await maestrosService.createPrecio(productoSeleccionado.id, {
        etiqueta: data.etiqueta,
        valor: data.valor,
      });
      toast.success(`Precio "${data.etiqueta}" agregado exitosamente`);
      agregarPrecioForm.reset();
      await fetchProductos();
      // Volver al modal Ver Valores
      setModalType('verValores');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Error al agregar el precio";
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Abrir modal para actualizar precio
  const handleAbrirActualizarPrecio = (precio: ProductoPrecio) => {
    setPrecioSeleccionado(precio);
    actualizarPrecioForm.reset({
      etiqueta: precio.etiqueta,
      valor: precio.valor,
    });
    setModalType('actualizarPrecio');
  };

  // Actualizar precio
  const handleActualizarPrecio = async (data: ActualizarPrecioFormValues) => {
    if (!precioSeleccionado) return;

    try {
      setIsProcessing(true);
      await maestrosService.updatePrecio(precioSeleccionado.id, {
        etiqueta: data.etiqueta,
        valor: data.valor,
      });
      toast.success(`Precio "${precioSeleccionado.etiqueta}" actualizado`);
      actualizarPrecioForm.reset();
      await fetchProductos();
      // Volver al modal Ver Valores
      setModalType('verValores');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Error al actualizar el precio";
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Eliminar precio
  const handleEliminarPrecio = async (precio: ProductoPrecio) => {
    if (window.confirm(`¿Estás seguro de eliminar el precio "${precio.etiqueta}"?`)) {
      try {
        setIsProcessing(true);
        await maestrosService.deletePrecio(precio.id);
        toast.success(`Precio "${precio.etiqueta}" eliminado`);
        await fetchProductos();
        // Mantenerse en el modal Ver Valores
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || "Error al eliminar el precio";
        toast.error(errorMsg);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const closeModal = () => {
    setModalType(null);
    setProductoSeleccionado(null);
    setPrecioSeleccionado(null);
    agregarPrecioForm.reset();
    actualizarPrecioForm.reset();
  };

  const filteredProductos = productos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-6 animate-in fade-in duration-500">
      
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gestión de Productos</h1>
              <p className="text-sm text-muted-foreground">ABM de productos y gestión de tarifarios.</p>
            </div>
          </div>
          <Button 
            onClick={() => setModalType('crear')} 
            className="w-full md:w-auto gap-2" 
            disabled={myRole !== 'ADMIN' && myRole !== 'TOTAL' && myRole !== 'ADMINISTRATIVO'}
          >
            <Plus className="h-4 w-4" /> Nuevo Producto
          </Button>
        </div>

        {/* Card de la Tabla */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-lg font-medium">Productos Registrados</CardTitle>
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Buscar por nombre..."
                  className="pl-10 bg-slate-50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-24 flex items-center justify-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredProductos.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                No hay resultados.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-center">Precios Asignados</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProductos.map((producto) => (
                      <TableRow key={producto.id}>
                        <TableCell className="font-medium">{producto.nombre}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">
                            {producto.precios?.length || 0} {producto.precios?.length === 1 ? 'precio' : 'precios'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Switch
                              checked={producto.activo}
                              onCheckedChange={() => handleToggleActivoProducto(producto)}
                              disabled={isProcessing}
                            />
                            <Label className="text-xs">
                              {producto.activo ? "Activo" : "Inactivo"}
                            </Label>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAbrirVerValores(producto)}
                              className="h-8 gap-1.5"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Ver Valores
                            </Button>
                            {producto.activo && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAbrirAgregarPrecio(producto)}
                                className="h-8 gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <DollarSign className="h-3.5 w-3.5" />
                                Agregar Precio
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* MODAL: CREAR PRODUCTO */}
      <Dialog open={modalType === 'crear'} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuevo Producto</DialogTitle>
          </DialogHeader>
          <CreateProductoForm 
            onCancel={closeModal}
            onSuccess={() => {
              closeModal();
              fetchProductos();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* MODAL: VER VALORES */}
      <Dialog open={modalType === 'verValores'} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Valores de Producto</DialogTitle>
            <DialogDescription>
              Producto: <span className="font-semibold text-slate-900">{productoSeleccionado?.nombre}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {productoSeleccionado?.precios && productoSeleccionado.precios.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Etiqueta</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productoSeleccionado.precios.map((precio) => (
                      <TableRow key={precio.id}>
                        <TableCell className="font-medium">{precio.etiqueta}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatPrice(precio.valor)}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAbrirActualizarPrecio(precio)}
                            className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            disabled={isProcessing}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEliminarPrecio(precio)}
                            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={isProcessing}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Este producto no tiene precios asignados.</p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeModal}>
              Cerrar
            </Button>
            {productoSeleccionado?.activo && (
              <Button onClick={handleAbrirAgregarPrecioDesdeVerValores}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Precio
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: AGREGAR PRECIO */}
      <Dialog open={modalType === 'agregarPrecio'} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Precio</DialogTitle>
            <DialogDescription>
              Producto: <span className="font-semibold text-slate-900">{productoSeleccionado?.nombre}</span>
            </DialogDescription>
          </DialogHeader>
          <Form {...agregarPrecioForm}>
            <form onSubmit={agregarPrecioForm.handleSubmit(handleAgregarPrecio)} className="space-y-4">
              <FormField
                control={agregarPrecioForm.control}
                name="etiqueta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Etiqueta</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Mayorista" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={agregarPrecioForm.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Agregar Precio"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* MODAL: ACTUALIZAR PRECIO */}
      <Dialog open={modalType === 'actualizarPrecio'} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Actualizar Precio</DialogTitle>
            <DialogDescription>
              Producto: <span className="font-semibold text-slate-900">{productoSeleccionado?.nombre}</span>
            </DialogDescription>
          </DialogHeader>
          <Form {...actualizarPrecioForm}>
            <form onSubmit={actualizarPrecioForm.handleSubmit(handleActualizarPrecio)} className="space-y-4">
              <FormField
                control={actualizarPrecioForm.control}
                name="etiqueta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Etiqueta</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Mayorista" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={actualizarPrecioForm.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Actualizar Precio"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
