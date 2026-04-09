import { useEffect, useState } from "react";
import axios from "axios";

function AlertPanel() {
  const [alertas, setAlertas] = useState({
    stockBajo: 0,
    sinStock: 0,
    desactivados: 0,
  });

  useEffect(() => {
    cargarAlertas();
  }, []);

  const cargarAlertas = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/productos`,
      );

      const productos = res.data;

      const stockBajo = productos.filter(
        (p) => p.stock <= p.stock_minimo && p.stock > 0,
      ).length;

      const sinStock = productos.filter((p) => p.stock === 0).length;

      const desactivados = productos.filter((p) => !p.estado).length;

      setAlertas({
        stockBajo,
        sinStock,
        desactivados,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="text-lg font-semibold mb-4">🔔 Alertas del sistema</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-yellow-600">⚠ Stock bajo</span>

          <span className="font-semibold">{alertas.stockBajo}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-red-600">⛔ Sin stock</span>

          <span className="font-semibold">{alertas.sinStock}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">📦 Productos desactivados</span>

          <span className="font-semibold">{alertas.desactivados}</span>
        </div>
      </div>
    </div>
  );
}

export default AlertPanel;
