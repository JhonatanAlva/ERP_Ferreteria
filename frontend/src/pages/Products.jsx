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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Productos</h2>

        <button
          onClick={() => {
            setProductoEditar(null);
            setModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm shadow"
        >
          + Nuevo producto
        </button>
      </div>

      {/* FILTROS */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar nombre o código..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
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
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setCategoriaFiltro("")}
          className={`px-3 py-1 rounded-full text-sm border ${
            categoriaFiltro === "" ? "bg-blue-600 text-white" : "bg-white"
          }`}
        >
          Todas
        </button>

        {categorias.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoriaFiltro(cat.id)}
            className={`px-3 py-1 rounded-full text-sm border ${
              categoriaFiltro === cat.id ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* GRID PRODUCTOS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {productosPagina.map((producto) => (
          <div
            key={producto.id}
            className={`bg-white rounded-xl shadow-sm hover:shadow-md transition p-4 ${
              !producto.estado && "opacity-60"
            }`}
          >
            {/* IMAGEN */}
            <img
              src={
                producto.imagen
                  ? `${import.meta.env.VITE_API_URL}/uploads/productos/${producto.imagen}`
                  : "https://via.placeholder.com/150?text=Producto"
              }
              alt={producto.nombre}
              className="w-full h-28 object-contain rounded-lg mb-3 bg-gray-50 p-2"
            />

            {/* NOMBRE */}
            <h3 className="text-sm font-semibold truncate">
              {producto.nombre}
            </h3>

            {/* BADGE CATEGORIA */}
            <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mt-1">
              {producto.categoria_nombre}
            </span>

            {/* CODIGO */}
            <p className="text-xs text-gray-500 mt-1">
              Código: {producto.codigo}
            </p>

            {/* PRECIO */}
            <p className="text-green-600 font-bold text-base mt-1">
              Q {producto.precio}
            </p>

            {/* STOCK */}
            <p
              className={`text-xs font-semibold ${
                producto.stock <= producto.stock_minimo
                  ? "text-red-600"
                  : producto.stock <= producto.stock_minimo * 2
                    ? "text-yellow-600"
                    : "text-green-600"
              }`}
            >
              Stock: {producto.stock}
            </p>

            {producto.stock <= producto.stock_minimo && producto.stock > 0 && (
              <span className="text-xs text-red-500 font-semibold">
                ⚠ Stock bajo
              </span>
            )}

            {producto.stock === 0 && (
              <span className="text-xs text-red-600 font-bold">
                ⛔ Sin stock
              </span>
            )}

            {/* ESTADO */}
            <p
              className={`text-xs font-semibold ${
                producto.estado ? "text-green-600" : "text-red-500"
              }`}
            >
              {producto.estado ? "Activo" : "Inactivo"}
            </p>

            {/* BOTONES */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  setProductoEditar(producto);
                  setModalOpen(true);
                }}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-xs py-1.5 rounded-md"
              >
                Editar
              </button>

              {producto.estado ? (
                <button
                  onClick={() => desactivarProducto(producto.id)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-xs py-1.5 rounded-md"
                >
                  Desactivar
                </button>
              ) : (
                <button
                  onClick={() => activarProducto(producto.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-1.5 rounded-md"
                >
                  Activar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* PAGINACION */}
      <div className="flex justify-between items-center mt-6">
        <span className="text-sm text-gray-600">
          Mostrando {indexFirst + 1}–
          {Math.min(indexLast, productosOrdenados.length)} de{" "}
          {productosOrdenados.length} productos
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="px-3 py-1 border rounded"
          >
            Anterior
          </button>

          <span className="px-3 py-1">
            Página {currentPage} de {totalPages || 1}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="px-3 py-1 border rounded"
          >
            Siguiente
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
