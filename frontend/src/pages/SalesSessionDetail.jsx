import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
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

  const cargarSesion = async () => {
    try {
      const res = await api.get(`/api/sesiones/${id}`);
      setSession(res.data);
    } catch {
      toast.error("Error cargando sesión");
    }
  };

  const cargarVentas = async () => {
    try {
      const res = await api.get(`/api/sesiones/${id}/ventas`);
      setVentas(res.data);
    } catch {
      toast.error("Error cargando ventas");
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const res = await api.get(`/api/sesiones/${id}/estadisticas`);
      setStats(res.data);
    } catch {
      toast.error("Error cargando estadísticas");
    }
  };

  const cargarMovimientos = async () => {
    try {
      const res = await api.get(`/api/sesiones/${id}/movimientos`);
      setMovimientos(res.data);
    } catch {
      toast.error("Error cargando movimientos de caja");
    }
  };

  const verProductos = async (ventaId) => {
    try {
      const res = await api.get(`/api/ventas/${ventaId}/productos`);
      setProductosVenta(res.data);
      setVentaActual(ventaId);
      setShowProductos(true);
    } catch {
      toast.error("Error cargando productos");
    }
  };

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
        confirmButton: "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg mr-2",
        cancelButton: "bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg",
      },
    });

    if (!result.isConfirmed) return;

    try {
      await api.put(`/api/ventas/${ventaId}/devolver`);
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
      <div className="p-6 text-gray-400 text-sm">Cargando sesión...</div>
    );
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleString();
  };

  const formatearDinero = (valor) => Number(valor || 0).toFixed(2);

  const ingresos = movimientos
    .filter((m) => m.tipo === "ingreso")
    .reduce((a, b) => a + Number(b.monto), 0);

  const egresos = movimientos
    .filter((m) => m.tipo === "egreso")
    .reduce((a, b) => a + Number(b.monto), 0);

  const esperadoCaja = Number(session.monto_inicial || 0) + ingresos - egresos;
  const diferencia = Number(session.dinero_contado || 0) - esperadoCaja;

  const indiceUltimaVenta = paginaActual * ventasPorPagina;
  const indicePrimeraVenta = indiceUltimaVenta - ventasPorPagina;
  const ventasActuales = ventas.slice(indicePrimeraVenta, indiceUltimaVenta);
  const totalPaginas = Math.ceil(ventas.length / ventasPorPagina);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">

      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Sesiones de venta
          </p>
          <h1 className="text-2xl font-semibold text-gray-800">
            Sesión #{session.id}
          </h1>
        </div>
        <button
          onClick={() => navigate("/sales")}
          className="text-sm px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
        >
          ← Volver
        </button>
      </div>

      {/* MÉTRICAS RESUMEN */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Estado</p>
          <span
            className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
              session.estado === "abierta"
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {session.estado}
          </span>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Usuario</p>
          <p className="text-sm font-medium text-gray-800">{session.usuario || "-"}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Inicio</p>
          <p className="text-sm font-medium text-gray-800">{formatearFecha(session.fecha_inicio)}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Total vendido</p>
          <p className="text-lg font-semibold text-green-600">Q {formatearDinero(session.total_vendido)}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Dinero contado</p>
          <p className="text-lg font-semibold text-blue-600">Q {formatearDinero(session.dinero_contado)}</p>
        </div>
      </div>

      {/* ARQUEO DE CAJA */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-4">Arqueo de caja</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Dinero inicial</p>
            <p className="font-medium text-gray-800">Q {formatearDinero(session.monto_inicial)}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Ingresos</p>
            <p className="font-medium text-green-600">Q {formatearDinero(ingresos)}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Egresos</p>
            <p className="font-medium text-red-500">Q {formatearDinero(egresos)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Esperado en caja</p>
            <p className="font-medium text-gray-800">Q {formatearDinero(esperadoCaja)}</p>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-500">Diferencia</p>
          <p
            className={`text-base font-semibold ${
              diferencia === 0
                ? "text-green-600"
                : diferencia > 0
                  ? "text-yellow-600"
                  : "text-red-500"
            }`}
          >
            {diferencia >= 0 ? "+" : ""}Q {formatearDinero(diferencia)}
          </p>
        </div>
      </div>

      {/* MOVIMIENTOS */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-4">Movimientos de caja</p>
        <div className="divide-y divide-gray-50">
          {movimientos.length === 0 && (
            <p className="text-sm text-gray-400 py-4 text-center">Sin movimientos</p>
          )}
          {movimientos.map((m, i) => (
            <div key={i} className="flex items-center justify-between py-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-xs">
                  {new Date(m.fecha).toLocaleTimeString()}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    m.tipo === "ingreso"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {m.tipo}
                </span>
                <span className="text-gray-600">{m.descripcion}</span>
              </div>
              <span className="font-medium text-gray-800">
                Q {formatearDinero(m.monto)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ESTADÍSTICAS */}
      {stats && (
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-4">Resumen de ventas</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Ventas", value: stats.total_ventas, cls: "text-gray-800" },
              { label: "Total", value: `Q ${formatearDinero(stats.ventas_totales)}`, cls: "text-green-600" },
              { label: "Efectivo", value: `Q ${formatearDinero(stats.efectivo)}`, cls: "text-gray-800" },
              { label: "Tarjeta", value: `Q ${formatearDinero(stats.tarjeta)}`, cls: "text-gray-800" },
              { label: "Crédito", value: `Q ${formatearDinero(stats.credito)}`, cls: "text-yellow-600" },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                <p className={`font-semibold ${s.cls}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TABLA VENTAS */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-4">Ventas de esta sesión</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 text-left text-xs font-medium text-gray-400">#</th>
              <th className="pb-3 text-left text-xs font-medium text-gray-400">Hora</th>
              <th className="pb-3 text-left text-xs font-medium text-gray-400">Cliente</th>
              <th className="pb-3 text-left text-xs font-medium text-gray-400">Pago</th>
              <th className="pb-3 text-right text-xs font-medium text-gray-400">Total</th>
              <th className="pb-3 text-center text-xs font-medium text-gray-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {ventasActuales.map((v) => {
              const devuelta = v.estado === "devuelta";
              return (
                <tr key={v.id} className={devuelta ? "opacity-60" : ""}>
                  <td className="py-3 text-gray-500">{v.id}</td>
                  <td className="py-3 text-gray-500">
                    {new Date(v.fecha).toLocaleTimeString()}
                  </td>
                  <td className="py-3 font-medium text-gray-700">
                    {v.cliente || "Consumidor final"}
                  </td>
                  <td className="py-3">
                    {devuelta ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                        devuelta
                      </span>
                    ) : (
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          v.metodo_pago === "credito"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {v.metodo_pago}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right font-semibold text-green-600">
                    Q {formatearDinero(v.total)}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() =>
                          navigate(`/sales/receipt/${v.id}?from=session&session=${session.id}`)
                        }
                        className="text-xs px-2.5 py-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/sales/receipt/${v.id}?from=session&session=${session.id}`)
                        }
                        className="text-xs px-2.5 py-1.5 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        Imprimir
                      </button>
                      <button
                        onClick={() => verProductos(v.id)}
                        className="text-xs px-2.5 py-1.5 rounded-md bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                      >
                        Productos
                      </button>
                      {!devuelta && (
                        <button
                          onClick={() => devolverVenta(v.id)}
                          className="text-xs px-2.5 py-1.5 rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        >
                          Devolver
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* PAGINACIÓN */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100 text-sm">
          <button
            onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
            disabled={paginaActual === 1}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>
          <span className="text-gray-400 text-xs">
            Página {paginaActual} de {totalPaginas || 1}
          </span>
          <button
            onClick={() => setPaginaActual((p) => Math.min(p + 1, totalPaginas))}
            disabled={paginaActual === totalPaginas || totalPaginas === 0}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente →
          </button>
        </div>
      </div>

      {/* MODAL PRODUCTOS */}
      {showProductos && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">
                Venta #{ventaActual}
              </h2>
              <button
                onClick={() => setShowProductos(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
              Productos
            </p>
            <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
              {productosVenta.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">{p.nombre}</span>
                    <span className="text-gray-400 ml-1">×{p.cantidad}</span>
                  </div>
                  <span className="font-semibold text-gray-800">
                    Q {formatearDinero(p.subtotal)}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowProductos(false)}
              className="mt-4 w-full py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm text-gray-600 transition-colors"
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