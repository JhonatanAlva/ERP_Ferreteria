import { createContext, useContext, useState } from "react";

const PosContext = createContext();

export const PosProvider = ({ children }) => {
  const [posSession, setPosSession] = useState(null);

  const [cartGlobal, setCartGlobal] = useState([]);

  const [clienteGlobal, setClienteGlobal] = useState("Consumidor final");

  const abrirSesion = (id) => {
    setPosSession(id);
  };

  const cerrarSesion = () => {
    setPosSession(null);
    setCartGlobal([]);
    setClienteGlobal("Consumidor final");
  };

  const limpiarCarrito = () => {
    setCartGlobal([]);
  };

  return (
    <PosContext.Provider
      value={{
        posSession,

        abrirSesion,
        cerrarSesion,

        cartGlobal,
        setCartGlobal,

        clienteGlobal,
        setClienteGlobal,

        limpiarCarrito,
      }}
    >
      {children}
    </PosContext.Provider>
  );
};

export const usePos = () => useContext(PosContext);
