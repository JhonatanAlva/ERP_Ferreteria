import { useEffect, useState } from "react";
import api from "../api/axios";

function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role_id: "",
  });

  const token = localStorage.getItem("token");

  async function loadUsers() {
    const res = await api.get(`${import.meta.env.VITE_API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(res.data);
  }

  async function loadRoles() {
    const res = await api.get(`${import.meta.env.VITE_API_URL}/api/roles`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setRoles(res.data);
  }

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  function openCreate() {
    setEditingUser(null);
    setForm({ name: "", email: "", password: "", role_id: "" });
    setShowModal(true);
  }

  function openEdit(user) {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, password: "", role_id: user.role_id });
    setShowModal(true);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function saveUser() {
    if (editingUser) {
      await api.put(
        `${import.meta.env.VITE_API_URL}/api/users/${editingUser.id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } else {
      await api.post(`${import.meta.env.VITE_API_URL}/api/users`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    setShowModal(false);
    loadUsers();
  }

  async function toggleUser(id) {
    await api.patch(
      `${import.meta.env.VITE_API_URL}/api/users/${id}/status`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    loadUsers();
  }

  const getInitials = (name) =>
    name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";

  const avatarColors = [
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-amber-100 text-amber-700",
    "bg-teal-100 text-teal-700",
    "bg-rose-100 text-rose-700",
  ];

  const getAvatarColor = (name) =>
    avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

  return (
    <div className="p-6 space-y-5">

      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Administración</p>
          <h1 className="text-2xl font-semibold text-gray-800">Usuarios</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Nuevo usuario
        </button>
      </div>

      {/* TABLA */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/4">Usuario</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/4">Email</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/6">Rol</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/6">Estado</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/60 transition-colors group">
                  <td className="px-5 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${getAvatarColor(user.name)}`}>
                        {getInitials(user.name)}
                      </div>
                      <span className="font-medium text-gray-700">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{user.email}</td>
                  <td className="px-5 py-5">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${user.active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-500"
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.active ? "bg-green-500" : "bg-red-400"}`} />
                      {user.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-5 py-5">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEdit(user)}
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <path d="M8.5 1.5a1.414 1.414 0 0 1 2 2L4 10 1 11l1-3 6.5-6.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Editar
                      </button>
                      {user.role !== "super_admin" && (
                        <button
                          onClick={() => toggleUser(user.id)}
                          className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md transition-colors ${user.active
                              ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                            }`}
                        >
                          {user.active ? (
                            <>
                              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.4" />
                                <path d="M4 6h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                              </svg>
                              Desactivar
                            </>
                          ) : (
                            <>
                              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.4" />
                                <path d="M4.5 6l1.5 1.5L8 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              Activar
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">

            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">
                  {editingUser ? "Modificar registro" : "Nuevo registro"}
                </p>
                <h2 className="text-lg font-semibold text-gray-800">
                  {editingUser ? "Editar usuario" : "Crear usuario"}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Nombre</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre completo"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-gray-200 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 transition-all placeholder:text-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="correo@ejemplo.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-gray-200 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 transition-all placeholder:text-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Contraseña
                  {editingUser && <span className="text-gray-300 ml-1">(dejar vacío para no cambiar)</span>}
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border border-gray-200 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 transition-all placeholder:text-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Rol</label>
                <select
                  name="role_id"
                  value={form.role_id}
                  onChange={handleChange}
                  className="w-full border border-gray-200 px-3 py-2.5 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 transition-all bg-white appearance-none"
                >
                  <option value="">Seleccionar rol</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveUser}
                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
              >
                Guardar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default Users;