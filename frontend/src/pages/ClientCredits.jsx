import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
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
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/creditos/cliente/${id}`,
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
        await axios.post(`${import.meta.env.VITE_API_URL}/api/creditos/pagar`, {
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
      await axios.post(`${import.meta.env.VITE_API_URL}/api/creditos/pagar`, {
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
    return <div className="p-6">Cargando créditos...</div>;
  }

  return (
    <div className="p-6">
      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Créditos del cliente</h1>

          <p className="text-gray-600">{cliente}</p>
        </div>

        <button
          onClick={() => navigate("/clients")}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Volver
        </button>
      </div>

      {/* TOTAL DEUDA */}

      <div className="bg-red-50 border border-red-200 p-4 rounded mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-red-700">
            Deuda total: Q{totalDeuda.toFixed(2)}
          </h2>

          {totalDeuda > 0 && (
            <button
              onClick={() => setConfirmPagoTotal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Pagar todo
            </button>
          )}
        </div>
      </div>

      {/* TABLA */}

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Venta</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Pagado</th>
              <th className="p-3 text-left">Saldo</th>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {creditos.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3">#{c.id}</td>

                <td className="p-3">Q{c.total}</td>

                <td className="p-3">Q{c.monto_pagado}</td>

                <td className="p-3 text-red-600 font-semibold">Q{c.saldo}</td>

                <td className="p-3">
                  {new Date(c.fecha).toLocaleDateString()}
                </td>

                <td className="p-3 text-center">
                  <button
                    onClick={() => abrirModal(c)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Abonar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL ABONO */}

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Registrar abono</h2>

            <p className="mb-2">Venta #{ventaSeleccionada.id}</p>

            <p className="mb-4 text-red-600">
              Saldo: Q{ventaSeleccionada.saldo}
            </p>

            <input
              type="number"
              placeholder="Monto a pagar"
              className="border p-2 rounded w-full mb-4"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancelar
              </button>

              <button
                onClick={pagarCredito}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Registrar pago
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR PAGO TOTAL */}

      {confirmPagoTotal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              Confirmar pago total
            </h2>

            <p className="mb-4">
              ¿Estás seguro de liquidar toda la deuda de este cliente?
            </p>

            <p className="mb-6 font-semibold">
              Total a pagar: Q{totalDeuda.toFixed(2)}
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmPagoTotal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancelar
              </button>

              <button
                onClick={async () => {
                  await pagarTodo();
                  setConfirmPagoTotal(false);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded"
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
