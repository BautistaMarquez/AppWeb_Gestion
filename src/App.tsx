import './index.css'
import DashboardLayout from "./layouts/DashboardLayout";


function App() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Bienvenido al Dashboard</h2>
        <p className="text-muted-foreground">
          Selecciona una opción del menú lateral para comenzar la gestión.
        </p>
        
        {/* Aquí irán tus tablas de productos o formularios de viajes */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           {/* Mock de Cards informativas */}
           <div className="p-6 bg-card border rounded-xl shadow-sm">
              <p className="text-sm font-medium">Viajes en Proceso</p>
              <h3 className="text-2xl font-bold">12</h3>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default App;