import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();

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
        `${import.meta.env.VITE_API_URL}/api/productos`,
      );

      const resClientes = await axios.get(
        `${import.meta.env.VITE_API_URL}/clients`,
      );

      const productos = resProductos.data;
      const clientes = resClientes.data;

      const stockBajo = productos.filter(
        (p) => p.stock <= p.stock_minimo && p.stock > 0,
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
          {
            name: "Clientes",
            icon: "👥",
            route: "/clients",
          },
          {
            name: "Productos",
            icon: "📦",
            route: "/products",
          },
          {
            name: "Reportes",
            icon: "📊",
            route: "/reports",
          }
        ]
      : []),

    {
      name: "Ventas",
      icon: "💰",
      route: "/sales",
    },

    ...(user?.role_id === 1
      ? [
          {
            name: "Usuarios",
            icon: "👤",
            route: "/users",
          },
        ]
      : []),
  ];

  return (
    <div className="p-8 space-y-8">
      {/* TITULO */}
      <h1 className="text-3xl font-bold">Bienvenido, Aceitera Rodriguez</h1>

      {/* TARJETAS DE ESTADISTICAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-xl p-6">
          <p className="text-gray-500 text-sm">Clientes</p>

          <h2 className="text-3xl font-bold">{stats.clientes}</h2>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <p className="text-gray-500 text-sm">Productos</p>

          <h2 className="text-3xl font-bold">{stats.productos}</h2>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <p className="text-gray-500 text-sm">⚠ Stock bajo</p>

          <h2 className="text-3xl font-bold text-yellow-600">
            {stats.stockBajo}
          </h2>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <p className="text-gray-500 text-sm">⛔ Sin stock</p>

          <h2 className="text-3xl font-bold text-red-600">{stats.sinStock}</h2>
        </div>
      </div>

      {/* ALERTAS DEL SISTEMA */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">🔔 Alertas del sistema</h2>

        <div className="space-y-2">
          <p className="text-yellow-600">
            ⚠ {stats.stockBajo} productos con stock bajo
          </p>

          <p className="text-red-600">
            ⛔ {stats.sinStock} productos sin stock
          </p>
        </div>
      </div>

      {/* MODULOS */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Módulos del sistema</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {modules.map((module, index) => (
            <div
              key={index}
              onClick={() => navigate(module.route)}
              className="bg-white shadow-md rounded-xl p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition text-center"
            >
              <div className="text-4xl mb-3">{module.icon}</div>

              <h2 className="font-semibold text-lg">{module.name}</h2>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;