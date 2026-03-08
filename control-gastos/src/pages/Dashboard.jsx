import { useEffect, useMemo, useState } from "react";
import SummaryCard from "../components/SummaryCard";
import TransactionList from "../components/TransactionList";
import AddEditTransactionForm from "../components/AddEditTransactionForm";
import { getTransactions } from "../services/transactions";

function getClosestFridayToDate(year, month, day) {
  const targetDate = new Date(year, month, day);

  let closestFriday = new Date(targetDate);
  let minDifference = Infinity;

  for (let offset = -3; offset <= 3; offset++) {
    const testDate = new Date(year, month, day + offset);

    if (testDate.getDay() === 5) {
      const diff = Math.abs(testDate - targetDate);

      if (diff < minDifference) {
        minDifference = diff;
        closestFriday = testDate;
      }
    }
  }

  return closestFriday;
}

function getNextPayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const pay15 = getClosestFridayToDate(year, month, 15);
  const pay30 = getClosestFridayToDate(year, month, 30);

  if (today <= pay15) return pay15;
  if (today <= pay30) return pay30;

  const nextMonthYear = month === 11 ? year + 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;

  return getClosestFridayToDate(nextMonthYear, nextMonth, 15);
}

function formatDate(date) {
  return date.toLocaleDateString("es-CR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Dashboard() {
  const [transacciones, setTransacciones] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
  const [transactionToEdit, setTransactionToEdit] = useState(null);

  const loadTransactions = async () => {
    const data = await getTransactions();
    setTransacciones(data);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const categorias = useMemo(() => {
    return ["Todas", ...new Set(transacciones.map((t) => t.categoria))];
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

  const proximoPago = getNextPayDate();

  return (
    <div>
      <h2 className="page-title">Dashboard</h2>

      <div className="summary-grid">
        <SummaryCard
          title="Próximo pago"
          value={formatDate(proximoPago)}
          subtitle="Viernes más cercano al 15 o al 30"
        />
      </div>

      <AddEditTransactionForm
        transactionToEdit={transactionToEdit}
        onSaved={() => {
          setTransactionToEdit(null);
          loadTransactions();
        }}
        onCancelEdit={() => setTransactionToEdit(null)}
      />

      <div className="card">
        <h2>Filtrar transacciones</h2>

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

      <TransactionList
        items={transaccionesFiltradas}
        onEdit={setTransactionToEdit}
        reload={loadTransactions}
      />

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

export default Dashboard;