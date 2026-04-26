import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        { email, password }
      );

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new Event("storage"));

      navigate("/dashboard");
    } catch {
      setError("Datos incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white border border-gray-200 shadow-lg rounded-2xl w-96 p-8">

        {/* Logo */}
        <div className="flex justify-center mb-5">
          <img src="/logo.png" alt="Logo Aceitera Rodriguez" className="h-20 object-contain" />
        </div>

        {/* Títulos */}
        <h2 className="text-center text-lg font-bold text-gray-900 tracking-tight">
          Sistema de Gestión
        </h2>
        <p className="text-center text-red-600 font-semibold text-sm mb-7">
          Aceitera Rodriguez
        </p>

        <form onSubmit={handleLogin} noValidate>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center rounded-xl px-3 py-2.5 mb-5">
              {error}
            </div>
          )}

          {/* Email */}
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Correo electrónico
          </label>
          <input
            type="email"
            autoComplete="email"
            placeholder="usuario@empresa.com"
            className="w-full bg-white border border-gray-300 text-gray-900 placeholder-gray-400 rounded-xl px-3 py-2.5 text-sm mb-4 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-colors duration-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password */}
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Contraseña
          </label>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full bg-white border border-gray-300 text-gray-900 placeholder-gray-400 rounded-xl px-3 py-2.5 text-sm mb-6 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-colors duration-200"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors duration-200 text-sm tracking-wide"
          >
            {loading ? "Verificando..." : "Iniciar sesión"}
          </button>

        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Aceitera Rodriguez
        </p>
      </div>
    </div>
  );
}

export default Login;