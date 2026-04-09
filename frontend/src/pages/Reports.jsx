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
  // EXPORTAR (placeholder)
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
        axios.get(
          `${API}/reportes/ventas?desde=${rango.desde}&hasta=${rango.hasta}`,
          headers,
        ),
        axios.get(`${API}/reportes/stock`, headers),
        axios.get(
          `${API}/reportes/productos-mas-vendidos?categoria=${categoriaSeleccionada}`,
          headers,
        ),
        axios.get(
          `${API}/reportes/ventas-por-dia?desde=${rango.desde}&hasta=${rango.hasta}`,
          headers,
        ),
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

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Reportes del Sistema</h2>

        <div className="flex gap-3">
          <button
            onClick={exportarExcel}
            className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
          >
            Excel
          </button>

          <button
            onClick={exportarPDF}
            className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700"
          >
            PDF
          </button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex gap-3 mb-6">
        {["dia", "semana", "mes"].map((tipo) => (
          <button
            key={tipo}
            onClick={() => setFiltro(tipo)}
            className={`px-4 py-2 rounded ${
              filtro === tipo ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {tipo.toUpperCase()}
          </button>
        ))}

        <button
          onClick={() => setFiltro("personalizado")}
          className={`px-4 py-2 rounded ${
            filtro === "personalizado"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Personalizado
        </button>
      </div>

      {/* FECHAS */}
      {filtro === "personalizado" && (
        <div className="flex gap-3 mb-6">
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="border p-2 rounded"
          />
          <button
            onClick={obtenerDatos}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Aplicar
          </button>
        </div>
      )}

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ReportCard
          title="Ventas"
          value={`Q ${ventas.total_vendido || 0}`}
          subtitle={`${ventas.total_ventas || 0} ventas`}
          color="green"
        />
        <ReportCard
          title="Productos"
          value={stock.total_productos || 0}
          subtitle={`${stock.stock_bajo || 0} con stock bajo`}
          color="yellow"
        />
        <ReportCard
          title="Sin Stock"
          value={stock.sin_stock || 0}
          subtitle="Productos agotados"
          color="red"
        />

        {/* NUEVO KPI */}
        <ReportCard
          title="Producto Top"
          value={topProductos[0]?.nombre || "-"}
          subtitle={`${topProductos[0]?.total_vendido || 0} vendidos`}
          color="blue"
        />
      </div>

      {/* ANALISIS INTELIGENTE */}
      {recomendaciones && (
        <div className="mt-8 bg-white p-6 rounded shadow">
          <h3 className="font-semibold mb-4">Análisis inteligente</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-100 border-l-4 border-red-500 p-3 rounded">
              <h4 className="font-semibold text-red-700">Reposición crítica</h4>
              {recomendaciones.critico.map((p, i) => (
                <p key={i}>{p.nombre}</p>
              ))}
            </div>

            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded">
              <h4 className="font-semibold text-yellow-700">Stock bajo</h4>
              {recomendaciones.bajo.map((p, i) => (
                <p key={i}>
                  {p.nombre} ({p.stock})
                </p>
              ))}
            </div>

            <div className="bg-green-100 border-l-4 border-green-500 p-3 rounded">
              <h4 className="font-semibold text-green-700">Alta rotación</h4>
              {recomendaciones.recomendados.map((p, i) => (
                <p key={i}>{p.nombre}</p>
              ))}
            </div>

            <div className="bg-gray-100 border-l-4 border-gray-500 p-3 rounded">
              <h4 className="font-semibold text-gray-700">Sin rotación</h4>
              {recomendaciones.sinMovimiento.map((p, i) => (
                <p key={i}>{p.nombre}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GRAFICA */}
      <div className="mt-8">
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

      {/* CATEGORIA */}
      <div className="mt-6">
        <select
          value={categoriaSeleccionada}
          onChange={(e) => setCategoriaSeleccionada(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* TABLA */}
      <div className="mt-4 bg-white p-6 rounded shadow">
        <h3 className="font-semibold mb-3">Productos más vendidos</h3>

        <table className="w-full">
          <thead>
            <tr className="text-gray-500 border-b">
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Ingresos</th>
            </tr>
          </thead>

          <tbody>
            {topProductos.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">
                  No hay datos
                </td>
              </tr>
            ) : (
              topProductos.map((p, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td>{p.nombre}</td>
                  <td>{p.total_vendido}</td>
                  <td className="text-green-600 font-semibold">
                    Q {p.ingresos}
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
