import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

function ClientCredits() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [creditos, setCreditos] = useState([]);
  const [cliente, setCliente] = useState("");

  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [monto, setMonto] = useState("");

  const [confirmPagoTotal, setConfirmPagoTotal] = useState(false);

  // ==========================
  // OBTENER CREDITOS
  // ==========================

  const obtenerCreditos = async () => {
    try {
      const res = await api.get(
        `/api/creditos/cliente/${id}`
      );

      setCreditos(res.data);

      if (res.data.length > 0) {
        setCliente(res.data[0].cliente);
      }
    } catch (error) {
      toast.error("Error cargando créditos");
    }

    setLoading(false);
  };

  useEffect(() => {
    obtenerCreditos();
  }, []);

  // ==========================
  // CALCULAR DEUDA TOTAL
  // ==========================

  const totalDeuda = creditos.reduce((acc, c) => {
    return acc + Number(c.saldo);
  }, 0);

  // ==========================
  // PAGAR TODO
  // ==========================

  const pagarTodo = async () => {
    try {
      for (const c of creditos) {
        await api.post("/api/creditos/pagar", {
          venta_id: c.id,
          cliente_id: id,
          monto: c.saldo,
        });
      }

      toast.success("Deuda liquidada");

      obtenerCreditos();
    } catch (error) {
      toast.error("Error pagando créditos");
    }
  };

  // ==========================
  // ABRIR MODAL
  // ==========================

  const abrirModal = (venta) => {
    setVentaSeleccionada(venta);
    setMonto("");
    setModalOpen(true);
  };

  // ==========================
  // REGISTRAR PAGO
  // ==========================

  const pagarCredito = async () => {
    try {
      await api.post("/api/creditos/pagar", {
        venta_id: ventaSeleccionada.id,
        cliente_id: id,
        monto: Number(monto),
      });

      toast.success("Pago registrado");

      setModalOpen(false);

      obtenerCreditos();
    } catch (error) {
      toast.error("Error registrando pago");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm font-medium animate-pulse">Cargando créditos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Clientes</p>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Créditos del cliente</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">{cliente}</p>
        </div>

        <button
          onClick={() => navigate("/clients")}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors duration-150"
        >
          ← Volver
        </button>
      </div>

      {/* TOTAL DEUDA */}
      <div className="bg-white border border-red-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Deuda total</p>
            <p className="text-4xl font-black text-red-600">Q{totalDeuda.toFixed(2)}</p>
          </div>

          {totalDeuda > 0 && (
            <button
              onClick={() => setConfirmPagoTotal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200"
            >
              Liquidar todo
            </button>
          )}
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Venta</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pagado</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Saldo</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {creditos.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors duration-100">
                  <td className="px-5 py-3.5 text-sm font-semibold text-gray-700">#{c.id}</td>

                  <td className="px-5 py-3.5 text-sm text-gray-600">Q{c.total}</td>

                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                      Q{c.monto_pagado}
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center bg-red-50 text-red-600 border border-red-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                      Q{c.saldo}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-sm text-gray-500">
                    {new Date(c.fecha).toLocaleDateString()}
                  </td>

                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => abrirModal(c)}
                      className="bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors duration-150"
                    >
                      Abonar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ABONO */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-extrabold text-gray-800">Registrar abono</h2>
                <p className="text-xs text-gray-400 mt-0.5">Venta #{ventaSeleccionada.id}</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none transition-colors"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-0.5">Saldo pendiente</p>
                <p className="text-2xl font-black text-red-600">Q{ventaSeleccionada.saldo}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Monto a pagar</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={pagarCredito}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              >
                Registrar pago
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR PAGO TOTAL */}
      {confirmPagoTotal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-extrabold text-red-600">Confirmar pago total</h2>
                <p className="text-xs text-gray-400 mt-0.5">Esta acción liquidará toda la deuda</p>
              </div>
              <button
                onClick={() => setConfirmPagoTotal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none transition-colors"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-gray-600">
                ¿Estás seguro de liquidar toda la deuda de este cliente?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-0.5">Total a pagar</p>
                <p className="text-2xl font-black text-red-600">Q{totalDeuda.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setConfirmPagoTotal(false)}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await pagarTodo();
                  setConfirmPagoTotal(false);
                }}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              >
                Confirmar pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientCredits;