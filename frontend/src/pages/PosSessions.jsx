import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast from "react-hot-toast";
import OpenSessionModal from "../components/OpenSessionModal";

function PosSessions() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [searchDate, setSearchDate] = useState("");

  const [paginaActual, setPaginaActual] = useState(1);
  const sesionesPorPagina = 6;

  /* ======================
  CARGAR SESIONES
  ====================== */

  const cargarSesiones = async () => {
    try {
      const res = await axios.get(`/api/sesiones`);
      setSessions(res.data);
    } catch {
      toast.error("Error cargando sesiones");
    }
  };

  useEffect(() => {
    cargarSesiones();
  }, []);

  /* ======================
  ABRIR SESION
  ====================== */

  const confirmarAbrirSesion = async (montoInicial) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        toast.error("No hay usuario logueado");
        return;
      }

      const res = await axios.post(`/api/sesiones`, {
        monto_inicial: montoInicial,
      });

      setShowOpenModal(false);
      toast.success("Sesión abierta");
      await cargarSesiones();
      navigate(`/sales/pos/${res.data.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Error abriendo sesión");
    }
  };

  /* ======================
  VALIDAR SESION ABIERTA
  ====================== */

  const abrirNuevaSesion = () => {
    const abierta = sessions.find((s) => s.estado === "abierta");

    if (abierta) {
      toast.error("Ya tienes una sesión abierta");
      return;
    }

    setShowOpenModal(true);
  };

  /* ======================
  NAVEGACION
  ====================== */

  const entrarPOS = (sesion) => {
    navigate(`/sales/pos/${sesion.id}`);
  };

  const verDetalle = (sesion) => {
    navigate(`/sales/session/${sesion.id}`);
  };

  /* ======================
  FILTRAR POR FECHA
  ====================== */

  const sesionesFiltradas = sessions.filter((s) => {
    if (!searchDate) return true;
    return s.fecha_inicio?.startsWith(searchDate);
  });

  const sesionActiva = sesionesFiltradas.find((s) => s.estado === "abierta");

  const historial = sesionesFiltradas.filter((s) => s.estado === "cerrada");

  /* ======================
  PAGINACION
  ====================== */

  const indexUltimo = paginaActual * sesionesPorPagina;
  const indexPrimero = indexUltimo - sesionesPorPagina;

  const sesionesPagina = historial.slice(indexPrimero, indexUltimo);

  const totalPaginas = Math.ceil(historial.length / sesionesPorPagina);

  /* ======================
  FORMATEAR FECHA
  ====================== */

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Ventas</p>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Punto de Venta</h1>
        </div>

        <button
          onClick={abrirNuevaSesion}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200"
        >
          + Abrir nueva sesión
        </button>
      </div>

      {/* SESION ACTIVA */}
      {sesionActiva && (
        <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></div>
              <div>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-0.5">Sesión activa</p>
                <h2 className="text-lg font-extrabold text-gray-800">Sesión #{sesionActiva.id}</h2>
                <p className="text-xs text-gray-400 mt-0.5">Inicio: {formatearFecha(sesionActiva.fecha_inicio)}</p>
              </div>
            </div>

            <button
              onClick={() => entrarPOS(sesionActiva)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200"
            >
              Entrar al POS →
            </button>
          </div>
        </div>
      )}

      {/* FILTROS */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📅</span>
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {searchDate && (
          <button
            onClick={() => setSearchDate("")}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-100 font-semibold transition-colors"
          >
            × Limpiar
          </button>
        )}
      </div>

      {/* HISTORIAL */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-base font-bold text-gray-700 uppercase tracking-widest">Historial de sesiones</h2>
          <div className="h-px flex-1 bg-gray-200"></div>
          {historial.length > 0 && (
            <span className="text-xs font-bold text-gray-400">{historial.length} sesiones</span>
          )}
        </div>

        {historial.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-400 text-sm shadow-sm">
            No hay sesiones registradas
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {sesionesPagina.map((sesion) => (
              <div
                key={sesion.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-gray-800">Sesión #{sesion.id}</h3>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${
                    sesion.estado === "abierta"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sesion.estado === "abierta" ? "bg-emerald-500" : "bg-gray-400"}`}></span>
                    {sesion.estado}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-gray-500">
                  <p><span className="font-semibold text-gray-600">Inicio:</span> {formatearFecha(sesion.fecha_inicio)}</p>
                  <p><span className="font-semibold text-gray-600">Cierre:</span> {formatearFecha(sesion.fecha_cierre)}</p>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                  <p className="text-xs text-emerald-500 font-semibold uppercase tracking-wider mb-0.5">Total vendido</p>
                  <p className="text-lg font-black text-emerald-600">Q {sesion.total_vendido || 0}</p>
                </div>

                <button
                  onClick={() => verDetalle(sesion)}
                  className="mt-auto bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl transition-colors duration-150 w-full"
                >
                  Ver detalle
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PAGINACION */}
      {totalPaginas > 1 && (
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Página <span className="font-semibold text-gray-700">{paginaActual}</span> de <span className="font-semibold text-gray-700">{totalPaginas}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual(paginaActual - 1)}
              className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>
            <span className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg">
              {paginaActual} / {totalPaginas}
            </span>
            <button
              disabled={paginaActual === totalPaginas}
              onClick={() => setPaginaActual(paginaActual + 1)}
              className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* MODAL */}
      <OpenSessionModal
        show={showOpenModal}
        onClose={() => setShowOpenModal(false)}
        onConfirm={confirmarAbrirSesion}
      />
    </div>
  );
}

export default PosSessions;