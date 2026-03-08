import { useEffect, useMemo, useState } from "react";
import SummaryCard from "../components/SummaryCard";
import TransactionList from "../components/TransactionList";
import { getTransactions } from "../services/transactions";


function formatearPeriodoBonito(periodo) {
  if (!periodo) return "";

  const [inicioStr, finStr] = periodo.split("_");

  if (!inicioStr || !finStr) return periodo;

  const inicio = new Date(`${inicioStr}T00:00:00`);
  const fin = new Date(`${finStr}T00:00:00`);

  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  const diaInicio = inicio.getDate();
  const diaFin = fin.getDate();
  const mesInicio = meses[inicio.getMonth()];
  const mesFin = meses[fin.getMonth()];
  const yearInicio = inicio.getFullYear();
  const yearFin = fin.getFullYear();

  if (yearInicio === yearFin) {
    if (mesInicio === mesFin) {
      return `Del ${diaInicio} al ${diaFin} de ${mesInicio} de ${yearInicio}`;
    }

    return `Del ${diaInicio} de ${mesInicio} al ${diaFin} de ${mesFin} de ${yearInicio}`;
  }

  return `Del ${diaInicio} de ${mesInicio} de ${yearInicio} al ${diaFin} de ${mesFin} de ${yearFin}`;
}








function Historial() {
  const [transacciones, setTransacciones] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");

  useEffect(() => {
    async function loadTransactions() {
      const data = await getTransactions();
      setTransacciones(data);
    }

    loadTransactions();
  }, []);

  const categorias = useMemo(() => {
    const listaCategorias = transacciones.map((item) => item.categoria);
    return ["Todas", ...new Set(listaCategorias)];
  }, [transacciones]);

  const periodos = useMemo(() => {
    return [...new Set(transacciones.map((item) => item.periodo))];
  }, [transacciones]);

  const transaccionesFiltradas =
    categoriaSeleccionada === "Todas"
      ? transacciones
      : transacciones.filter(
          (item) => item.categoria === categoriaSeleccionada
        );

  const totalFiltrado = transaccionesFiltradas.reduce(
    (acc, item) => acc + Number(item.monto || 0),
    0
  );

  return (
    <div>
      <h2 className="page-title">Historial</h2>

      <div className="summary-grid">
        {periodos.map((periodo) => {
          const transaccionesDelPeriodo = transacciones.filter(
            (tx) => tx.periodo === periodo
          );

          const totalGastado = transaccionesDelPeriodo.reduce(
            (acc, tx) => acc + Number(tx.monto || 0),
            0
          );

          const totalAhorrado = transaccionesDelPeriodo
            .filter((tx) => tx.categoria === "Ahorro")
            .reduce((acc, tx) => acc + Number(tx.monto || 0), 0);

          const categoriasDelPeriodo = [
            ...new Set(transaccionesDelPeriodo.map((tx) => tx.categoria)),
          ];

          return (
            <div className="card historial-card" key={periodo}>
              <SummaryCard
                title={formatearPeriodoBonito(periodo)}
                value={`Gastado: ₡${totalGastado.toLocaleString()}`}
                subtitle={`Ahorrado: ₡${totalAhorrado.toLocaleString()}`}
              />

              <div className="category-summary">
                <h4>Gasto por categoría</h4>

                {categoriasDelPeriodo.length > 0 ? (
                  categoriasDelPeriodo.map((categoria) => {
                    const totalCategoria = transaccionesDelPeriodo
                      .filter((tx) => tx.categoria === categoria)
                      .reduce((acc, tx) => acc + Number(tx.monto || 0), 0);

                    return (
                      <div className="simple-row" key={categoria}>
                        <span>{categoria}</span>
                        <strong>₡{totalCategoria.toLocaleString()}</strong>
                      </div>
                    );
                  })
                ) : (
                  <p>No hay transacciones en este período.</p>
                )}
              </div>

              <div className="period-total">
                <strong>Total gastado:</strong> ₡{totalGastado.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h2>Filtrar por categoría</h2>

        <select
          className="filter-select"
          value={categoriaSeleccionada}
          onChange={(e) => setCategoriaSeleccionada(e.target.value)}
        >
          {categorias.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
      </div>

      <TransactionList items={transaccionesFiltradas} showActions={false} />

      <div className="card total-card">
        <h2>
          {categoriaSeleccionada === "Todas"
            ? "Total general"
            : `Total de ${categoriaSeleccionada}`}
        </h2>
        <p className="summary-value">₡{totalFiltrado.toLocaleString()}</p>
      </div>
    </div>
  );
}

export default Historial;