import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, MoreHorizontal, UserCog, ShieldAlert, ArrowLeft,RefreshCw } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { maestrosService } from "@/api/services/maestroService";
import type { Usuario, RolUsuario } from "@/types/auth";

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

export default function UsuariosPage() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const data = await maestrosService.getUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error("Error fetching usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const filteredUsuarios = usuarios.filter(u => 
    `${u.nombre} ${u.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.mail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/personal")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h1>
            <p className="text-sm text-muted-foreground">Administra los accesos y roles del sistema.</p>
          </div>
        </div>
        <Button className="w-full md:w-auto gap-2">
          <Plus className="h-4 w-4" /> Nuevo Usuario
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Listado de Personal</CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Buscar por nombre o email..."
                className="pl-9 bg-slate-50/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-900">Usuario</TableHead>
                  <TableHead className="font-semibold text-slate-900">Rol</TableHead>
                  <TableHead className="font-semibold text-slate-900">Estado</TableHead>
                  <TableHead className="font-semibold text-slate-900 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={4} className="h-16 animate-pulse bg-slate-50/30" />
                    </TableRow>
                  ))
                ) : filteredUsuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      No se encontraron usuarios.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsuarios.map((user) => (
                    <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">{user.nombre} {user.apellido}</span>
                          <span className="text-xs text-slate-500">{user.mail}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`font-medium ${getRoleBadge(user.rol)}`}>
                          {user.rol}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.activo ? "default" : "secondary"} className={user.activo ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                          {user.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Operaciones</DropdownMenuLabel>
                            <DropdownMenuItem className="cursor-pointer">
                              <UserCog className="mr-2 h-4 w-4" /> Editar Perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <RefreshCw className="mr-2 h-4 w-4" /> Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className={`cursor-pointer ${user.activo ? 'text-destructive' : 'text-emerald-600'}`}
                            >
                              <ShieldAlert className="mr-2 h-4 w-4" />
                              {user.activo ? "Desactivar Cuenta" : "Activar Cuenta"}
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
  );
}