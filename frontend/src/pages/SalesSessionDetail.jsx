import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

function SalesSessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [stats, setStats] = useState(null);
  const [movimientos, setMovimientos] = useState([]);

  const [productosVenta, setProductosVenta] = useState([]);
  const [showProductos, setShowProductos] = useState(false);
  const [ventaActual, setVentaActual] = useState(null);

  const [paginaActual, setPaginaActual] = useState(1);
  const ventasPorPagina = 5;

  useEffect(() => {
    cargarSesion();
    cargarVentas();
    cargarEstadisticas();
    cargarMovimientos();
  }, []);

  // =============================
  // CARGAR SESION
  // =============================

  const cargarSesion = async () => {
    try {
      const res = await axios.get(
        `/api/sesiones/${id}`,
      );
      setSession(res.data);
    } catch {
      toast.error("Error cargando sesión");
    }
  };

  // =============================
  // CARGAR VENTAS
  // =============================

  const cargarVentas = async () => {
    try {
      const res = await axios.get(
        `/api/sesiones/${id}/ventas`,
      );
      setVentas(res.data);
    } catch {
      toast.error("Error cargando ventas");
    }
  };

  // =============================
  // CARGAR ESTADISTICAS
  // =============================

  const cargarEstadisticas = async () => {
    try {
      const res = await axios.get(
        `/api/sesiones/${id}/estadisticas`,
      );
      setStats(res.data);
    } catch {
      toast.error("Error cargando estadísticas");
    }
  };

  // =============================
  // CARGAR MOVIMIENTOS CAJA
  // =============================

  const cargarMovimientos = async () => {
    try {
      const res = await axios.get(
        `/api/sesiones/${id}/movimientos`,
      );
      setMovimientos(res.data);
    } catch {
      toast.error("Error cargando movimientos de caja");
    }
  };

  // =============================
  // VER PRODUCTOS
  // =============================

  const verProductos = async (ventaId) => {
    try {
      const res = await axios.get(
        `/api/ventas/${ventaId}/productos`,
      );

      setProductosVenta(res.data);
      setVentaActual(ventaId);
      setShowProductos(true);
    } catch {
      toast.error("Error cargando productos");
    }
  };

  // =============================
  // DEVOLVER VENTA
  // =============================

  const devolverVenta = async (ventaId) => {
    const result = await Swal.fire({
      title: "¿Devolver venta?",
      text: "Los productos regresarán al stock",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, devolver",
      cancelButtonText: "Cancelar",
      buttonsStyling: false,
      customClass: {
        confirmButton:
          "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg mr-2",
        cancelButton:
          "bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg",
      },
    });

    if (!result.isConfirmed) return;

    try {
      await axios.put(
        `/api/ventas/${ventaId}/devolver`,
      );

      toast.success("Venta devuelta correctamente");

      cargarVentas();
      cargarSesion();
      cargarEstadisticas();
      cargarMovimientos();
    } catch (error) {
      toast.error(error.response?.data?.error || "Error devolviendo venta");
    }
  };

  if (!session) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Cargando sesión...</p>
      </div>
    );
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleString();
  };

  const formatearDinero = (valor) => {
    return Number(valor || 0).toFixed(2);
  };

  // =============================
  // ARQUEO DE CAJA
  // =============================

  const ingresos = movimientos
    .filter((m) => m.tipo === "ingreso")
    .reduce((a, b) => a + Number(b.monto), 0);

  const egresos = movimientos
    .filter((m) => m.tipo === "egreso")
    .reduce((a, b) => a + Number(b.monto), 0);

  const esperadoCaja = Number(session.monto_inicial || 0) + ingresos - egresos;

  const diferencia = Number(session.dinero_contado || 0) - esperadoCaja;

  // =============================
  // PAGINACION
  // =============================

  const indiceUltimaVenta = paginaActual * ventasPorPagina;
  const indicePrimeraVenta = indiceUltimaVenta - ventasPorPagina;

  const ventasActuales = ventas.slice(indicePrimeraVenta, indiceUltimaVenta);

  const totalPaginas = Math.ceil(ventas.length / ventasPorPagina);

  const siguientePagina = () => {
    if (paginaActual < totalPaginas) {
      setPaginaActual(paginaActual + 1);
    }
  };

  const paginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Detalle de sesión #{session.id}</h1>

        <button
          onClick={() => navigate("/sales")}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
        >
          ← Volver
        </button>
      </div>

      {/* RESUMEN */}

      <div className="bg-white rounded-xl shadow border p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Estado</p>

            <span
              className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold
              ${
                session.estado === "abierta"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {session.estado}
            </span>
          </div>

          <div>
            <p className="text-sm text-gray-500">Usuario</p>
            <p className="font-semibold">{session.usuario || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Inicio</p>
            <p className="font-semibold">
              {formatearFecha(session.fecha_inicio)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Cierre</p>
            <p className="font-semibold">
              {formatearFecha(session.fecha_cierre)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Total vendido</p>
            <p className="text-green-600 font-bold text-lg">
              Q {formatearDinero(session.total_vendido)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Dinero contado al cierre</p>
            <p className="text-blue-600 font-bold text-lg">
              Q {formatearDinero(session.dinero_contado)}
            </p>
          </div>
        </div>
      </div>

      {/* ARQUEO DE CAJA */}

      <div className="bg-white rounded-xl shadow border p-6 mt-6">
        <h2 className="text-lg font-bold mb-4">Arqueo de caja</h2>

        <div className="grid md:grid-cols-4 gap-4 text-center">
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-xs text-gray-500">Dinero inicial</p>
            <p className="font-bold">
              Q {formatearDinero(session.monto_inicial)}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <p className="text-xs text-gray-500">Ingresos</p>
            <p className="font-bold text-green-600">
              Q {formatearDinero(ingresos)}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <p className="text-xs text-gray-500">Egresos</p>
            <p className="font-bold text-red-600">
              Q {formatearDinero(egresos)}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <p className="text-xs text-gray-500">Esperado en caja</p>
            <p className="font-bold">Q {formatearDinero(esperadoCaja)}</p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">Diferencia</p>

          <p
            className={`font-bold text-lg
            ${
              diferencia === 0
                ? "text-green-600"
                : diferencia > 0
                  ? "text-yellow-600"
                  : "text-red-600"
            }`}
          >
            Q {formatearDinero(diferencia)}
          </p>
        </div>
      </div>

      {/* MOVIMIENTOS DE CAJA */}

      <div className="bg-white rounded-xl shadow border p-6 mt-6">
        <h2 className="text-lg font-bold mb-4">Movimientos de caja</h2>

        <table className="w-full text-sm">
          <thead className="border-b text-gray-500">
            <tr>
              <th>Hora</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th className="text-right">Monto</th>
            </tr>
          </thead>

          <tbody>
            {movimientos.map((m, i) => (
              <tr key={i} className="border-b">
                <td>{new Date(m.fecha).toLocaleTimeString()}</td>

                <td>
                  <span
                    className={`px-2 py-1 rounded text-xs
                    ${
                      m.tipo === "ingreso"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {m.tipo}
                  </span>
                </td>

                <td>{m.descripcion}</td>

                <td className="text-right font-semibold">
                  Q {formatearDinero(m.monto)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ESTADISTICAS */}

      {stats && (
        <div className="bg-white rounded-xl shadow border p-6 mt-6">
          <h2 className="text-lg font-bold mb-4">Resumen de ventas</h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-500">Ventas</p>
              <p className="font-bold">{stats.total_ventas}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-500">Total</p>
              <p className="font-bold text-green-600">
                Q {formatearDinero(stats.ventas_totales)}
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-500">Efectivo</p>
              <p className="font-bold">Q {formatearDinero(stats.efectivo)}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-500">Tarjeta</p>
              <p className="font-bold">Q {formatearDinero(stats.tarjeta)}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-500">Crédito</p>
              <p className="font-bold text-yellow-600">
                Q {formatearDinero(stats.credito)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TABLA VENTAS */}

      <div className="bg-white rounded-xl shadow border p-6 mt-6">
        <h2 className="text-lg font-bold mb-4">Ventas de esta sesión</h2>

        <table className="w-full text-sm">
          <thead className="border-b text-gray-500">
            <tr>
              <th>#</th>
              <th>Hora</th>
              <th>Cliente</th>
              <th>Pago</th>
              <th className="text-right">Total</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {ventasActuales.map((v) => {
              const devuelta = v.estado === "devuelta";

              return (
                <tr
                  key={v.id}
                  className={`border-b ${devuelta ? "bg-yellow-50 opacity-70" : ""}`}
                >
                  <td>{v.id}</td>

                  <td>{new Date(v.fecha).toLocaleTimeString()}</td>

                  <td>{v.cliente || "Consumidor final"}</td>

                  <td>
                    {devuelta ? (
                      <span className="bg-yellow-200 text-yellow-700 px-2 py-1 rounded text-xs">
                        DEVUELTA
                      </span>
                    ) : (
                      <span
                        className={`px-2 py-1 text-xs rounded
                        ${
                          v.metodo_pago === "credito"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {v.metodo_pago}
                      </span>
                    )}
                  </td>

                  <td className="text-right font-semibold text-green-600">
                    Q {formatearDinero(v.total)}
                  </td>

                  <td className="text-center space-x-2">
                    <button
                      onClick={() =>
                        navigate(
                          `/sales/receipt/${v.id}?from=session&session=${session.id}`,
                        )
                      }
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Ver
                    </button>

                    <button
                      onClick={() =>
                        navigate(
                          `/sales/receipt/${v.id}?from=session&session=${session.id}`,
                        )
                      }
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs"
                    >
                      Imprimir
                    </button>

                    <button
                      onClick={() => verProductos(v.id)}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Productos
                    </button>

                    {!devuelta && (
                      <button
                        onClick={() => devolverVenta(v.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Devolver
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* PAGINACION */}

        <div className="flex justify-between items-center mt-4 text-sm">
          <button
            onClick={paginaAnterior}
            disabled={paginaActual === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            ← Anterior
          </button>

          <span>
            Página {paginaActual} de {totalPaginas}
          </span>

          <button
            onClick={siguientePagina}
            disabled={paginaActual === totalPaginas}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Siguiente →
          </button>
        </div>
      </div>

      {/* MODAL PRODUCTOS */}

      {showProductos && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[420px] shadow-xl">
            <h2 className="text-lg font-bold mb-4">
              Productos de venta #{ventaActual}
            </h2>

            <div className="max-h-60 overflow-y-auto">
              {productosVenta.map((p, i) => (
                <div
                  key={i}
                  className="flex justify-between border-b py-2 text-sm"
                >
                  <span>
                    {p.nombre} x{p.cantidad}
                  </span>

                  <span className="font-semibold">
                    Q {formatearDinero(p.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowProductos(false)}
              className="mt-4 w-full bg-gray-200 hover:bg-gray-300 py-2 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesSessionDetail;
