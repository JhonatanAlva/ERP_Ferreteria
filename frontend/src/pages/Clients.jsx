import { useEffect, useState } from "react";
import api from "../api/axios";
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

  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 10;

  // =========================
  // OBTENER CLIENTES
  // =========================
  const getClients = async () => {
    try {
      // ✅ api ya tiene el token — sin headers manuales, sin VITE_API_URL
      const res = await api.get("/clients");
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
      await api.post("/clients", { ...form, company_id: 1 });
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
      await api.put(`/clients/${editingClient.id}`, form);
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
      await api.put(`/clients/${id}/deactivate`, {});
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
      await api.put(`/clients/${id}/reactivate`, {});
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
    setForm({ name: "", phone: "", email: "", address: "" });
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

  const closeModal = () => setModalOpen(false);

  // =========================
  // FILTRO
  // =========================
  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  // =========================
  // PAGINACION
  // =========================
  const indexOfLastClient  = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients     = filteredClients.slice(indexOfFirstClient, indexOfLastClient);
  const totalPages         = Math.ceil(filteredClients.length / clientsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Gestión</p>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Clientes</h1>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Buscar cliente..."
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-56"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200"
          >
            + Nuevo cliente
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Teléfono</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Dirección</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Crédito</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors duration-100">
                  <td className="px-5 py-3.5 font-semibold text-gray-800 text-sm">{client.name}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{client.phone}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{client.email}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{client.address}</td>
                  <td className="px-5 py-3.5">
                    {client.credito_pendiente > 0 ? (
                      <span className="inline-flex items-center bg-red-50 text-red-600 border border-red-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                        Q{client.credito_pendiente}
                      </span>
                    ) : (
                      <span className="inline-flex items-center bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                        Sin deuda
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {client.active ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block"></span>Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2 justify-center">
                      {client.credito_pendiente > 0 ? (
                        <button
                          onClick={() => (window.location.href = `/clients/${client.id}/creditos`)}
                          className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors duration-150"
                        >
                          Ver créditos
                        </button>
                      ) : (
                        <button disabled className="bg-gray-100 text-gray-400 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-not-allowed">
                          Sin deuda
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(client)}
                        className="bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors duration-150"
                      >
                        Editar
                      </button>
                      {client.active ? (
                        <button
                          onClick={() => deactivateClient(client.id)}
                          className="bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors duration-150"
                        >
                          Desactivar
                        </button>
                      ) : (
                        <button
                          onClick={() => reactivateClient(client.id)}
                          className="bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors duration-150"
                        >
                          Reactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINACION */}
        <div className="flex justify-between items-center px-5 py-4 border-t border-gray-100 bg-gray-50">
          <span className="text-xs text-gray-500">
            Mostrando{" "}
            <span className="font-semibold text-gray-700">{indexOfFirstClient + 1}–{Math.min(indexOfLastClient, filteredClients.length)}</span>
            {" "}de{" "}
            <span className="font-semibold text-gray-700">{filteredClients.length}</span> clientes
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
      </div>

      {/* MODAL CREAR / EDITAR */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-extrabold text-gray-800">
                  {editingClient ? "Editar cliente" : "Nuevo cliente"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {editingClient ? "Modifica los datos del cliente" : "Completa la información del cliente"}
                </p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none transition-colors">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {[
                { label: "Nombre",    key: "name",    type: "text",  placeholder: "Ej. Juan García" },
                { label: "Teléfono",  key: "phone",   type: "text",  placeholder: "Ej. 5555-1234" },
                { label: "Email",     key: "email",   type: "email", placeholder: "correo@ejemplo.com" },
                { label: "Dirección", key: "address", type: "text",  placeholder: "Ciudad, zona..." },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={editingClient ? updateClient : createClient}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              >
                {editingClient ? "Guardar cambios" : "Crear cliente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clients;