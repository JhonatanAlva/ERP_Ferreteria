import { useEffect, useState } from "react";
import axios from "axios";

import ReportCard from "../components/ReportCard";
import ReportChart from "../components/ReportChart";

const Reports = () => {
  const [ventas, setVentas] = useState({});
  const [stock, setStock] = useState({});
  const [topProductos, setTopProductos] = useState([]);
  const [ventasPorDia, setVentasPorDia] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");

  const [recomendaciones, setRecomendaciones] = useState(null);

  const [filtro, setFiltro] = useState("mes");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const token = localStorage.getItem("token");

  // ===============================
  // RANGO DE FECHAS
  // ===============================
  const obtenerRango = () => {
    const hoy = new Date();
    let inicio, fin;

    if (filtro === "dia") {
      inicio = new Date(hoy);
      fin = new Date(hoy);
    }

    if (filtro === "semana") {
      const primerDia = new Date(hoy);
      primerDia.setDate(hoy.getDate() - hoy.getDay());
      inicio = primerDia;
      fin = new Date(hoy);
    }

    if (filtro === "mes") {
      inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      fin = new Date(hoy);
    }

    if (filtro === "personalizado") {
      if (!desde || !hasta) return null;
      inicio = new Date(desde);
      fin = new Date(hasta);
    }

    return {
      desde: inicio.toISOString().split("T")[0],
      hasta: fin.toISOString().split("T")[0],
    };
  };

  // ===============================
  // EXPORTAR
  // ===============================
  const exportarExcel = async () => {
    const API = import.meta.env.VITE_API_URL;
    const rango = obtenerRango();

    const res = await axios.get(
      `${API}/reportes/exportar/excel?desde=${rango.desde}&hasta=${rango.hasta}`,
      {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "reporte.xlsx");
    document.body.appendChild(link);
    link.click();
  };

  const exportarPDF = async () => {
    const API = import.meta.env.VITE_API_URL;
    const rango = obtenerRango();

    const res = await axios.get(
      `${API}/reportes/exportar/pdf?desde=${rango.desde}&hasta=${rango.hasta}`,
      {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "reporte.pdf");
    document.body.appendChild(link);
    link.click();
  };

  // ===============================
  // DATOS
  // ===============================
  const obtenerDatos = async () => {
    try {
      const API = import.meta.env.VITE_API_URL;
      const rango = obtenerRango();
      if (!rango) return;

      const headers = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const [
        ventasRes,
        stockRes,
        productosRes,
        ventasDiaRes,
        recomendacionesRes,
      ] = await Promise.all([
        axios.get(`${API}/reportes/ventas?desde=${rango.desde}&hasta=${rango.hasta}`, headers),
        axios.get(`${API}/reportes/stock`, headers),
        axios.get(`${API}/reportes/productos-mas-vendidos?categoria=${categoriaSeleccionada}`, headers),
        axios.get(`${API}/reportes/ventas-por-dia?desde=${rango.desde}&hasta=${rango.hasta}`, headers),
        axios.get(`${API}/reportes/recomendaciones`, headers),
      ]);

      setVentas(ventasRes.data);
      setStock(stockRes.data);
      setTopProductos(productosRes.data);
      setVentasPorDia(ventasDiaRes.data);
      setRecomendaciones(recomendacionesRes.data);
    } catch (error) {
      console.error("Error cargando reportes:", error);
    }
  };

  // ===============================
  // CATEGORÍAS
  // ===============================
  const obtenerCategorias = async () => {
    try {
      const API = import.meta.env.VITE_API_URL;

      const res = await axios.get(`${API}/api/categorias`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCategorias(res.data);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };

  useEffect(() => {
    if (!token) return;
    obtenerDatos();
    obtenerCategorias();
  }, [filtro, categoriaSeleccionada, token]);

  const filtroLabels = { dia: "Hoy", semana: "Semana", mes: "Mes" };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Análisis</p>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Reportes</h1>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportarExcel}
            className="inline-flex items-center gap-2 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors duration-150"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
            Excel
          </button>

          <button
            onClick={exportarPDF}
            className="inline-flex items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors duration-150"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            PDF
          </button>
        </div>
      </div>

      {/* FILTROS DE PERÍODO */}
      <div className="flex flex-wrap items-center gap-2">
        {["dia", "semana", "mes"].map((tipo) => (
          <button
            key={tipo}
            onClick={() => setFiltro(tipo)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-colors duration-150 ${
              filtro === tipo
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {filtroLabels[tipo]}
          </button>
        ))}

        <button
          onClick={() => setFiltro("personalizado")}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-colors duration-150 ${
            filtro === "personalizado"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
        >
          Personalizado
        </button>

        {/* FECHAS PERSONALIZADAS */}
        {filtro === "personalizado" && (
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <span className="text-gray-400 text-xs font-semibold">hasta</span>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={obtenerDatos}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              Aplicar
            </button>
          </div>
        )}
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Ventas */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ventas</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600">Q {ventas.total_vendido || 0}</p>
          <p className="text-xs text-gray-400 mt-1">{ventas.total_ventas || 0} transacciones</p>
        </div>

        {/* Productos */}
        <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Productos</p>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600">{stock.total_productos || 0}</p>
          <p className="text-xs text-gray-400 mt-1">{stock.stock_bajo || 0} con stock bajo</p>
        </div>

        {/* Sin stock */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sin stock</p>
            <div className="w-8 h-8 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
            </div>
          </div>
          <p className="text-3xl font-black text-red-600">{stock.sin_stock || 0}</p>
          <p className="text-xs text-gray-400 mt-1">Productos agotados</p>
        </div>

        {/* Producto top */}
        <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Top producto</p>
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
          </div>
          <p className="text-lg font-black text-blue-600 truncate">{topProductos[0]?.nombre || "—"}</p>
          <p className="text-xs text-gray-400 mt-1">{topProductos[0]?.total_vendido || 0} unidades vendidas</p>
        </div>
      </div>

      {/* ANÁLISIS INTELIGENTE */}
      {recomendaciones && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <h3 className="text-base font-bold text-gray-700 uppercase tracking-widest">Análisis inteligente</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider">Reposición crítica</h4>
              </div>
              {recomendaciones.critico.map((p, i) => (
                <p key={i} className="text-sm text-red-700 py-0.5">{p.nombre}</p>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider">Stock bajo</h4>
              </div>
              {recomendaciones.bajo.map((p, i) => (
                <p key={i} className="text-sm text-amber-700 py-0.5">{p.nombre} <span className="text-amber-400">({p.stock})</span></p>
              ))}
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                </svg>
                <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Alta rotación</h4>
              </div>
              {recomendaciones.recomendados.map((p, i) => (
                <p key={i} className="text-sm text-emerald-700 py-0.5">{p.nombre}</p>
              ))}
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Sin rotación</h4>
              </div>
              {recomendaciones.sinMovimiento.map((p, i) => (
                <p key={i} className="text-sm text-gray-600 py-0.5">{p.nombre}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GRÁFICA */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-gray-700 uppercase tracking-widest mb-4">Ventas por día</h3>
        <ReportChart
          title="Ventas por día"
          data={ventasPorDia.map((v) => ({
            ...v,
            fecha: new Date(v.fecha).toLocaleDateString(),
          }))}
          dataKey="total"
          xKey="fecha"
        />
      </div>

      {/* TABLA TOP PRODUCTOS */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-700 uppercase tracking-widest">Productos más vendidos</h3>

          <select
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cantidad</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ingresos</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {topProductos.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-gray-400 text-sm">
                  No hay datos para el período seleccionado
                </td>
              </tr>
            ) : (
              topProductos.map((p, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors duration-100">
                  <td className="px-6 py-3.5">
                    <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                  </td>
                  <td className="px-6 py-3.5 text-sm font-semibold text-gray-800">{p.nombre}</td>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center bg-blue-50 text-blue-600 border border-blue-100 text-xs font-bold px-2.5 py-1 rounded-lg">
                      {p.total_vendido} uds.
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-sm font-black text-emerald-600">Q {p.ingresos}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Reports;