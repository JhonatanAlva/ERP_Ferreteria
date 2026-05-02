import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

function Receipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [venta, setVenta] = useState(null);
  const [productos, setProductos] = useState([]);

  const params = new URLSearchParams(location.search);
  const from = params.get("from");
  const sessionId = params.get("session");

  useEffect(() => {
    api
      .get(`/api/ventas/${id}/recibo`)
      .then((res) => {
        setVenta(res.data.venta);
        setProductos(res.data.productos);
      })
      .catch((err) => {
        console.error("Error cargando recibo:", err);
      });
  }, [id]);

  if (!venta) return <p className="p-10">Cargando recibo...</p>;

  const fecha = new Date(venta.fecha).toLocaleDateString();
  const hora = new Date(venta.fecha).toLocaleTimeString();

  // DETECTAR SI ESTA ANULADA O DEVUELTA
  const anulada =
    venta.estado === "anulada" ||
    venta.estado === "devuelta" ||
    venta.estado_pago === "devuelto";

  return (
    <div className="flex justify-center mt-10">
      <div className="relative bg-white p-6 w-[320px] shadow-lg rounded overflow-hidden">
        {/* MARCA DE AGUA */}

        {anulada && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <span className="text-red-500 text-6xl font-extrabold opacity-20 rotate-[-30deg] select-none">
              DEVUELTA
            </span>
          </div>
        )}

        {/* CONTENIDO DEL RECIBO */}

        <div className={`${anulada ? "opacity-80" : ""}`}>
          {/* LOGO */}

          <img src="/logo.png" className="h-16 mx-auto mb-2" alt="Logo" />

          <h2 className="text-center font-bold text-lg">ACEITERA RODRIGUEZ</h2>

          <p className="text-center text-xs text-gray-500">
            {fecha} - {hora}
          </p>

          <hr className="my-3" />

          {/* CLIENTE */}

          <p className="text-sm mb-2">
            Cliente: <b>{venta.cliente || "Consumidor Final"}</b>
          </p>

          <hr className="mb-3" />

          {/* PRODUCTOS */}

          {productos.map((p, i) => (
            <div key={i} className="text-sm mb-2 border-b pb-1">
              <div>{p.nombre}</div>

              <div className="flex justify-between text-xs text-gray-600">
                <span>
                  {p.cantidad} x Q {Number(p.precio).toFixed(2)}
                </span>

                <span>Q {Number(p.subtotal).toFixed(2)}</span>
              </div>
            </div>
          ))}

          <hr className="my-3" />

          {/* TOTAL */}

          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>

            <span>Q {Number(venta.total).toFixed(2)}</span>
          </div>

          <p className="text-sm mt-2">
            Método de pago: <b>{venta.metodo_pago}</b>
          </p>

          <hr className="my-3" />

          <p className="text-center text-xs text-gray-500">
            ¡Gracias por su compra!
          </p>
        </div>

        {/* BOTONES */}

        <div className="mt-4 space-y-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Imprimir recibo
          </button>

          {from === "session" ? (
            <button
              onClick={() => navigate(`/sales/session/${sessionId}`)}
              className="w-full bg-gray-200 py-2 rounded hover:bg-gray-300"
            >
              Volver a la sesión
            </button>
          ) : (
            <button
              onClick={() => navigate(`/sales/pos/${venta.sesion_id}`)}
              className="w-full bg-gray-200 py-2 rounded hover:bg-gray-300"
            >
              Volver al POS
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Receipt;
