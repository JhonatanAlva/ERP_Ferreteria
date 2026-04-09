import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function Clients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const token = localStorage.getItem("token");
  const API = `${import.meta.env.VITE_API_URL}/clients`;

  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 10;

  // =========================
  // OBTENER CLIENTES
  // =========================

  const getClients = async () => {
    try {
      const res = await axios.get(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setClients(res.data);
    } catch {
      toast.error("Error obteniendo clientes");
    }
  };

  useEffect(() => {
    getClients();
  }, []);

  // =========================
  // CREAR CLIENTE
  // =========================

  const createClient = async () => {
    try {
      await axios.post(
        API,
        { ...form, company_id: 1 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Cliente creado");

      closeModal();
      getClients();
    } catch {
      toast.error("Error creando cliente");
    }
  };

  // =========================
  // EDITAR CLIENTE
  // =========================

  const updateClient = async () => {
    try {
      await axios.put(`${API}/${editingClient.id}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Cliente actualizado");

      closeModal();
      getClients();
    } catch {
      toast.error("Error actualizando cliente");
    }
  };

  // =========================
  // DESACTIVAR CLIENTE
  // =========================

  const deactivateClient = async (id) => {
    try {
      await axios.put(
        `${API}/${id}/deactivate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Cliente desactivado");

      getClients();
    } catch {
      toast.error("Error desactivando cliente");
    }
  };

  // =========================
  // REACTIVAR CLIENTE
  // =========================

  const reactivateClient = async (id) => {
    try {
      await axios.put(
        `${API}/${id}/reactivate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Cliente reactivado");

      getClients();
    } catch {
      toast.error("Error reactivando cliente");
    }
  };

  // =========================
  // MODAL
  // =========================

  const openCreateModal = () => {
    setEditingClient(null);

    setForm({
      name: "",
      phone: "",
      email: "",
      address: "",
    });

    setModalOpen(true);
  };

  const openEditModal = (client) => {
    setEditingClient(client);

    setForm({
      name: client.name,
      phone: client.phone,
      email: client.email,
      address: client.address,
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  // =========================
  // FILTRO
  // =========================

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  // =========================
  // PAGINACION
  // =========================

  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;

  const currentClients = filteredClients.slice(
    indexOfFirstClient,
    indexOfLastClient,
  );

  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="p-6">
      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Clientes</h1>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar cliente..."
            className="border p-2 rounded"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Nuevo cliente
          </button>
        </div>
      </div>

      {/* TABLA */}

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Teléfono</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Dirección</th>
              <th className="p-3 text-left">Crédito</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {currentClients.map((client) => (
              <tr key={client.id} className="border-t">
                <td className="p-3">{client.name}</td>
                <td className="p-3">{client.phone}</td>
                <td className="p-3">{client.email}</td>
                <td className="p-3">{client.address}</td>

                <td className="p-3">
                  {client.credito_pendiente > 0 ? (
                    <span className="text-red-600 font-semibold">
                      Q{client.credito_pendiente}
                    </span>
                  ) : (
                    <span className="text-green-600">Sin deuda</span>
                  )}
                </td>

                <td className="p-3">
                  {client.active ? (
                    <span className="text-green-600 font-semibold">Activo</span>
                  ) : (
                    <span className="text-red-500 font-semibold">Inactivo</span>
                  )}
                </td>

                <td className="p-3 flex gap-2 justify-center">
                  {client.credito_pendiente > 0 ? (
                    <button
                      onClick={() =>
                        (window.location.href = `/clients/${client.id}/creditos`)
                      }
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Ver créditos
                    </button>
                  ) : (
                    <button
                      disabled
                      className="bg-gray-300 text-gray-600 px-3 py-1 rounded cursor-not-allowed"
                    >
                      Sin deuda
                    </button>
                  )}

                  <button
                    onClick={() => openEditModal(client)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Editar
                  </button>

                  {client.active ? (
                    <button
                      onClick={() => deactivateClient(client.id)}
                      className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                    >
                      Desactivar
                    </button>
                  ) : (
                    <button
                      onClick={() => reactivateClient(client.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Reactivar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINACION */}

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-600">
          Mostrando {indexOfFirstClient + 1}–
          {Math.min(indexOfLastClient, filteredClients.length)} de{" "}
          {filteredClients.length} clientes
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

      {/* MODAL CREAR / EDITAR */}

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingClient ? "Editar cliente" : "Nuevo cliente"}
            </h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre"
                className="border p-2 rounded w-full"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <input
                type="text"
                placeholder="Teléfono"
                className="border p-2 rounded w-full"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />

              <input
                type="email"
                placeholder="Email"
                className="border p-2 rounded w-full"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />

              <input
                type="text"
                placeholder="Dirección"
                className="border p-2 rounded w-full"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />

              <div className="flex justify-end gap-2 pt-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border rounded"
                >
                  Cancelar
                </button>

                <button
                  onClick={editingClient ? updateClient : createClient}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clients;
