import { useEffect, useState } from "react";
import axios from "axios";
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
      const res = await axios.get(
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
      setForm({
        ...form,
        categoria_id: "",
      });
      return;
    }

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
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

      // crear nueva categoria
      if (mostrarNuevaCategoria && nuevaCategoria) {
        const res = await axios.post(
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
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/productos/${product.id}`,
          data,
        );

        toast.success("Producto actualizado");
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/productos`, data);

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

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          {editMode ? "Editar producto" : "Nuevo producto"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="codigo"
            value={form.codigo}
            onChange={handleChange}
            placeholder="Código"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />

          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />

          {/* SELECT CATEGORIA */}
          <select
            name="categoria_id"
            value={form.categoria_id}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Seleccionar categoría</option>

            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}

            <option value="nueva">➕ Nueva categoría</option>
          </select>
          {mostrarNuevaCategoria && (
            <input
              value={nuevaCategoria}
              onChange={(e) => setNuevaCategoria(e.target.value)}
              placeholder="Nombre de nueva categoría"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <input
              name="precio"
              type="number"
              value={form.precio}
              onChange={handleChange}
              placeholder="Precio"
              className="border rounded-lg px-3 py-2 text-sm"
            />

            <input
              name="costo"
              type="number"
              value={form.costo}
              onChange={handleChange}
              placeholder="Costo"
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              placeholder="Stock"
              className="border rounded-lg px-3 py-2 text-sm"
            />

            <input
              name="stock_minimo"
              type="number"
              value={form.stock_minimo}
              onChange={handleChange}
              placeholder="Stock mínimo"
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Descripción"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />

          {/* IMAGEN */}
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="text-sm"
            />

            {preview && (
              <img
                src={preview}
                alt="preview"
                className="h-24 object-contain border rounded"
              />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-200 rounded-lg"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg"
            >
              {loading ? "Guardando..." : editMode ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductModal;
