import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/sesiones`,
      );

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

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/sesiones`,
        {
          usuario_id: user.id,
          monto_inicial: montoInicial,
        },
      );

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
      toast.error("Ya hay una sesión abierta");

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
    <div className="p-6">
      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Punto de Venta</h1>

        <button
          onClick={abrirNuevaSesion}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
        >
          + Abrir nueva sesión
        </button>
      </div>

      {/* FILTROS */}

      <div className="flex gap-4 mb-6">
        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          onClick={() => setSearchDate("")}
          className="bg-gray-200 px-4 rounded"
        >
          Limpiar
        </button>
      </div>

      {/* SESION ACTIVA */}

      {sesionActiva && (
        <div className="bg-green-50 border border-green-300 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold mb-2">
            Sesión activa #{sesionActiva.id}
          </h2>

          <p className="text-sm text-gray-600">
            Inicio: {formatearFecha(sesionActiva.fecha_inicio)}
          </p>

          <button
            onClick={() => entrarPOS(sesionActiva)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Entrar al POS
          </button>
        </div>
      )}

      {/* HISTORIAL */}

      <h2 className="text-lg font-semibold mb-4">Historial de sesiones</h2>

      {historial.length === 0 && (
        <p className="text-gray-400">No hay sesiones registradas</p>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {sesionesPagina.map((sesion) => (
          <div
            key={sesion.id}
            className="bg-white shadow-md rounded-xl p-5 border"
          >
            <h3 className="font-bold">Sesión #{sesion.id}</h3>

            <p className="text-sm">
              Estado:
              <span
                className={`ml-2 font-bold ${
                  sesion.estado === "abierta"
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {sesion.estado}
              </span>
            </p>
            <p className="text-gray-500 text-sm">
              Inicio: {formatearFecha(sesion.fecha_inicio)}
            </p>

            <p className="text-gray-500 text-sm">
              Cierre: {formatearFecha(sesion.fecha_cierre)}
            </p>

            <p className="text-green-600 font-semibold">
              Total: Q {sesion.total_vendido || 0}
            </p>

            <button
              onClick={() => verDetalle(sesion)}
              className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg w-full"
            >
              Ver detalle
            </button>
          </div>
        ))}
      </div>

      {/* PAGINACION */}

      {totalPaginas > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            disabled={paginaActual === 1}
            onClick={() => setPaginaActual(paginaActual - 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            ← Anterior
          </button>

          <span>
            Página {paginaActual} de {totalPaginas}
          </span>

          <button
            disabled={paginaActual === totalPaginas}
            onClick={() => setPaginaActual(paginaActual + 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Siguiente →
          </button>
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
