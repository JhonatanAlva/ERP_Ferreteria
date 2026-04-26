import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import { useState, useEffect } from "react";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Products from "./pages/Products";
import PosSessions from "./pages/PosSessions";
import Sales from "./pages/Sales";
import PaymentScreen from "./pages/PaymentScreen";
import Receipt from "./pages/Receipt";
import SalesSessionDetail from "./pages/SalesSessionDetail";
import ClientCredits from "./pages/ClientCredits";
import Users from "./pages/Users";
import Reports from "./pages/Reports";

import { PosProvider } from "./context/PosContext";

function Layout() {
  const location = useLocation();

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  useEffect(() => {
    const handleStorage = () => {
      setUser(JSON.parse(localStorage.getItem("user")));
    };

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const hideNavbar =
    location.pathname === "/" ||
    location.pathname.startsWith("/sales/pos") ||
    location.pathname.startsWith("/sales/payment") ||
    location.pathname.startsWith("/sales/receipt");

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* DASHBOARD */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* REPORTES */}
        <Route
          path="/reports"
          element={
            user?.role_id === 1 || user?.role_id === 2 ? (
              <Reports />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />

        {/* CLIENTES */}
        <Route
          path="/clients"
          element={
            user?.role_id === 1 || user?.role_id === 2 ? (
              <Clients />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />

        <Route
          path="/clients/:id/creditos"
          element={
            user?.role_id === 1 || user?.role_id === 2 ? (
              <ClientCredits />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />

        {/* PRODUCTOS */}
        <Route
          path="/products"
          element={
            user?.role_id === 1 || user?.role_id === 2 ? (
              <Products />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />

        {/* USUARIOS */}
        <Route
          path="/users"
          element={
            user?.role_id === 1 ? <Users /> : <Navigate to="/dashboard" />
          }
        />

        {/* VENTAS */}
        <Route path="/sales" element={<PosSessions />} />
        <Route path="/sales/pos/:id" element={<Sales />} />
        <Route path="/sales/payment/:id" element={<PaymentScreen />} />
        <Route path="/sales/receipt/:id" element={<Receipt />} />
        <Route path="/sales/session/:id" element={<SalesSessionDetail />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <PosProvider>
        <Layout />
      </PosProvider>
    </BrowserRouter>
  );
}

export default App;