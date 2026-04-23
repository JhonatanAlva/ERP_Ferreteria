function CloseSessionModal({
  show,
  onClose,
  onConfirm,
  onSuspend,
  resumen,
  cashCounted,
  setCashCounted,
}) {
  if (!show) return null;

  const dineroInicial = Number(resumen?.dinero_inicial || 0);
  const ventasEfectivo = Number(resumen?.ventas_efectivo || 0);
  const ventasCredito = Number(resumen?.ventas_credito || 0);
  const totalVendido = Number(resumen?.total_vendido || 0);
  const ventasTarjeta = Number(resumen?.ventas_tarjeta || 0);

  const esperado = dineroInicial + ventasEfectivo;

  const contado = Number(cashCounted || 0);
  const diferencia = contado - esperado;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[450px] shadow-lg">
        <h2 className="text-xl font-bold mb-5">Cierre de sesión POS</h2>

        {!resumen ? (
          <p className="text-gray-500 text-sm mb-5">
            Cargando resumen de caja...
          </p>
        ) : (
          <div className="text-sm space-y-3 mb-5">
            <div className="flex justify-between">
              <span>Apertura de caja</span>
              <b>Q {dineroInicial.toFixed(2)}</b>
            </div>

            <div className="flex justify-between text-green-600">
              <span>Ventas en efectivo</span>
              <b>Q {ventasEfectivo.toFixed(2)}</b>
            </div>

            <div className="flex justify-between text-blue-600">
              <span>Ventas con tarjeta</span>
              <b>Q {ventasTarjeta.toFixed(2)}</b>
            </div>

            <div className="flex justify-between text-yellow-600">
              <span>Ventas a crédito</span>
              <b>Q {ventasCredito.toFixed(2)}</b>
            </div>

            <div className="flex justify-between text-gray-700">
              <span>Total vendido</span>
              <b>Q {totalVendido.toFixed(2)}</b>
            </div>

            <hr />

            <div className="flex justify-between text-lg font-bold">
              <span>Total esperado en caja</span>
              <span>Q {esperado.toFixed(2)}</span>
            </div>
          </div>
        )}

        <input
          type="number"
          placeholder="Dinero contado en caja"
          value={cashCounted}
          onChange={(e) => setCashCounted(e.target.value)}
          className="border p-3 rounded w-full"
        />

        <p className="mt-3 text-sm flex justify-between">
          <span>Diferencia:</span>

          <b
            className={
              diferencia === 0
                ? "text-green-600"
                : diferencia > 0
                  ? "text-blue-600"
                  : "text-red-600"
            }
          >
            Q {diferencia.toFixed(2)}
          </b>
        </p>

        <div className="flex justify-between mt-6">
          <button
            onClick={onSuspend}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
          >
            Suspender
          </button>

          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
              Cancelar
            </button>

            <button
              onClick={onConfirm}
              disabled={cashCounted === "" || cashCounted === null}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CloseSessionModal;
