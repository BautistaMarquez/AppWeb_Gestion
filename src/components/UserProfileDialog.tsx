import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import type { RolUsuario } from "@/types/auth";

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Función helper para obtener el color del badge según el rol
const getRoleBadgeVariant = (rol: RolUsuario): "default" | "secondary" | "destructive" | "outline" => {
  switch (rol) {
    case "ADMIN":
    case "TOTAL":
      return "destructive";
    case "SUPERVISOR":
    case "SUPERVISOR_PLANTA":
      return "default";
    case "ADMINISTRATIVO":
      return "secondary";
    default:
      return "outline";
  }
};

// Función helper para obtener el texto descriptivo del rol
const getRoleDescription = (rol: RolUsuario): string => {
  switch (rol) {
    case "ADMIN":
      return "Administrador del sistema";
    case "SUPERVISOR":
      return "Supervisor de operaciones";
    case "ADMINISTRATIVO":
      return "Personal administrativo";
    case "SUPERVISOR_PLANTA":
      return "Supervisor de planta";
    case "TOTAL":
      return "Acceso total al sistema";
    default:
      return rol;
  }
};

export default function UserProfileDialog({
  open,
  onOpenChange,
}: UserProfileDialogProps) {
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  // Extraer nombre y apellido del email si no están disponibles
  // En un caso real, estos datos vendrían del backend
  const emailParts = user.email.split("@");
  const displayName = emailParts[0] || user.email;
  const [nombre, apellido] = displayName.includes(".")
    ? displayName.split(".")
    : [displayName, ""];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Mi Perfil</DialogTitle>
          <DialogDescription>
            Información de tu cuenta de usuario
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-1 text-sm font-medium text-muted-foreground">
                Nombre:
              </div>
              <div className="col-span-3 text-sm">
                {nombre.charAt(0).toUpperCase() + nombre.slice(1)}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-1 text-sm font-medium text-muted-foreground">
                Apellido:
              </div>
              <div className="col-span-3 text-sm">
                {apellido
                  ? apellido.charAt(0).toUpperCase() + apellido.slice(1)
                  : "—"}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-1 text-sm font-medium text-muted-foreground">
                Email:
              </div>
              <div className="col-span-3 text-sm break-all">{user.email}</div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-1 text-sm font-medium text-muted-foreground">
                Rol:
              </div>
              <div className="col-span-3">
                <div className="flex items-center gap-2">
                  <Badge variant={getRoleBadgeVariant(user.rol)}>
                    {user.rol}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {getRoleDescription(user.rol)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
