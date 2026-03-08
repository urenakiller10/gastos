import { useEffect, useMemo, useState } from "react";
import { getTransactions } from "../services/transactions";

function Ahorro() {
  const [transacciones, setTransacciones] = useState([]);

  useEffect(() => {
    async function loadTransactions() {
      const data = await getTransactions();
      setTransacciones(data);
    }

    loadTransactions();
  }, []);

  const ahorros = useMemo(() => {
    return transacciones.filter((item) => item.categoria === "Ahorro");
  }, [transacciones]);

  const totalAhorrado = useMemo(() => {
    return ahorros.reduce((acc, item) => acc + Number(item.monto || 0), 0);
  }, [ahorros]);

  const ahorrosPorPeriodo = useMemo(() => {
    const grupos = {};

    ahorros.forEach((item) => {
      if (!grupos[item.periodo]) {
        grupos[item.periodo] = 0;
      }

      grupos[item.periodo] += Number(item.monto || 0);
    });

    return Object.entries(grupos).map(([periodo, monto]) => ({
      periodo,
      monto,
    }));
  }, [ahorros]);

  return (
    <div>
      <h2 className="page-title">Ahorro</h2>

      <div className="summary-grid">
        <div className="card summary-card">
          <h3>Total ahorrado</h3>
          <p className="summary-value">₡{totalAhorrado.toLocaleString()}</p>
        </div>

        {ahorrosPorPeriodo.map((item) => (
          <div className="card summary-card" key={item.periodo}>
            <h3>{item.periodo}</h3>
            <p className="summary-value">₡{item.monto.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Movimientos de ahorro</h2>

        {ahorros.length > 0 ? (
          ahorros.map((item) => (
            <div className="table-row" key={item.id}>
              <div>
                <strong>{item.categoria}</strong>
                <p>{item.periodo}</p>
              </div>

              <div>
                <p>{item.fechaPago}</p>
              </div>

              <div className="amount">
                ₡{Number(item.monto || 0).toLocaleString()}
              </div>
            </div>
          ))
        ) : (
          <p>No hay movimientos de ahorro registrados.</p>
        )}
      </div>

      <div className="card">
        <h2>Resumen</h2>
        <p>
          Aquí ya estás viendo el ahorro real traído desde Firebase, calculado a
          partir de las transacciones con categoría "Ahorro".
        </p>
      </div>
    </div>
  );
}

export default Ahorro;