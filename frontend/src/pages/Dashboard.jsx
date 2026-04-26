import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();

  const [fecha] = useState(() => {
    return new Date().toLocaleDateString("es-GT", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  const [stats, setStats] = useState({
    clientes: 0,
    productos: 0,
    stockBajo: 0,
    sinStock: 0,
  });

  useEffect(() => {
    cargarStats();
  }, []);

  const cargarStats = async () => {
    try {
      const resProductos = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/productos`
      );
      const resClientes = await axios.get(
        `${import.meta.env.VITE_API_URL}/clients`
      );

      const productos = resProductos.data;
      const clientes = resClientes.data;

      const stockBajo = productos.filter(
        (p) => p.stock <= p.stock_minimo && p.stock > 0
      ).length;
      const sinStock = productos.filter((p) => p.stock === 0).length;

      setStats({
        clientes: clientes.length,
        productos: productos.length,
        stockBajo,
        sinStock,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const user = JSON.parse(localStorage.getItem("user"));

  const modules = [
    ...(user?.role_id !== 3
      ? [
          { name: "Clientes", icon: "👥", route: "/clients", color: "from-blue-500 to-blue-600" },
          { name: "Productos", icon: "📦", route: "/products", color: "from-violet-500 to-violet-600" },
          { name: "Reportes", icon: "📊", route: "/reports", color: "from-emerald-500 to-emerald-600" },
        ]
      : []),
    { name: "Ventas", icon: "💰", route: "/sales", color: "from-amber-500 to-amber-600" },
    ...(user?.role_id === 1
      ? [{ name: "Usuarios", icon: "👤", route: "/users", color: "from-rose-500 to-rose-600" }]
      : []),
  ];

  const statCards = [
    {
      label: "Clientes",
      value: stats.clientes,
      icon: "👥",
      bg: "bg-white",
      border: "border-blue-100",
      accent: "text-blue-600",
      dot: "bg-blue-500",
    },
    {
      label: "Productos",
      value: stats.productos,
      icon: "📦",
      bg: "bg-white",
      border: "border-violet-100",
      accent: "text-violet-600",
      dot: "bg-violet-500",
    },
    {
      label: "Stock bajo",
      value: stats.stockBajo,
      icon: "⚠️",
      bg: "bg-amber-50",
      border: "border-amber-200",
      accent: "text-amber-600",
      dot: "bg-amber-400",
    },
    {
      label: "Sin stock",
      value: stats.sinStock,
      icon: "⛔",
      bg: "bg-red-50",
      border: "border-red-200",
      accent: "text-red-600",
      dot: "bg-red-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 space-y-8">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-1">Panel principal</p>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            Aceitera <span className="text-blue-600">Rodriguez</span>
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm text-sm text-gray-500 capitalize">
          📅 {fecha}
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`${card.bg} border ${card.border} rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{card.label}</span>
              <span className={`w-2 h-2 rounded-full ${card.dot}`}></span>
            </div>
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-black ${card.accent}`}>{card.value}</span>
              <span className="text-xl mb-1">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ALERTAS */}
      {(stats.stockBajo > 0 || stats.sinStock > 0) && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🔔</span>
            <h2 className="text-base font-bold text-gray-700 tracking-tight">Alertas del sistema</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {stats.stockBajo > 0 && (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex-1">
                <span className="text-amber-500 text-xl">⚠️</span>
                <div>
                  <p className="text-xs text-amber-400 font-medium uppercase tracking-wide">Stock bajo</p>
                  <p className="text-amber-700 font-semibold text-sm">
                    {stats.stockBajo} producto{stats.stockBajo !== 1 ? "s" : ""} requiere atención
                  </p>
                </div>
              </div>
            )}
            {stats.sinStock > 0 && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex-1">
                <span className="text-red-500 text-xl">⛔</span>
                <div>
                  <p className="text-xs text-red-400 font-medium uppercase tracking-wide">Sin stock</p>
                  <p className="text-red-700 font-semibold text-sm">
                    {stats.sinStock} producto{stats.sinStock !== 1 ? "s" : ""} agotado{stats.sinStock !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MÓDULOS */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-700 uppercase tracking-widest">Módulos</h2>
          <div className="h-px flex-1 bg-gray-200 ml-4"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {modules.map((module, index) => (
            <button
              key={index}
              onClick={() => navigate(module.route)}
              className="group relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-center overflow-hidden"
            >
              {/* Accent bar top */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${module.color} opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-t-2xl`}></div>

              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
                {module.icon}
              </div>
              <h3 className="font-bold text-gray-700 text-sm tracking-wide uppercase">
                {module.name}
              </h3>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;