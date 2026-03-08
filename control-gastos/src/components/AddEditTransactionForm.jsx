import { useEffect, useMemo, useState } from "react";
import { addTransaction, updateTransaction } from "../services/transactions";

const CATEGORIAS = [
  "Ahorro",
  "Visita Puriscal",
  "Suscripciones",
  "Deuda Allan",
  "Pedidos Ya/Didi",
  "Uber",
  "Gimnasio",
  "Mami",
  "Supermercado",
  "Salidas",
  "Comedor",
  "Regalos",
  "Alquiler",
  "Plan",
  "Semanas",
];

function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getClosestFriday(year, month, targetDay) {
  let bestDate = null;
  let bestDiff = Infinity;

  for (let offset = -3; offset <= 3; offset++) {
    const candidate = new Date(year, month, targetDay + offset);

    if (candidate.getDay() === 5) {
      const diff = Math.abs(offset);

      if (diff < bestDiff) {
        bestDiff = diff;
        bestDate = candidate;
      }
    }
  }

  return bestDate;
}

function getPayDatesAround(date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const candidates = [
    getClosestFriday(year, month - 1, 15),
    getClosestFriday(year, month - 1, 30),
    getClosestFriday(year, month, 15),
    getClosestFriday(year, month, 30),
    getClosestFriday(year, month + 1, 15),
    getClosestFriday(year, month + 1, 30),
  ];

  return candidates
    .filter(Boolean)
    .sort((a, b) => a - b);
}

function calcularPeriodo(fechaPago) {
  if (!fechaPago) {
    return {
      periodo: "",
      periodoInicio: "",
      periodoFin: "",
    };
  }

  const fecha = new Date(`${fechaPago}T00:00:00`);
  const payDates = getPayDatesAround(fecha);

  let inicio = null;
  let fin = null;

  for (let i = 0; i < payDates.length - 1; i++) {
    const pagoActual = payDates[i];
    const siguientePago = payDates[i + 1];

    if (fecha >= pagoActual && fecha < siguientePago) {
      inicio = pagoActual;
      fin = new Date(siguientePago);
      fin.setDate(fin.getDate() - 1);
      break;
    }
  }

  if (!inicio || !fin) {
    const primerPago = payDates[0];
    const segundoPago = payDates[1];

    inicio = primerPago;
    fin = new Date(segundoPago);
    fin.setDate(fin.getDate() - 1);
  }

  const periodoInicio = formatDateLocal(inicio);
  const periodoFin = formatDateLocal(fin);

  return {
    periodo: `${periodoInicio}_${periodoFin}`,
    periodoInicio,
    periodoFin,
  };
}

function AddEditTransactionForm({
  transactionToEdit,
  onSaved,
  onCancelEdit,
}) {
  const [form, setForm] = useState({
    fechaPago: "",
    categoria: "Walmart",
    monto: "",
  });

  useEffect(() => {
    if (transactionToEdit) {
      setForm({
        fechaPago: transactionToEdit.fechaPago || "",
        categoria: transactionToEdit.categoria || "Walmart",
        monto: transactionToEdit.monto ?? "",
      });
    } else {
      setForm({
        fechaPago: "",
        categoria: "Walmart",
        monto: "",
      });
    }
  }, [transactionToEdit]);

  const periodoData = useMemo(() => {
    return calcularPeriodo(form.fechaPago);
  }, [form.fechaPago]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const limpiarFormulario = () => {
    setForm({
      fechaPago: "",
      categoria: "Walmart",
      monto: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fechaPago || !form.categoria || !form.monto) {
      alert("Completá todos los campos.");
      return;
    }

    const montoNumero = Number(form.monto);

    if (Number.isNaN(montoNumero) || montoNumero < 0) {
      alert("El monto debe ser válido.");
      return;
    }

    const payload = {
      fechaPago: form.fechaPago,
      categoria: form.categoria,
      monto: montoNumero,
      periodo: periodoData.periodo,
      periodoInicio: periodoData.periodoInicio,
      periodoFin: periodoData.periodoFin,
    };

    try {
      if (transactionToEdit) {
        await updateTransaction(transactionToEdit.id, payload);
      } else {
        await addTransaction(payload);
      }

      limpiarFormulario();
      onSaved();
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar la transacción.");
    }
  };

  return (
    <div className="card">
      <h2>
        {transactionToEdit ? "Editar transacción" : "Agregar transacción"}
      </h2>

      <form className="transaction-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div>
            <label>Fecha</label>
            <input
              type="date"
              name="fechaPago"
              value={form.fechaPago}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Categoría</label>
            <select
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
            >
              {CATEGORIAS.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Monto</label>
            <input
              type="number"
              name="monto"
              value={form.monto}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>

        <div className="form-extra">
          <p>
            <strong>Período calculado:</strong>{" "}
            {periodoData.periodoInicio && periodoData.periodoFin
              ? `${periodoData.periodoInicio} al ${periodoData.periodoFin}`
              : "-"}
          </p>
        </div>

        <div className="form-actions">
          <button type="submit" className="primary-button">
            {transactionToEdit ? "Guardar cambios" : "Agregar"}
          </button>

          {transactionToEdit && (
            <button
              type="button"
              className="secondary-button"
              onClick={onCancelEdit}
            >
              Cancelar edición
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default AddEditTransactionForm;