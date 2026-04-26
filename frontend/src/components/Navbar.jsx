import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { usePos } from "../context/PosContext";

function Navbar() {
  const [open, setOpen] = useState(false);
  const { posSession } = usePos();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `text-sm transition-colors px-3 py-1.5 rounded-md ${
      isActive(path)
        ? "text-white bg-white/10"
        : "text-gray-400 hover:text-white hover:bg-white/5"
    }`;

  return (
    <nav className="bg-gray-950 text-white w-full border-b border-gray-800">
      <div className="w-full px-6">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <div className="flex items-center shrink-0">
            <img src="/logo.png" alt="logo" className="h-8 w-auto" />
          </div>

          {/* Menú Desktop */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {!posSession && (
              <>
                <Link to="/dashboard" className={linkClass("/dashboard")}>Inicio</Link>

                {user?.role_id !== 3 && (
                  <>
                    <Link to="/clients" className={linkClass("/clients")}>Clientes</Link>
                    <Link to="/products" className={linkClass("/products")}>Productos</Link>
                  </>
                )}

                <Link to="/sales" className={linkClass("/sales")}>Ventas</Link>

                {user?.role_id !== 3 && (
                  <Link to="/reports" className={linkClass("/reports")}>Reportes</Link>
                )}

                {user?.role_id === 1 && (
                  <Link to="/users" className={linkClass("/users")}>Usuarios</Link>
                )}
              </>
            )}

            {posSession && (
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-400 font-medium">
                  POS activo — Sesión #{posSession}
                </span>
              </div>
            )}
          </div>

          {/* Derecha: usuario + logout */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {user?.name && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-200">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span>{user.name}</span>
              </div>
            )}

            <div className="w-px h-4 bg-gray-700" />

            <button
              className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/";
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2H2.5A1.5 1.5 0 0 0 1 3.5v7A1.5 1.5 0 0 0 2.5 12H5M9.5 9.5 13 7l-3.5-2.5M13 7H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Salir
            </button>
          </div>

          {/* Botón menú móvil */}
          <div className="md:hidden">
            <button
              onClick={() => setOpen(!open)}
              className="text-gray-400 hover:text-white p-1.5 rounded-md transition-colors"
            >
              {open ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* MENÚ MÓVIL */}
      {open && (
        <div className="md:hidden border-t border-gray-800 px-4 py-3 space-y-1">
          {!posSession && (
            <>
              <Link to="/dashboard" className="block px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setOpen(false)}>
                Inicio
              </Link>

              {user?.role_id !== 3 && (
                <>
                  <Link to="/clients" className="block px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setOpen(false)}>
                    Clientes
                  </Link>
                  <Link to="/products" className="block px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setOpen(false)}>
                    Productos
                  </Link>
                </>
              )}

              <Link to="/sales" className="block px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setOpen(false)}>
                Ventas
              </Link>

              {user?.role_id !== 3 && (
                <Link to="/reports" className="block px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setOpen(false)}>
                  Reportes
                </Link>
              )}

              {user?.role_id === 1 && (
                <Link to="/users" className="block px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setOpen(false)}>
                  Usuarios
                </Link>
              )}
            </>
          )}

          <div className="pt-2 border-t border-gray-800 mt-2">
            <button
              className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/";
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2H2.5A1.5 1.5 0 0 0 1 3.5v7A1.5 1.5 0 0 0 2.5 12H5M9.5 9.5 13 7l-3.5-2.5M13 7H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;