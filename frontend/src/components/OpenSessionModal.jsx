import { useState } from "react";

function OpenSessionModal({ show, onClose, onConfirm }) {
  const [montoInicial, setMontoInicial] = useState("");

  if (!show) return null;

  const abrirSesion = () => {
    const monto = Number(montoInicial) || 0;

    onConfirm(monto);

    setMontoInicial("");
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[420px] shadow-lg">
        <h2 className="text-xl font-bold mb-4">Abrir nueva sesión</h2>

        <p className="text-gray-600 mb-4">Ingresa el dinero inicial en caja.</p>

        {/* MONTO INICIAL */}

        <input
          type="number"
          placeholder="Monto inicial (ej: 500)"
          value={montoInicial}
          onChange={(e) => setMontoInicial(e.target.value)}
          className="w-full border p-2 rounded mb-6"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>

          <button
            onClick={abrirSesion}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Abrir sesión
          </button>
        </div>
      </div>
    </div>
  );
}

export default OpenSessionModal;
