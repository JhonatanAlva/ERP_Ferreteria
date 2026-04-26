import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ProductModal from "../components/ProductModal";

function Products() {
  const [products, setProducts] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [search, setSearch] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);

  // PAGINACION
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  useEffect(() => {
    obtenerProductos();
    obtenerCategorias();
  }, []);

  // =========================
  // ALERTAS DE STOCK
  // =========================
  const verificarStockBajo = (productos) => {
    const bajos = productos.filter(
      (p) => p.stock <= p.stock_minimo && p.stock > 0,
    );

    const agotados = productos.filter((p) => p.stock === 0);

    if (bajos.length > 0) {
      const nombres = bajos.map((p) => p.nombre).join(", ");
      toast.error(`⚠ Stock bajo: ${nombres}`, { duration: 5000 });
    }

    if (agotados.length > 0) {
      const nombres = agotados.map((p) => p.nombre).join(", ");
      toast.error(`⛔ Productos sin stock: ${nombres}`, { duration: 6000 });
    }
  };

  // =========================
  // OBTENER PRODUCTOS
  // =========================
  const obtenerProductos = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/productos`,
      );

      setProducts(res.data);
      verificarStockBajo(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Error cargando productos");
    }
  };

  // =========================
  // OBTENER CATEGORIAS
  // =========================
  const obtenerCategorias = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/categorias`,
      );

      setCategorias(res.data);
    } catch (error) {
      toast.error("Error cargando categorías");
    }
  };

  // =========================
  // DESACTIVAR PRODUCTO
  // =========================
  const desactivarProducto = async (id) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/productos/desactivar/${id}`,
      );

      toast.success("Producto desactivado");
      obtenerProductos();
    } catch (error) {
      toast.error("Error desactivando producto");
    }
  };

  // =========================
  // ACTIVAR PRODUCTO
  // =========================
  const activarProducto = async (id) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/productos/activar/${id}`,
      );

      toast.success("Producto activado");
      obtenerProductos();
    } catch (error) {
      toast.error("Error activando producto");
    }
  };

  // =========================
  // FILTROS
  // =========================
  const productosFiltrados = products.filter((p) => {
    const coincideTexto =
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo.toLowerCase().includes(search.toLowerCase());

    const coincideCategoria =
      categoriaFiltro === "" || p.categoria_id === Number(categoriaFiltro);

    return coincideTexto && coincideCategoria;
  });

  // =========================
  // ORDENAR POR STOCK BAJO
  // =========================
  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    if (a.stock <= a.stock_minimo && b.stock > b.stock_minimo) return -1;
    if (a.stock > a.stock_minimo && b.stock <= b.stock_minimo) return 1;
    return 0;
  });

  // =========================
  // PAGINACION
  // =========================
  const indexLast = currentPage * productsPerPage;
  const indexFirst = indexLast - productsPerPage;

  const productosPagina = productosOrdenados.slice(indexFirst, indexLast);

  const totalPages = Math.ceil(productosOrdenados.length / productsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoriaFiltro]);

  const stockBajoCount = products.filter(
    (p) => p.stock <= p.stock_minimo && p.stock > 0
  ).length;
  const sinStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Inventario</p>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Productos</h1>
        </div>

        <button
          onClick={() => {
            setProductoEditar(null);
            setModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200"
        >
          + Nuevo producto
        </button>
      </div>

      {/* STAT CHIPS DE ALERTA */}
      {(stockBajoCount > 0 || sinStockCount > 0) && (
        <div className="flex flex-wrap gap-3">
          {stockBajoCount > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-xs font-semibold text-amber-700">
              ⚠️ {stockBajoCount} con stock bajo
            </div>
          )}
          {sinStockCount > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-xs font-semibold text-red-700">
              ⛔ {sinStockCount} sin stock
            </div>
          )}
        </div>
      )}

      {/* FILTROS */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Buscar nombre o código..."
            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* CHIPS CATEGORIAS */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoriaFiltro("")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors duration-150 ${
            categoriaFiltro === ""
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
        >
          Todas
        </button>

        {categorias.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoriaFiltro(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors duration-150 ${
              categoriaFiltro === cat.id
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* GRID PRODUCTOS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {productosPagina.map((producto) => {
          const sinStock = producto.stock === 0;
          const stockBajo = producto.stock <= producto.stock_minimo && producto.stock > 0;

          return (
            <div
              key={producto.id}
              className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col ${
                !producto.estado ? "opacity-60" : ""
              } ${sinStock ? "border-red-200" : stockBajo ? "border-amber-200" : "border-gray-200"}`}
            >
              {/* IMAGEN */}
              <div className="bg-gray-50 p-3">
                <img
                  src={
                    producto.imagen
                      ? `${import.meta.env.VITE_API_URL}/uploads/productos/${producto.imagen}`
                      : "https://via.placeholder.com/150?text=Producto"
                  }
                  alt={producto.nombre}
                  className="w-full h-28 object-contain rounded-lg"
                />
              </div>

              {/* INFO */}
              <div className="p-3 flex flex-col flex-1">
                {/* BADGE CATEGORIA */}
                <span className="inline-block text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-lg font-semibold mb-1.5 self-start">
                  {producto.categoria_nombre}
                </span>

                {/* NOMBRE */}
                <h3 className="text-sm font-bold text-gray-800 truncate mb-0.5">
                  {producto.nombre}
                </h3>

                {/* CODIGO */}
                <p className="text-xs text-gray-400 mb-2">
                  {producto.codigo}
                </p>

                {/* PRECIO */}
                <p className="text-emerald-600 font-black text-lg leading-none mb-2">
                  Q {producto.precio}
                </p>

                {/* STOCK */}
                <div className="flex items-center gap-1.5 mb-1">
                  {sinStock ? (
                    <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 text-xs font-bold px-2 py-0.5 rounded-lg">
                      ⛔ Sin stock
                    </span>
                  ) : stockBajo ? (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 border border-amber-200 text-xs font-bold px-2 py-0.5 rounded-lg">
                      ⚠️ Stock: {producto.stock}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold px-2 py-0.5 rounded-lg">
                      Stock: {producto.stock}
                    </span>
                  )}
                </div>

                {/* ESTADO */}
                <div className="flex items-center gap-1.5 mb-3">
                  <span className={`w-1.5 h-1.5 rounded-full ${producto.estado ? "bg-emerald-500" : "bg-gray-400"}`}></span>
                  <span className={`text-xs font-semibold ${producto.estado ? "text-emerald-600" : "text-gray-400"}`}>
                    {producto.estado ? "Activo" : "Inactivo"}
                  </span>
                </div>

                {/* BOTONES */}
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => {
                      setProductoEditar(producto);
                      setModalOpen(true);
                    }}
                    className="flex-1 bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 text-xs font-semibold py-1.5 rounded-lg transition-colors duration-150"
                  >
                    Editar
                  </button>

                  {producto.estado ? (
                    <button
                      onClick={() => desactivarProducto(producto.id)}
                      className="flex-1 bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 text-xs font-semibold py-1.5 rounded-lg transition-colors duration-150"
                    >
                      Desactivar
                    </button>
                  ) : (
                    <button
                      onClick={() => activarProducto(producto.id)}
                      className="flex-1 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold py-1.5 rounded-lg transition-colors duration-150"
                    >
                      Activar
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PAGINACION */}
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          Mostrando{" "}
          <span className="font-semibold text-gray-700">{indexFirst + 1}–{Math.min(indexLast, productosOrdenados.length)}</span>
          {" "}de{" "}
          <span className="font-semibold text-gray-700">{productosOrdenados.length}</span> productos
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>

          <span className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg">
            {currentPage} / {totalPages || 1}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente →
          </button>
        </div>
      </div>

      {/* MODAL */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={obtenerProductos}
        product={productoEditar}
      />
    </div>
  );
}

export default Products;