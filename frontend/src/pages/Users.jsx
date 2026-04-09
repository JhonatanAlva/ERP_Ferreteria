import { useEffect, useState } from "react";
import axios from "axios";

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
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setUsers(res.data);
  }

  async function loadRoles() {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/roles`, {
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

    setForm({
      name: "",
      email: "",
      password: "",
      role_id: "",
    });

    setShowModal(true);
  }

  function openEdit(user) {
    setEditingUser(user);

    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role_id: user.role_id,
    });

    setShowModal(true);
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function saveUser() {
    if (editingUser) {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/${editingUser.id}`,
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } else {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/users`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    setShowModal(false);
    loadUsers();
  }

  async function toggleUser(id) {
    await axios.patch(
      `${import.meta.env.VITE_API_URL}/api/users/${id}/status`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    loadUsers();
  }

  return (
    <div className="p-4 md:p-10">
      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Gestión de Usuarios</h1>

        <button
          onClick={openCreate}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full md:w-auto"
        >
          + Nuevo Usuario
        </button>
      </div>

      {/* TABLA */}

      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="min-w-[650px] w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Rol</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-3">{user.name}</td>

                <td className="p-3">{user.email}</td>

                <td className="p-3">{user.role}</td>

                <td className="p-3">
                  {user.active ? (
                    <span className="text-green-600 font-semibold">Activo</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Inactivo</span>
                  )}
                </td>

                <td className="p-3 flex gap-2 flex-wrap">
                  <button
                    onClick={() => openEdit(user)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                  >
                    Editar
                  </button>

                  {user.role !== "super_admin" && (
                    <button
                      onClick={() => toggleUser(user.id)}
                      className={`px-3 py-1 rounded text-white text-sm
                        ${
                          user.active
                            ? "bg-yellow-500 hover:bg-yellow-600"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                    >
                      {user.active ? "Desactivar" : "Activar"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
            </h2>

            <input
              type="text"
              name="name"
              placeholder="Nombre"
              value={form.name}
              onChange={handleChange}
              className="w-full border p-2 mb-3 rounded"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full border p-2 mb-3 rounded"
            />

            <input
              type="password"
              name="password"
              placeholder={
                editingUser ? "Nueva contraseña (opcional)" : "Contraseña"
              }
              value={form.password}
              onChange={handleChange}
              className="w-full border p-2 mb-3 rounded"
            />

            <select
              name="role_id"
              value={form.role_id}
              onChange={handleChange}
              className="w-full border p-2 mb-4 rounded"
            >
              <option value="">Seleccionar rol</option>

              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>

            <div className="flex flex-col md:flex-row justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancelar
              </button>

              <button
                onClick={saveUser}
                className="px-4 py-2 bg-red-600 text-white rounded"
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
