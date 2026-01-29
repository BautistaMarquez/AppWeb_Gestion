import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  ArrowLeft,
  Loader2,
  Users,
  Eye,
  UserPlus,
  UserCog,
  UserMinus
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
import type { Equipo, EquipoDetalle, Conductor } from "@/types/maestros";
import type { Usuario } from "@/types/auth";
import { CreateEquipoForm } from "@/components/CreateEquipoForm";

type ModalType = 'crear' | 'detalle' | 'asignarSupervisor' | 'asignarConductor' | 'desasignarConductor' | null;

export default function EquiposPage() {
  const navigate = useNavigate();
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados para Control de Modales
  const [modalType, setModalType] = useState<ModalType>(null);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<Equipo | null>(null);
  const [equipoDetalle, setEquipoDetalle] = useState<EquipoDetalle | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estados para Asignaciones
  const [supervisores, setSupervisores] = useState<Usuario[]>([]);
  const [conductoresDisponibles, setConductoresDisponibles] = useState<Conductor[]>([]);
  const [conductoresAsignados, setConductoresAsignados] = useState<Conductor[]>([]);
  const [supervisorSeleccionado, setSupervisorSeleccionado] = useState<string>("");
  const [conductorSeleccionado, setConductorSeleccionado] = useState<string>("");
  const [conductorDesasignarSeleccionado, setConductorDesasignarSeleccionado] = useState<string>("");

  const myRole = useAuthStore((state) => state.user?.rol);

  const fetchEquipos = async () => {
    try {
      setLoading(true);
      const data = await maestrosService.getEquipos();
      setEquipos(data);
    } catch (error) {
      console.error("Error fetching equipos:", error);
      toast.error("No se pudo cargar la lista de equipos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipos();
  }, []);

  // Ver detalle del equipo
  const handleVerDetalle = async (equipo: Equipo) => {
    try {
      setIsProcessing(true);
      const detalle = await maestrosService.getEquipoDetalle(equipo.id);
      setEquipoDetalle(detalle);
      setEquipoSeleccionado(equipo);
      setModalType('detalle');
    } catch (error) {
      toast.error("Error al cargar el detalle del equipo");
    } finally {
      setIsProcessing(false);
    }
  };

  // Abrir modal de asignar supervisor
  const handleAbrirAsignarSupervisor = async (equipo: Equipo) => {
    try {
      setIsProcessing(true);
      const data = await maestrosService.getSupervisores();
      setSupervisores(data);
      setEquipoSeleccionado(equipo);
      setSupervisorSeleccionado("");
      setModalType('asignarSupervisor');
    } catch (error) {
      toast.error("Error al cargar supervisores");
    } finally {
      setIsProcessing(false);
    }
  };

  // Abrir modal de asignar conductor
  const handleAbrirAsignarConductor = async (equipo: Equipo) => {
    try {
      setIsProcessing(true);
      const data = await maestrosService.getConductoresDisponibles();
      setConductoresDisponibles(data);
      setEquipoSeleccionado(equipo);
      setConductorSeleccionado("");
      setModalType('asignarConductor');
    } catch (error) {
      toast.error("Error al cargar conductores");
    } finally {
      setIsProcessing(false);
    }
  };

  // Abrir modal de desasignar conductor
  const handleAbrirDesasignarConductor = async (equipo: Equipo) => {
    try {
      setIsProcessing(true);
      const detalle = await maestrosService.getEquipoDetalle(equipo.id);
      setConductoresAsignados(detalle.conductores || []);
      setEquipoSeleccionado(equipo);
      setConductorDesasignarSeleccionado("");
      setModalType('desasignarConductor');
    } catch (error) {
      toast.error("Error al cargar conductores del equipo");
    } finally {
      setIsProcessing(false);
    }
  };

  // Asignar supervisor
  const handleAsignarSupervisor = async () => {
    if (!equipoSeleccionado || !supervisorSeleccionado) return;

    try {
      setIsProcessing(true);
      await maestrosService.asignarSupervisor(
        equipoSeleccionado.id, 
        parseInt(supervisorSeleccionado)
      );
      toast.success("Supervisor asignado exitosamente");
      setModalType(null);
      setSupervisorSeleccionado("");
      fetchEquipos();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Error al asignar supervisor";
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Asignar conductor
  const handleAsignarConductor = async () => {
    if (!equipoSeleccionado || !conductorSeleccionado) return;

    try {
      setIsProcessing(true);
      await maestrosService.asignarConductor(
        equipoSeleccionado.id, 
        parseInt(conductorSeleccionado)
      );
      toast.success("Conductor asignado al equipo exitosamente");
      setModalType(null);
      setConductorSeleccionado("");
      fetchEquipos();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Error al asignar conductor";
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Desasignar conductor
  const handleDesasignarConductor = async () => {
    if (!equipoSeleccionado || !conductorDesasignarSeleccionado) return;

    try {
      setIsProcessing(true);
      await maestrosService.desasignarConductor(
        equipoSeleccionado.id,
        parseInt(conductorDesasignarSeleccionado)
      );
      toast.success("Conductor desasignado del equipo");
      setConductorDesasignarSeleccionado("");

      const detalleActualizado = await maestrosService.getEquipoDetalle(equipoSeleccionado.id);
      setEquipoDetalle(detalleActualizado);
      setConductoresAsignados(detalleActualizado.conductores || []);

      fetchEquipos();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Error al desasignar conductor";
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredEquipos = equipos.filter(e => 
    e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.supervisorNombreCompleto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const closeModal = () => {
    setModalType(null);
    setEquipoSeleccionado(null);
    setEquipoDetalle(null);
    setSupervisorSeleccionado("");
    setConductorSeleccionado("");
    setConductorDesasignarSeleccionado("");
    setConductoresAsignados([]);
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
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gestión de Equipos</h1>
              <p className="text-sm text-muted-foreground">Conformación de equipos de trabajo y asignaciones.</p>
            </div>
          </div>
          <Button 
            onClick={() => setModalType('crear')} 
            className="w-full md:w-auto gap-2" 
            disabled={myRole !== 'ADMIN' && myRole !== 'TOTAL' && myRole !== 'ADMINISTRATIVO'}
          >
            <Plus className="h-4 w-4" /> Nuevo Equipo
          </Button>
        </div>

        {/* Card de la Tabla */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-lg font-medium">Equipos de Trabajo</CardTitle>
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Buscar por equipo o supervisor..."
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
                    <TableHead className="font-semibold">Equipo</TableHead>
                    <TableHead className="font-semibold">Supervisor</TableHead>
                    <TableHead className="text-right font-semibold w-24">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        Cargando...
                      </TableCell>
                    </TableRow>
                  ) : filteredEquipos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                        No hay resultados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEquipos.map((equipo) => (
                      <TableRow key={equipo.id} className="hover:bg-slate-50/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-slate-500" />
                            <span className="font-medium text-slate-900">{equipo.nombre}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                              {equipo.supervisorNombreCompleto}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel>Gestión de Equipo</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleVerDetalle(equipo)}>
                                <Eye className="mr-2 h-4 w-4" /> Ver Detalle
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleAbrirAsignarSupervisor(equipo)}>
                                <UserCog className="mr-2 h-4 w-4" /> Cambiar Supervisor
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAbrirAsignarConductor(equipo)}>
                                <UserPlus className="mr-2 h-4 w-4" /> Asignar Conductor
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAbrirDesasignarConductor(equipo)}>
                                <UserMinus className="mr-2 h-4 w-4" /> Desasignar Conductor
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* MODAL: CREAR EQUIPO */}
      <Dialog open={modalType === 'crear'} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Nuevo Equipo de Trabajo</DialogTitle>
          </DialogHeader>
          <CreateEquipoForm 
            onCancel={closeModal}
            onSuccess={() => {
              closeModal();
              fetchEquipos();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* MODAL: VER DETALLE */}
      <Dialog open={modalType === 'detalle'} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle del Equipo: {equipoDetalle?.nombre}</DialogTitle>
          </DialogHeader>
          {equipoDetalle && (
            <div className="space-y-4">
              {/* Supervisor */}
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Supervisor a Cargo</h3>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-600 text-white">
                    {equipoDetalle.supervisor.nombre} {equipoDetalle.supervisor.apellido}
                  </Badge>
                  <span className="text-xs text-slate-500">{equipoDetalle.supervisor.mail}</span>
                </div>
              </div>

              {/* Conductores */}
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Conductores Asignados ({equipoDetalle.conductores.length})
                </h3>
                {equipoDetalle.conductores.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No hay conductores asignados a este equipo
                  </p>
                ) : (
                  <div className="space-y-2">
                    {equipoDetalle.conductores.map((conductor) => (
                      <div 
                        key={conductor.id} 
                        className="flex items-center justify-between p-2 rounded bg-slate-50"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {conductor.nombre} {conductor.apellido}
                          </span>
                          <span className="text-xs text-slate-500">DNI: {conductor.dni}</span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={
                            conductor.estado === 'DISPONIBLE' 
                              ? 'bg-green-100 text-green-700' 
                              : conductor.estado === 'OCUPADO'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-red-100 text-red-700'
                          }
                        >
                          {conductor.estado}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: ASIGNAR SUPERVISOR */}
      <Dialog open={modalType === 'asignarSupervisor'} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Asignar o Cambiar Supervisor</DialogTitle>
            <DialogDescription>
              Equipo: <span className="font-semibold text-slate-900">{equipoSeleccionado?.nombre}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={supervisorSeleccionado} onValueChange={setSupervisorSeleccionado}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un supervisor" />
              </SelectTrigger>
              <SelectContent>
                {supervisores.length === 0 ? (
                  <div className="p-2 text-sm text-slate-500">
                    No hay supervisores disponibles
                  </div>
                ) : (
                  supervisores.map((supervisor) => (
                    <SelectItem key={supervisor.id} value={supervisor.id.toString()}>
                      {supervisor.nombre} {supervisor.apellido} - {supervisor.rol}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button 
              disabled={!supervisorSeleccionado || isProcessing} 
              onClick={handleAsignarSupervisor}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirmar Asignación"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: ASIGNAR CONDUCTOR */}
      <Dialog open={modalType === 'asignarConductor'} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Asignar Conductor al Equipo</DialogTitle>
            <DialogDescription>
              Equipo: <span className="font-semibold text-slate-900">{equipoSeleccionado?.nombre}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={conductorSeleccionado} onValueChange={setConductorSeleccionado}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un conductor" />
              </SelectTrigger>
              <SelectContent>
                {conductoresDisponibles.length === 0 ? (
                  <div className="p-2 text-sm text-slate-500">
                    No hay conductores disponibles
                  </div>
                ) : (
                  conductoresDisponibles.map((conductor) => (
                    <SelectItem key={conductor.id} value={conductor.id.toString()}>
                      {conductor.nombre} {conductor.apellido} - DNI: {conductor.dni}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button 
              disabled={!conductorSeleccionado || isProcessing} 
              onClick={handleAsignarConductor}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirmar Asignación"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: DESASIGNAR CONDUCTOR */}
      <Dialog open={modalType === 'desasignarConductor'} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Desasignar Conductor del Equipo</DialogTitle>
            <DialogDescription>
              Equipo: <span className="font-semibold text-slate-900">{equipoSeleccionado?.nombre}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={conductorDesasignarSeleccionado} onValueChange={setConductorDesasignarSeleccionado}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un conductor" />
              </SelectTrigger>
              <SelectContent>
                {conductoresAsignados.length === 0 ? (
                  <div className="p-2 text-sm text-slate-500">
                    No hay conductores asignados a este equipo
                  </div>
                ) : (
                  conductoresAsignados.map((conductor) => (
                    <SelectItem key={conductor.id} value={conductor.id.toString()}>
                      {conductor.nombre} {conductor.apellido} - DNI: {conductor.dni}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button 
              disabled={!conductorDesasignarSeleccionado || isProcessing} 
              onClick={handleDesasignarConductor}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirmar Desasignación"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
