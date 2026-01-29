import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  ShieldAlert, 
  ArrowLeft,
  Key,
  Loader2
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
import type { Usuario, RolUsuario } from "@/types/auth";
import { CreateUserForm } from "@/components/CreateuserForm";

// Helper para colores de roles
const getRoleBadge = (rol: RolUsuario) => {
  const styles: Record<RolUsuario, string> = {
    ADMIN: "bg-red-100 text-red-700 border-red-200",
    SUPERVISOR: "bg-blue-100 text-blue-700 border-blue-200",
    ADMINISTRATIVO: "bg-slate-100 text-slate-700 border-slate-200",
    SUPERVISOR_PLANTA: "bg-indigo-100 text-indigo-700 border-indigo-200",
    TOTAL: "bg-purple-100 text-purple-700 border-purple-200",
  };
  return styles[rol] || "bg-gray-100 text-gray-700";
};

const getEstadoBadge = (activo: boolean) => {
  return activo
    ? "bg-green-100 text-green-700 border-green-200"
    : "bg-slate-100 text-slate-600 border-slate-200";
};

export default function UsuariosPage() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados para Control de Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuarioEnReset, setUsuarioEnReset] = useState<Usuario | null>(null);
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const myRole = useAuthStore((state) => state.user?.rol);
  const currentUser = useAuthStore((state) => state.user);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const data = await maestrosService.getUsuarios();
      setUsuarios(data);
      console.log(myRole);
    } catch (error) {
      console.error("Error fetching usuarios:", error);
      toast.error("No se pudo cargar la lista de usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Lógica de Desactivación (Baja Lógica)
  const handleDesactivar = async (user: Usuario) => {
    if (myRole !== 'ADMIN' && myRole !== 'TOTAL') {
      toast.error("No tienes permisos de administrador para esta acción.");
      return;
    }

    const confirmar = window.confirm(
      `¿ATENCIÓN: Estás seguro de desactivar a ${user.nombre} ${user.apellido}?\n\nEsta acción es irreversible y el usuario perderá acceso inmediato al sistema.`
    );
    
    if (confirmar) {
      try {
        await maestrosService.desactivarUsuario(user.id);
        toast.success("Cuenta desactivada permanentemente");
        fetchUsuarios();
      } catch (error) {
        toast.error("Error técnico al intentar desactivar la cuenta");
      }
    }
  };

  // Lógica de Reset de Password
  const handleResetPassword = async () => {
    if (!usuarioEnReset || nuevaPassword.length < 6) return;

    try {
      setIsResetting(true);
      await maestrosService.resetPassword(usuarioEnReset.id, nuevaPassword);
      toast.success(`Contraseña de ${usuarioEnReset.nombre} actualizada`);
      setUsuarioEnReset(null);
      setNuevaPassword("");
    } catch (error) {
      toast.error("Error al resetear la contraseña");
    } finally {
      setIsResetting(false);
    }
  };

  const filteredUsuarios = usuarios.filter(u => 
    `${u.nombre} ${u.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.mail.toLowerCase().includes(searchTerm.toLowerCase())
  );

return (
    <div className="container mx-auto px-4 py-6 animate-in fade-in duration-500">
      
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate("/personal")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gestión de Usuarios</h1>
              <p className="text-sm text-muted-foreground">Control de acceso y seguridad.</p>
            </div>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto gap-2" disabled={myRole !== 'ADMIN' && myRole !== 'TOTAL'}>
            <Plus className="h-4 w-4" /> Nuevo Usuario
          </Button>
        </div>

        {/* Card de la Tabla */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-lg font-medium">Usuarios Activos</CardTitle>
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Buscar..."
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
                    <TableHead className="font-semibold">Usuario</TableHead>
                    <TableHead className="font-semibold w-40">Rol</TableHead> {/* Ancho fijo estándar */}
                    <TableHead className="font-semibold w-32">Estado</TableHead>
                    <TableHead className="text-right font-semibold w-24">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={4} className="h-24 text-center">Cargando...</TableCell></TableRow>
                  ) : filteredUsuarios.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                        No hay resultados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsuarios.map((user) => (
                      <TableRow key={user.id} className="hover:bg-slate-50/50">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">{user.nombre} {user.apellido}</span>
                            <span className="text-xs text-muted-foreground">{user.mail}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getRoleBadge(user.rol)}>
                            {user.rol}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getEstadoBadge(user.activo)}>
                            {user.activo ? "ACTIVO" : "INACTIVO"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {user.activo ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Seguridad</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setUsuarioEnReset(user)}>
                                  <Key className="mr-2 h-4 w-4" /> Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  disabled={user.mail === currentUser?.email}
                                  onClick={() => handleDesactivar(user)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <ShieldAlert className="mr-2 h-4 w-4" /> Desactivar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span className="text-sm text-muted-foreground"></span>
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

      {/* MODAL: CREAR USUARIO */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Nuevo Usuario del Sistema</DialogTitle>
          </DialogHeader>
          <CreateUserForm 
            onCancel={() => setIsModalOpen(false)}
            onSuccess={() => {
              setIsModalOpen(false);
              fetchUsuarios();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* MODAL: RESET PASSWORD */}
      <Dialog open={!!usuarioEnReset} onOpenChange={() => setUsuarioEnReset(null)}>
        <DialogContent className="sm:max-w-100">
          <DialogHeader>
            <DialogTitle>Resetear Contraseña</DialogTitle>
            <DialogDescription>
              Estableciendo nueva clave para <span className="font-semibold text-slate-900">{usuarioEnReset?.nombre} {usuarioEnReset?.apellido}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              type="password" 
              placeholder="Nueva contraseña (min. 6 caracteres)" 
              value={nuevaPassword} 
              onChange={(e) => setNuevaPassword(e.target.value)} 
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setUsuarioEnReset(null)}>Cancelar</Button>
            <Button 
              disabled={nuevaPassword.length < 6 || isResetting} 
              onClick={handleResetPassword}
            >
              {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Reset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}