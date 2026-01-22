import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      {/* group/sidebar-wrapper es el ID que usa nuestro CSS para detectar el estado */}
      <div className="group/sidebar-wrapper flex min-h-screen w-full">
        
        <AppSidebar />
        
        <SidebarInset data-inset className="flex flex-col flex-1 min-w-0 bg-white">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white/80 backdrop-blur sticky top-0 z-10">
            <SidebarTrigger />
            <div className="h-4 w-px bg-gray-200 mx-2" />
            <h1 className="text-sm font-bold text-gray-900 tracking-tight">
              BEVERAGE ERP <span className="text-gray-400 font-normal">v2026</span>
            </h1>
          </header>

          <main className="flex-1 p-6 overflow-auto bg-slate-50/20">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}