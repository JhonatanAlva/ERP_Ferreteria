import { useNavigate, useParams } from "react-router-dom";
import { usePos } from "../context/PosContext";
import api from "../api/axios";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

function PaymentScreen() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { cartGlobal, clienteGlobal, limpiarCarrito } = usePos();

  const [cart, setCart] = useState([]);
  const [cliente, setCliente] = useState(null);

  const [metodo, setMetodo] = useState("efectivo");
  const [efectivo, setEfectivo] = useState("");

  /* =========================
CARGAR DATOS
========================= */

  useEffect(() => {
    if (cartGlobal && cartGlobal.length > 0) {
      setCart(cartGlobal);
    } else {
      const savedCart = localStorage.getItem("pos_cart");

      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    }

    if (clienteGlobal) {
      setCliente(clienteGlobal);
    } else {
      const savedCliente = localStorage.getItem("pos_cliente");

      if (savedCliente) {
        setCliente(JSON.parse(savedCliente));
      }
    }
  }, [cartGlobal, clienteGlobal]);

  /* =========================
TOTAL
========================= */

  const total = cart.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

  /* =========================
CAMBIO
========================= */

  const cambio = metodo === "efectivo" ? Number(efectivo || 0) - total : 0;

  /* =========================
TECLADO NUMERICO
========================= */

  const agregarNumero = (num) => {
    setEfectivo((prev) => prev + num);
  };

  const borrarNumero = () => {
    setEfectivo((prev) => prev.slice(0, -1));
  };

  /* =========================
REGISTRAR VENTA
========================= */

  const registrarVenta = async () => {
    try {
      let montoPagado = 0;

      if (metodo === "efectivo") {
        montoPagado = Number(efectivo || total);
      }

      if (metodo === "tarjeta") {
        montoPagado = total;
      }

      if (metodo === "credito") {
        montoPagado = 0;
      }

      const res = await api.post("/api/ventas", {
        sesion_id: id,
        cliente_id: cliente?.id || null,
        metodo_pago: metodo,
        productos: cart,
        total,
        monto_pagado: montoPagado,
      },
      );

      toast.success("Venta registrada");

      limpiarCarrito?.();

      localStorage.removeItem("pos_cart");
      localStorage.removeItem("pos_cliente");

      navigate(`/sales/receipt/${res.data.venta_id}`);
    } catch (error) {
      console.log(error);
      toast.error("Error registrando venta");
    }
  };

  /* =========================
CONFIRMAR PAGO
========================= */

  const confirmarPago = () => {
    if (metodo === "efectivo" && Number(efectivo) < total) {
      toast.error("El efectivo es menor al total");
      return;
    }

    if (metodo === "credito" && !cliente) {
      toast.error("Debe seleccionar cliente para crédito");
      return;
    }

    /* ALERTA DE CONFIRMACION */

    toast(
      (t) => (
        <div className="p-2">
          <p className="font-bold mb-2">Confirmar pago</p>

          <p className="text-sm">
            Total: <b>Q {total.toFixed(2)}</b>
          </p>

          <p className="text-sm">
            Cliente: <b>{cliente?.name || "Consumidor final"}</b>
          </p>

          <p className="text-sm mb-4">
            Método: <b>{metodo}</b>
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-200 px-3 py-1 rounded"
            >
              Cancelar
            </button>

            <button
              onClick={() => {
                toast.dismiss(t.id);
                registrarVenta();
              }}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              Confirmar
            </button>
          </div>
        </div>
      ),
      { duration: 6000 },
    );
  };

  /* =========================
UI
========================= */

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-70px)] bg-gray-100">
      {/* PANEL IZQUIERDO */}

      <div className="flex-1 p-4 md:p-8">
        <h1 className="text-xl md:text-2xl font-bold mb-6">Pago de venta</h1>

        <div className="bg-white shadow rounded-xl p-4 md:p-6 max-w-full md:max-w-lg">
          <h2 className="text-lg font-bold mb-4">Productos</h2>

          {cart.length === 0 && (
            <p className="text-gray-400">No hay productos</p>
          )}

          {cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between border-b py-2 text-sm"
            >
              <span>
                {item.nombre} x{item.cantidad}
              </span>

              <span className="font-semibold">
                Q {(item.precio * item.cantidad).toFixed(2)}
              </span>
            </div>
          ))}

          <div className="flex justify-between mt-6 font-bold text-xl">
            <span>Total</span>

            <span className="text-green-600">Q {total.toFixed(2)}</span>
          </div>

          <p className="mt-6 text-sm text-gray-500">Cliente</p>

          <p className="font-semibold text-lg">
            {cliente?.name || "Consumidor final"}
          </p>

          <button
            onClick={() => navigate(`/sales/pos/${id}`)}
            className="mt-6 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            ← Volver a POS
          </button>
        </div>
      </div>

      {/* PANEL DERECHO */}

      <div className="w-full md:w-[420px] bg-white border-t md:border-l md:border-t-0 p-4 md:p-6">
        <h2 className="text-xl font-bold mb-4">Pago</h2>

        <select
          value={metodo}
          onChange={(e) => setMetodo(e.target.value)}
          className="border rounded p-3 w-full mb-4"
        >
          <option value="efectivo">Efectivo</option>

          <option value="tarjeta">Tarjeta</option>

          <option value="credito">Crédito</option>
        </select>

        {metodo === "efectivo" && (
          <input
            type="number"
            placeholder="Dinero recibido"
            value={efectivo}
            onChange={(e) => setEfectivo(e.target.value)}
            className="border rounded p-4 text-lg mb-4 w-full"
          />
        )}

        <div className="flex justify-between text-lg mb-2">
          <span>Total</span>

          <span className="font-bold">Q {total.toFixed(2)}</span>
        </div>

        {metodo === "efectivo" && (
          <div className="flex justify-between text-lg mb-4">
            <span>Cambio</span>

            <span
              className={`font-bold ${cambio >= 0 ? "text-green-600" : "text-red-500"
                }`}
            >
              Q {cambio.toFixed(2)}
            </span>
          </div>
        )}
        {/* TECLADO */}

        {metodo === "efectivo" && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            {["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", "00", "⌫"].map(
              (n, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (n === "⌫") borrarNumero();
                    else agregarNumero(n);
                  }}
                  className="bg-gray-200 p-4 rounded text-lg hover:bg-gray-300 transition"
                >
                  {n}
                </button>
              ),
            )}
          </div>
        )}

        <button
          onClick={confirmarPago}
          className="bg-green-600 text-white w-full py-4 rounded mt-6 text-lg hover:bg-green-700"
        >
          Confirmar pago
        </button>
      </div>
    </div>
  );
}

export default PaymentScreen;
