import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  ArrowLeft,
  Loader2,
  RefreshCcw
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { maestrosService } from "@/api/services/maestroService";
import { useAuthStore } from "@/store/authStore";
import type { Conductor } from "@/types/maestros";
import type { EstadoConductor as EstadoConductorType } from "@/types/common";
import { CreateConductorForm } from "@/components/CreateConductorForm";

// Helper para colores de estados
const getEstadoBadge = (estado: EstadoConductorType) => {
  const styles: Record<EstadoConductorType, string> = {
    DISPONIBLE: "bg-green-100 text-green-700 border-green-200",
    OCUPADO: "bg-blue-100 text-blue-700 border-blue-200",
    LICENCIA_VENCIDA: "bg-red-100 text-red-700 border-red-200",
    ELIMINADO: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return styles[estado] || "bg-gray-100 text-gray-700";
};

const estadosDisponibles: EstadoConductorType[] = [
  "DISPONIBLE",
  "LICENCIA_VENCIDA",
  "ELIMINADO"
];

export default function ConductoresPage() {
  const navigate = useNavigate();
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados para Control de Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conductorEnEstado, setConductorEnEstado] = useState<Conductor | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoConductorType | "">("");
  const [isUpdating, setIsUpdating] = useState(false);

  const myRole = useAuthStore((state) => state.user?.rol);

  const fetchConductores = async () => {
    try {
      setLoading(true);
      const response = await maestrosService.getConductores();
      setConductores(response.content);
    } catch (error) {
      console.error("Error fetching conductores:", error);
      toast.error("No se pudo cargar la lista de conductores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConductores();
  }, []);

  // Lógica de Actualización de Estado
  const handleUpdateEstado = async () => {
    if (!conductorEnEstado || !nuevoEstado) return;

    try {
      setIsUpdating(true);
      await maestrosService.updateEstadoConductor(conductorEnEstado.id, nuevoEstado);
      toast.success(`Estado de ${conductorEnEstado.nombre} actualizado a ${nuevoEstado}`);
      setConductorEnEstado(null);
      setNuevoEstado("");
      fetchConductores();
    } catch (error) {
      toast.error("Error al actualizar el estado");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredConductores = conductores.filter(c => 
    `${c.nombre} ${c.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.dni.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nombreEquipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formatear fecha de licencia
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  // Verificar si la licencia está vencida o próxima a vencer
  const getLicenciaStatus = (dateString: string) => {
    const licenciaDate = new Date(dateString);
    const today = new Date();
    const diffTime = licenciaDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: "vencida", color: "text-red-600", days: Math.abs(diffDays) };
    } else if (diffDays <= 30) {
      return { status: "próxima", color: "text-orange-600", days: diffDays };
    }
    return { status: "vigente", color: "text-slate-600", days: diffDays };
  };

  return (
    <div className="container mx-auto px-4 py-6 animate-in fade-in duration-500">
      
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate("/personal")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gestión de Conductores</h1>
              <p className="text-sm text-muted-foreground">Control de choferes, legajos y disponibilidad.</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="w-full md:w-auto gap-2" 
            disabled={myRole !== 'ADMIN' && myRole !== 'TOTAL' && myRole !== 'ADMINISTRATIVO'}
          >
            <Plus className="h-4 w-4" /> Nuevo Conductor
          </Button>
        </div>

        {/* Card de la Tabla */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-lg font-medium">Conductores Activos</CardTitle>
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Buscar por nombre, DNI o equipo..."
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
                    <TableHead className="font-semibold">Conductor</TableHead>
                    <TableHead className="font-semibold">DNI</TableHead>
                    <TableHead className="font-semibold">Equipo</TableHead>
                    <TableHead className="font-semibold">Licencia</TableHead>
                    <TableHead className="font-semibold w-32">Estado</TableHead>
                    <TableHead className="text-right font-semibold w-24">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Cargando...
                      </TableCell>
                    </TableRow>
                  ) : filteredConductores.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        No hay resultados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredConductores.map((conductor) => {
                      const licenciaInfo = getLicenciaStatus(conductor.licenciaVencimiento);
                      
                      return (
                        <TableRow key={conductor.id} className="hover:bg-slate-50/50">
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-900">
                                {conductor.nombre} {conductor.apellido}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-slate-600">{conductor.dni}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-slate-600">{conductor.nombreEquipo}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm text-slate-900">
                                {formatDate(conductor.licenciaVencimiento)}
                              </span>
                              <span className={`text-xs ${licenciaInfo.color}`}>
                                {licenciaInfo.status === "vencida" 
                                  ? `Vencida hace ${licenciaInfo.days} días`
                                  : licenciaInfo.status === "próxima"
                                  ? `Vence en ${licenciaInfo.days} días`
                                  : `Vigente`}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getEstadoBadge(conductor.estado)}>
                              {conductor.estado}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Gestión</DropdownMenuLabel>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setConductorEnEstado(conductor);
                                    setNuevoEstado(conductor.estado);
                                  }}
                                >
                                  <RefreshCcw className="mr-2 h-4 w-4" /> Cambiar Estado
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MODAL: CREAR CONDUCTOR */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Nuevo Conductor</DialogTitle>
          </DialogHeader>
          <CreateConductorForm 
            onCancel={() => setIsModalOpen(false)}
            onSuccess={() => {
              setIsModalOpen(false);
              fetchConductores();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* MODAL: ACTUALIZAR ESTADO */}
      <Dialog open={!!conductorEnEstado} onOpenChange={() => setConductorEnEstado(null)}>
        <DialogContent className="sm:max-w-100">
          <DialogHeader>
            <DialogTitle>Actualizar Estado del Conductor</DialogTitle>
            <DialogDescription>
              Cambiando estado de <span className="font-semibold text-slate-900">
                {conductorEnEstado?.nombre} {conductorEnEstado?.apellido}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select 
              value={nuevoEstado} 
              onValueChange={(value) => setNuevoEstado(value as EstadoConductorType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                {estadosDisponibles.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConductorEnEstado(null)}>
              Cancelar
            </Button>
            <Button 
              disabled={!nuevoEstado || isUpdating} 
              onClick={handleUpdateEstado}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirmar Cambio"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
