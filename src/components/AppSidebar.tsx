import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { User, Key, LogOut, ChevronUp } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
  useSidebar, // Hook necesario para detectar el estado colapsado
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/hooks/useAuth";
import { MODULES_CONFIG } from "@/config/navigation";
import UserProfileDialog from "@/components/UserProfileDialog";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export function AppSidebar() {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const location = useLocation();
  const { state } = useSidebar(); // Obtiene 'expanded' o 'collapsed'
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const isCollapsed = state === "collapsed";

  const visibleModules = useMemo(() => {
    if (!user?.rol) return [];
    return MODULES_CONFIG.filter((m) => m.allowedRoles.includes(user.rol));
  }, [user?.rol]);

  const operacionesModules = visibleModules.filter(m => m.group === "operaciones");
  const maestrosModules = visibleModules.filter(m => m.group === "maestros");

  const displayName = user?.email.split("@")[0] || "Usuario";
  const userName = displayName.includes(".") ? displayName.split(".")[0] : displayName;

  return (
    <>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="h-16 border-b flex items-center px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-800 text-white font-bold text-sm">
              B
            </div>
            {!isCollapsed && (
              <span className="font-semibold text-slate-900 truncate animate-in fade-in duration-300">
                Bebidas ERP
              </span>
            )}
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          {/* GRUPO: OPERACIONES */}
          {operacionesModules.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>Operaciones</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {operacionesModules.map((module) => (
                    <SidebarMenuItem key={module.id}>
                      <SidebarMenuButton 
                        tooltip={module.title} 
                        asChild 
                        isActive={location.pathname === module.routeFront}
                      >
                        <Link to={module.routeFront}>
                          <module.icon />
                          <span>{module.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* GRUPO: MAESTROS */}
          {maestrosModules.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>Maestros</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {maestrosModules.map((module) => (
                    <SidebarMenuItem key={module.id}>
                      <SidebarMenuButton 
                        tooltip={module.title} 
                        asChild
                        isActive={location.pathname === module.routeFront}
                      >
                        <Link to={module.routeFront}>
                          <module.icon />
                          <span>{module.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter className="border-t p-2">
          {/* Si está colapsado, solo mostramos el avatar sin dropdown para cumplir tu regla */}
          {user && isCollapsed ? (
            <div className="flex h-10 w-full items-center justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-semibold shadow-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          ) : user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-slate-100 transition-colors focus:outline-none">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-semibold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-1 flex-col items-start overflow-hidden text-left">
                    <span className="truncate text-sm font-medium w-full">
                      {userName.charAt(0).toUpperCase() + userName.slice(1)}
                    </span>
                    <span className="truncate text-xs text-muted-foreground w-full">
                      {user.email}
                    </span>
                  </div>
                  <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                align="end"
                side="top"
              >
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Mi Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsChangePasswordOpen(true)}>
                  <Key className="mr-2 h-4 w-4" />
                  <span>Cambiar Contraseña</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </SidebarFooter>
      </Sidebar>

      <UserProfileDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} />
      <ChangePasswordForm open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen} />
    </>
  );
}