import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        { email, password }
      );

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // CLAVE PARA QUE REACT ACTUALICE TODO
      window.dispatchEvent(new Event("storage"));

      navigate("/dashboard");
    } catch {
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg w-96 p-8">
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="Logo" className="h-20" />
        </div>

        <h2 className="text-center text-xl font-semibold">
          Sistema de Gestión
        </h2>

        <p className="text-center text-red-500 mb-6">Aceitera Rodriguez</p>

        <form onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-100 text-red-700 p-2 mb-4 rounded text-sm text-center">
              {error}
            </div>
          )}

          <label className="block text-sm font-medium mb-1">
            Correo electrónico
          </label>

          <input
            type="email"
            className="w-full border rounded p-2 mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="block text-sm font-medium mb-1">Contraseña</label>

          <input
            type="password"
            className="w-full border rounded p-2 mb-6"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full bg-red-600 text-white py-2 rounded">
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;