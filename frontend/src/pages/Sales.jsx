import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { usePos } from "../context/PosContext";
import CloseSessionModal from "../components/CloseSessionModal";

function Sales() {
  const { id } = useParams();
  const sessionId = id;

  const navigate = useNavigate();

  const { setCartGlobal, setClienteGlobal } = usePos();

  // const user = JSON.parse(localStorage.getItem("user"));

  const [products, setProducts] = useState([]);
  const [clientes, setClientes] = useState([]);

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("pos_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [search, setSearch] = useState("");

  const [cliente, setCliente] = useState(() => {
    const saved = localStorage.getItem("pos_cliente");

    if (!saved) return "0";

    try {
      const parsed = JSON.parse(saved);
      return parsed?.id ? parsed.id.toString() : "0";
    } catch {
      return saved;
    }
  });

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [cashCounted, setCashCounted] = useState("");
  const [resumenCaja, setResumenCaja] = useState(null);

  /* ===============================
CARGAR PRODUCTOS
=============================== */

  const cargarProductos = async () => {
    try {
      const res = await api.get(
        `/api/productos`,
      );

      setProducts(res.data);
    } catch {
      toast.error("Error cargando productos");
    }
  };

  /* ===============================
CARGAR CLIENTES
=============================== */

  const cargarClientes = async () => {
    try {
      const res = await api.get(`/clients`);

      setClientes(res.data.filter((c) => c.active));
    } catch {
      toast.error("Error cargando clientes");
    }
  };

  /* ===============================
RESUMEN CAJA
=============================== */

  const cargarResumenCaja = async () => {
    try {
      const res = await api.get(
        `/api/sesiones/${sessionId}/resumen`,
      );

      setResumenCaja(res.data);
    } catch {
      toast.error("Error obteniendo resumen de caja");
    }
  };

  useEffect(() => {
    cargarProductos();
    cargarClientes();
  }, []);

  useEffect(() => {
    localStorage.setItem("pos_cart", JSON.stringify(cart));
  }, [cart]);

  /* ===============================
FILTRAR PRODUCTOS
=============================== */

  const productosFiltrados = products.filter((p) => {
    const texto = search.toLowerCase();

    return (
      p.nombre?.toLowerCase().includes(texto) ||
      p.codigo?.toLowerCase().includes(texto)
    );
  });

  /* ===============================
CARRITO
=============================== */

  const agregarCarrito = (producto) => {
    if (producto.estado === false) {
      toast.error("Producto desactivado");
      return;
    }

    if (producto.stock === 0) {
      toast.error("Producto sin stock");
      return;
    }

    const existe = cart.find((p) => p.id === producto.id);

    if (existe) {
      if (existe.cantidad >= producto.stock) {
        toast.error("No hay más stock");
        return;
      }

      setCart(
        cart.map((p) =>
          p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p,
        ),
      );
    } else {
      setCart([...cart, { ...producto, cantidad: 1 }]);
    }
  };

  const sumarCantidad = (item) => {
    if (item.cantidad >= item.stock) {
      toast.error("No hay más stock");
      return;
    }

    setCart(
      cart.map((p) =>
        p.id === item.id ? { ...p, cantidad: p.cantidad + 1 } : p,
      ),
    );
  };

  const restarCantidad = (item) => {
    if (item.cantidad === 1) {
      setCart(cart.filter((p) => p.id !== item.id));
      return;
    }

    setCart(
      cart.map((p) =>
        p.id === item.id ? { ...p, cantidad: p.cantidad - 1 } : p,
      ),
    );
  };

  const eliminarProducto = (id) => {
    setCart(cart.filter((p) => p.id !== id));
  };

  /* ===============================
TOTAL
=============================== */

  const total = cart.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0,
  );

  /* ===============================
COBRAR
=============================== */

  const cobrar = () => {
    if (cart.length === 0) {
      toast.error("Carrito vacío");
      return;
    }

    const clienteSeleccionado =
      cliente === "0" ? null : clientes.find((c) => c.id === Number(cliente));

    setCartGlobal(cart);
    setClienteGlobal(clienteSeleccionado);

    localStorage.setItem("pos_cliente", JSON.stringify(clienteSeleccionado));

    navigate(`/sales/payment/${sessionId}`);
  };

  /* ===============================
MODAL CIERRE
=============================== */

  const abrirModalCierre = () => {
    setShowCloseModal(true);
    cargarResumenCaja();
  };

  const confirmarCierre = async () => {
    try {
      await api.put(
        `/api/sesiones/${sessionId}/cerrar`,

        {
          dinero_contado: cashCounted || 0,
        },
      );

      localStorage.removeItem("pos_cart");
      localStorage.removeItem("pos_cliente");

      setCartGlobal([]);
      setClienteGlobal(null);

      toast.success("Sesión cerrada correctamente");

      navigate("/sales");
    } catch (error) {
      console.log(error);
      toast.error("Error cerrando sesión");
    }
  };

  const suspenderSesion = () => {
    toast("Sesión suspendida");
    navigate("/sales");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-70px)] bg-gray-50">
      {/* HEADER */}

      <div className="flex items-center justify-between p-4 bg-white border-b">
        <button
          onClick={abrirModalCierre}
          className="text-blue-600 font-medium hover:underline"
        >
          ← Volver a sesiones
        </button>

        <h2 className="font-bold text-sm md:text-lg">
          POS activo (Sesión #{sessionId})
        </h2>
      </div>

      {/* CONTENIDO */}

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* PRODUCTOS */}

        <div className="flex-1 p-4 overflow-auto pb-[48vh] md:pb-4">
          <h2 className="text-xl font-bold mb-4">Punto de venta</h2>

          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded p-2 w-full mb-4"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {productosFiltrados.map((producto) => (
              <div
                key={producto.id}
                onClick={() => agregarCarrito(producto)}
                className={`relative bg-white rounded-xl shadow-sm p-3 transition transform hover:scale-105 ${producto.stock === 0 || producto.estado === false
                    ? "opacity-40"
                    : "cursor-pointer hover:shadow-lg"
                  }`}
              >
                {producto.estado === false && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                    DESACTIVADO
                  </span>
                )}

                {producto.stock === 0 && producto.estado !== false && (
                  <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                    SIN STOCK
                  </span>
                )}

                <img
                  src={
                    producto.imagen
                      ? `${import.meta.env.VITE_API_URL}/uploads/productos/${producto.imagen}`
                      : "https://via.placeholder.com/150"
                  }
                  className="h-24 w-full object-contain"
                />

                <p className="text-sm font-semibold mt-2">{producto.nombre}</p>

                <p className="text-xs text-gray-400">
                  Código: {producto.codigo}
                </p>

                <p className="text-xs text-gray-500">
                  {producto.estado === false
                    ? "Producto desactivado"
                    : `Stock: ${producto.stock}`}
                </p>

                <p className="text-green-600 font-bold mt-1">
                  Q {producto.precio}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CARRITO */}

        <div className="w-full md:w-[340px] bg-white border-t md:border-l md:border-t-0 flex flex-col p-4 shadow-xl md:shadow-none fixed bottom-0 left-0 right-0 md:relative md:h-auto h-[45vh]">
          <h2 className="text-xl font-bold mb-2">Carrito</h2>

          <select
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            className="border rounded-lg p-2 mb-3 w-full text-sm focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="0">Consumidor final</option>

            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="flex-1 overflow-y-auto pr-1">
            {cart.length === 0 && (
              <p className="text-gray-400 text-sm">No hay productos</p>
            )}

            {cart.map((item) => (
              <div key={item.id} className="border-b py-3 flex flex-col gap-1">
                <p className="font-semibold text-sm">{item.nombre}</p>

                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => restarCantidad(item)}
                      className="w-9 h-9 rounded bg-gray-200 hover:bg-gray-300 font-bold text-lg flex items-center justify-center"
                    >
                      -
                    </button>

                    <span className="min-w-[20px] text-center text-sm font-semibold">
                      {item.cantidad}
                    </span>

                    <button
                      onClick={() => sumarCantidad(item)}
                      className="w-9 h-9 rounded bg-gray-200 hover:bg-gray-300 font-bold text-lg flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>

                  <span className="font-semibold text-green-600">
                    Q {item.precio * item.cantidad}
                  </span>
                </div>

                <button
                  onClick={() => eliminarProducto(item.id)}
                  className="text-red-500 text-xs hover:underline w-fit"
                >
                  eliminar
                </button>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <h3 className="text-xl font-bold flex justify-between items-center">
              <span>Total</span>
              <span className="text-green-600">Q {total}</span>
            </h3>

            <button
              onClick={cobrar}
              className="w-full bg-green-600 hover:bg-green-700 active:scale-95 transition text-white py-3 rounded-xl mt-4 font-semibold text-lg"
            >
              Cobrar
            </button>
          </div>
        </div>
      </div>

      <CloseSessionModal
        show={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onConfirm={confirmarCierre}
        onSuspend={suspenderSesion}
        resumen={resumenCaja}
        cashCounted={cashCounted}
        setCashCounted={setCashCounted}
      />
    </div>
  );
}

export default Sales;
