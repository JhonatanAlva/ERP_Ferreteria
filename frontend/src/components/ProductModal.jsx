import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

function ProductModal({ isOpen, onClose, onSaved, product }) {
  const editMode = !!product;

  const [categorias, setCategorias] = useState([]);

  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    categoria_id: "",
    precio: "",
    costo: "",
    stock: "",
    stock_minimo: "",
    descripcion: "",
  });

  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [mostrarNuevaCategoria, setMostrarNuevaCategoria] = useState(false);

  // =============================
  // CARGAR CATEGORIAS
  // =============================
  const cargarCategorias = async () => {
    try {
      const res = await api.get(
        `${import.meta.env.VITE_API_URL}/api/categorias`,
      );

      setCategorias(res.data);
    } catch (error) {
      toast.error("Error cargando categorías");
    }
  };

  // =============================
  // CUANDO SE ABRE EL MODAL
  // =============================
  useEffect(() => {
    cargarCategorias();

    if (product) {
      setForm({
        codigo: product.codigo || "",
        nombre: product.nombre || "",
        categoria_id: product.categoria_id || "",
        precio: product.precio || "",
        costo: product.costo || "",
        stock: product.stock || "",
        stock_minimo: product.stock_minimo || "",
        descripcion: product.descripcion || "",
      });

      if (product.imagen) {
        setPreview(
          `${import.meta.env.VITE_API_URL}/uploads/productos/${product.imagen}`,
        );
      }
    } else {
      setForm({
        codigo: "",
        nombre: "",
        categoria_id: "",
        precio: "",
        costo: "",
        stock: "",
        stock_minimo: "",
        descripcion: "",
      });

      setPreview(null);
      setImagen(null);
    }
  }, [product, isOpen]);

  // =============================
  // INPUT CHANGE
  // =============================
  const handleChange = (e) => {
    if (e.target.name === "categoria_id" && e.target.value === "nueva") {
      setMostrarNuevaCategoria(true);
      setForm({ ...form, categoria_id: "" });
      return;
    }

    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // =============================
  // IMAGEN
  // =============================
  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  // =============================
  // GUARDAR PRODUCTO
  // =============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      let categoriaId = form.categoria_id;

      if (mostrarNuevaCategoria && nuevaCategoria) {
        const res = await api.post(
          `${import.meta.env.VITE_API_URL}/api/categorias`,
          { nombre: nuevaCategoria },
        );

        categoriaId = res.data.id;
      }

      const data = new FormData();

      Object.keys(form).forEach((key) => {
        if (key === "categoria_id") {
          data.append("categoria_id", categoriaId);
        } else {
          data.append(key, form[key]);
        }
      });

      if (imagen) {
        data.append("imagen", imagen);
      }

      if (editMode) {
        await api.put(
          `${import.meta.env.VITE_API_URL}/api/productos/${product.id}`,
          data,
        );

        toast.success("Producto actualizado");
      } else {
        await api.post(`${import.meta.env.VITE_API_URL}/api/productos`, data);

        toast.success("Producto creado");
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error guardando producto");
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition";

  const labelClass =
    "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-extrabold text-gray-800">
              {editMode ? "Editar producto" : "Nuevo producto"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {editMode ? "Modifica los datos del producto" : "Completa la información del producto"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* BODY — scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">

            {/* IMAGEN PREVIEW + UPLOAD */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                {preview ? (
                  <img src={preview} alt="preview" className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-3xl">📦</span>
                )}
              </div>
              <div>
                <label className={labelClass}>Imagen del producto</label>
                <label className="inline-flex items-center gap-2 cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
                  Subir imagen
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImage}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Código</label>
                <input
                  name="codigo"
                  value={form.codigo}
                  onChange={handleChange}
                  placeholder="Ej. PROD-001"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Nombre</label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Nombre del producto"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* CATEGORIA */}
            <div>
              <label className={labelClass}>Categoría</label>
              <select
                name="categoria_id"
                value={form.categoria_id}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
                <option value="nueva">➕ Nueva categoría</option>
              </select>
            </div>

            {mostrarNuevaCategoria && (
              <div>
                <label className={labelClass}>Nueva categoría</label>
                <input
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                  placeholder="Nombre de la nueva categoría"
                  className={inputClass}
                />
              </div>
            )}

            {/* PRECIO / COSTO */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Precio (Q)</label>
                <input
                  name="precio"
                  type="number"
                  value={form.precio}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Costo (Q)</label>
                <input
                  name="costo"
                  type="number"
                  value={form.costo}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
            </div>

            {/* STOCK */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Stock actual</label>
                <input
                  name="stock"
                  type="number"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="0"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Stock mínimo</label>
                <input
                  name="stock_minimo"
                  type="number"
                  value={form.stock_minimo}
                  onChange={handleChange}
                  placeholder="0"
                  className={inputClass}
                />
              </div>
            </div>

            {/* DESCRIPCION */}
            <div>
              <label className={labelClass}>Descripción</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Descripción opcional del producto..."
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              {loading ? "Guardando..." : editMode ? "Actualizar" : "Crear producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductModal;