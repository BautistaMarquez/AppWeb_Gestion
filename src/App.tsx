import './index.css'
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./components/DashboardHome";


function App() {
  return (
    <DashboardLayout>
      <DashboardHome />
    </DashboardLayout>
  );
}

export default App;