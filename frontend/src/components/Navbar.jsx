import { Link } from "react-router-dom";
import { useState } from "react";
import { usePos } from "../context/PosContext";

function Navbar() {
  const [open, setOpen] = useState(false);
  const { posSession } = usePos();

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <nav className="bg-gray-900 text-white shadow-md w-full border-t-4 border-red-600">
      <div className="w-full px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img src="/logo.png" alt="logo" className="h-10" />
          </div>

          {/* Botón menú móvil */}
          <div className="md:hidden">
            <button
              onClick={() => setOpen(!open)}
              className="text-white text-2xl"
            >
              {open ? "✕" : "☰"}
            </button>
          </div>

          {/* Menú Desktop */}
          <div className="hidden md:flex flex-1 justify-center space-x-8 font-medium">
            {!posSession && (
              <>
                <Link to="/dashboard" className="hover:text-red-500">
                  Inicio
                </Link>

                {user?.role_id !== 3 && (
                  <>
                    <Link to="/clients" className="hover:text-red-500">
                      Clientes
                    </Link>

                    <Link to="/products" className="hover:text-red-500">
                      Productos
                    </Link>
                  </>
                )}

                <Link to="/sales" className="hover:text-red-500">
                  Ventas
                </Link>

                {/*MÓDULO REPORTES */}
                {user?.role_id !== 3 && (
                  <Link to="/reports" className="hover:text-red-500">
                    Reportes
                  </Link>
                )}

                {user?.role_id === 1 && (
                  <Link to="/users" className="hover:text-red-500">
                    Usuarios
                  </Link>
                )}
              </>
            )}

            {posSession && (
              <span className="text-red-400 font-bold">
                POS activo (Sesión #{posSession})
              </span>
            )}
          </div>

          {/* Logout Desktop */}
          <div className="hidden md:block">
            <button
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/";
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      {/* MENÚ MÓVIL */}
      {open && (
        <div className="md:hidden bg-gray-900 border-t border-gray-700 px-6 pb-4 space-y-4">
          {!posSession && (
            <>
              <Link
                to="/dashboard"
                className="block hover:text-red-500"
                onClick={() => setOpen(false)}
              >
                Inicio
              </Link>

              {user?.role_id !== 3 && (
                <>
                  <Link
                    to="/clients"
                    className="block hover:text-red-500"
                    onClick={() => setOpen(false)}
                  >
                    Clientes
                  </Link>

                  <Link
                    to="/products"
                    className="block hover:text-red-500"
                    onClick={() => setOpen(false)}
                  >
                    Productos
                  </Link>
                </>
              )}

              <Link
                to="/sales"
                className="block hover:text-red-500"
                onClick={() => setOpen(false)}
              >
                Ventas
              </Link>

              {/* ✅ NUEVO MÓDULO REPORTES */}
              {user?.role_id !== 3 && (
                <Link
                  to="/reports"
                  className="block hover:text-red-500"
                  onClick={() => setOpen(false)}
                >
                  Reportes
                </Link>
              )}

              {user?.role_id === 1 && (
                <Link
                  to="/users"
                  className="block hover:text-red-500"
                  onClick={() => setOpen(false)}
                >
                  Usuarios
                </Link>
              )}
            </>
          )}

          {/* Logout móvil */}
          <button
            className="bg-red-600 text-white w-full py-2 rounded hover:bg-red-700"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/";
            }}
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;