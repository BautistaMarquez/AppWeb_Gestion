import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  ArrowLeft,
  Loader2,
  Wrench,
  CheckCircle,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { maestrosService } from "@/api/services/maestroService";
import { useAuthStore } from "@/store/authStore";
import type { Vehiculo } from "@/types/maestros";
import type { EstadoVehiculo as EstadoVehiculoType } from "@/types/common";
import { CreateVehiculoForm } from "@/components/CreateVehiculoForm";

// Helper para colores de estados
const getEstadoBadge = (estado: EstadoVehiculoType) => {
  const styles: Record<EstadoVehiculoType, string> = {
    DISPONIBLE: "bg-green-100 text-green-700 border-green-200",
    EN_VIAJE: "bg-blue-100 text-blue-700 border-blue-200",
    MANTENIMIENTO: "bg-orange-100 text-orange-700 border-orange-200",
    ELIMINADO: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return styles[estado] || "bg-gray-100 text-gray-700";
};

export default function VehiculosPage() {
  const navigate = useNavigate();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados para Control de Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehiculoAEliminar, setVehiculoAEliminar] = useState<Vehiculo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const myRole = useAuthStore((state) => state.user?.rol);

  const fetchVehiculos = async () => {
    try {
      setLoading(true);
      const response = await maestrosService.getVehiculos();
      setVehiculos(response.content);
    } catch (error) {
      console.error("Error fetching vehiculos:", error);
      toast.error("No se pudo cargar la lista de vehículos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehiculos();
  }, []);

  // Lógica de cambio de estado (Toggle MANTENIMIENTO/DISPONIBLE)
  const handleToggleEstado = async (vehiculo: Vehiculo) => {
    // No se puede cambiar estado si está EN_VIAJE o ELIMINADO
    if (vehiculo.estado === "EN_VIAJE") {
      toast.error("No se puede cambiar el estado de un vehículo en viaje");
      return;
    }
    if (vehiculo.estado === "ELIMINADO") {
      toast.error("No se puede cambiar el estado de un vehículo eliminado");
      return;
    }

    const nuevoEstado: EstadoVehiculoType = 
      vehiculo.estado === "DISPONIBLE" ? "MANTENIMIENTO" : "DISPONIBLE";

    try {
      await maestrosService.updateEstadoVehiculo(vehiculo.id, nuevoEstado);
      toast.success(`Vehículo ${vehiculo.patente} ahora está ${nuevoEstado}`);
      fetchVehiculos();
    } catch (error) {
      toast.error("Error al actualizar el estado");
    }
  };

  // Lógica de eliminación (cambio a estado ELIMINADO)
  const handleEliminar = async () => {
    if (!vehiculoAEliminar) return;

    try {
      setIsDeleting(true);
      await maestrosService.deleteVehiculo(vehiculoAEliminar.id);
      toast.success(`Vehículo ${vehiculoAEliminar.patente} eliminado`);
      setVehiculoAEliminar(null);
      fetchVehiculos();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Error al eliminar el vehículo";
      toast.error(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredVehiculos = vehiculos.filter(v => 
    v.patente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.modelo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6 animate-in fade-in duration-500">
      
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gestión de Vehículos</h1>
              <p className="text-sm text-muted-foreground">Registro y control de unidades de la flota.</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="w-full md:w-auto gap-2" 
            disabled={myRole !== 'ADMIN' && myRole !== 'TOTAL' && myRole !== 'ADMINISTRATIVO'}
          >
            <Plus className="h-4 w-4" /> Nuevo Vehículo
          </Button>
        </div>

        {/* Card de la Tabla */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-lg font-medium">Vehículos Registrados</CardTitle>
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Buscar por patente o modelo..."
                  className="pl-10 bg-slate-50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-slate-200">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-semibold">Patente</TableHead>
                    <TableHead className="font-semibold">Modelo</TableHead>
                    <TableHead className="font-semibold w-40">Estado</TableHead>
                    <TableHead className="text-right font-semibold w-24">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Cargando...
                      </TableCell>
                    </TableRow>
                  ) : filteredVehiculos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                        No hay resultados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVehiculos.map((vehiculo) => (
                      <TableRow key={vehiculo.id} className="hover:bg-slate-50/50">
                        <TableCell>
                          <span className="font-medium text-slate-900">{vehiculo.patente}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600">{vehiculo.modelo}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getEstadoBadge(vehiculo.estado)}>
                            {vehiculo.estado}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {vehiculo.estado !== "ELIMINADO" && vehiculo.estado !== "EN_VIAJE" ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Gestión</DropdownMenuLabel>
                                <DropdownMenuItem 
                                  onClick={() => handleToggleEstado(vehiculo)}
                                >
                                  {vehiculo.estado === "DISPONIBLE" ? (
                                    <>
                                      <Wrench className="mr-2 h-4 w-4" /> Poner en Mantenimiento
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="mr-2 h-4 w-4" /> Marcar Disponible
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => setVehiculoAEliminar(vehiculo)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Eliminar Vehículo
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span className="text-xs text-muted-foreground"></span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MODAL: CREAR VEHÍCULO */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Nuevo Vehículo</DialogTitle>
          </DialogHeader>
          <CreateVehiculoForm 
            onCancel={() => setIsModalOpen(false)}
            onSuccess={() => {
              setIsModalOpen(false);
              fetchVehiculos();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* MODAL: CONFIRMAR ELIMINACIÓN */}
      <Dialog open={!!vehiculoAEliminar} onOpenChange={() => setVehiculoAEliminar(null)}>
        <DialogContent className="sm:max-w-100">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de eliminar el vehículo <span className="font-semibold text-slate-900">
                {vehiculoAEliminar?.patente}
              </span>? Esta acción es irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setVehiculoAEliminar(null)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              disabled={isDeleting} 
              onClick={handleEliminar}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
