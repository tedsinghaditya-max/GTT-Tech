import { useContext, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { http } from "./api/http";
import { AuthContext } from "./context/AuthContext";
import { AppShell } from "./components/layout/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { BusesPage } from "./pages/BusesPage";
import { DieselPage } from "./pages/DieselPage";
import { DriversPage } from "./pages/DriversPage";
import { ProblemBusesPage } from "./pages/ProblemBusesPage";

function ProtectedApp() {
  const { user, logout } = useContext(AuthContext);
  const [dashboard, setDashboard] = useState({ metrics: [], recentAlerts: [], profitBreakdown: {} });
  const [buses, setBuses] = useState([]);
  const [busProfits, setBusProfits] = useState([]);
  const [dieselEntries, setDieselEntries] = useState([]);
  const [dieselAverages, setDieselAverages] = useState([]);
  const [dieselAlerts, setDieselAlerts] = useState([]);
  const [fleetAlerts, setFleetAlerts] = useState([]);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    Promise.all([
      http.get("/dashboard"),
      http.get("/buses"),
      http.get("/profits/monthly"),
      http.get("/alerts"),
      http.get("/diesel"),
      http.get("/drivers")
    ])
      .then(([dashboardData, busData, profitData, alertsData, dieselData, driverData]) => {
        setDashboard(dashboardData);
        setBuses(busData.items || []);
        setBusProfits(profitData.items || []);
        setFleetAlerts(alertsData.items || []);
        setDieselEntries(dieselData.items || []);
        setDieselAverages(dieselData.averages || []);
        setDieselAlerts(dieselData.alerts || []);
        setDrivers(driverData.items || []);
      })
      .catch((error) => {
        console.error("Failed to load dashboard data", error);
      });
  }, []);

  async function handleQuickDieselEntry(payload) {
    await http.post("/diesel/quick", payload);
    const dieselData = await http.get("/diesel");
    setDieselEntries(dieselData.items || []);
    setDieselAverages(dieselData.averages || []);
    setDieselAlerts(dieselData.alerts || []);
  }

  return (
    <BrowserRouter>
      <AppShell user={user} onLogout={logout}>
        <Routes>
          <Route path="/" element={<DashboardPage dashboard={dashboard} />} />
          <Route path="/buses" element={<BusesPage buses={buses} profits={busProfits} />} />
          <Route
            path="/problem-buses"
            element={<ProblemBusesPage alerts={fleetAlerts} />}
          />
          <Route
            path="/diesel"
            element={
              <DieselPage
                entries={dieselEntries}
                averages={dieselAverages}
                alerts={dieselAlerts}
                onQuickAdd={handleQuickDieselEntry}
              />
            }
          />
          <Route path="/drivers" element={<DriversPage drivers={drivers} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default function App() {
  const { isAuthenticated, loading, login, signup } = useContext(AuthContext);

  if (loading) {
    return <div className="status-screen">Loading workspace...</div>;
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} onSignup={signup} />;
  }

  return <ProtectedApp />;
}
