import { useMemo, useState } from "react";
import { addTransaction } from "../services/transactions";

const CATEGORIAS_FIJAS = [
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

function calcularPeriodo(fecha) {
  if (!fecha) return "";

  const date = new Date(fecha);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const quincena = day <= 15 ? "Q1" : "Q2";
  const mes = String(month).padStart(2, "0");

  return `${year}-${mes}-${quincena}`;
}

function AddTransactionForm() {
  const [form, setForm] = useState({
    fechaPago: "",
    categoria: "Walmart",
    monto: "",
    tipoMovimiento: "gasto",
    desdeAhorro: false,
  });

  const periodoCalculado = useMemo(() => {
    return calcularPeriodo(form.fechaPago);
  }, [form.fechaPago]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fechaPago || !form.categoria || !form.monto) {
      alert("Completá fecha, categoría y monto.");
      return;
    }

    const montoNumero = Number(form.monto);

    if (Number.isNaN(montoNumero) || montoNumero <= 0) {
      alert("El monto debe ser mayor que 0.");
      return;
    }

    const payload = {
      fechaPago: form.fechaPago,
      periodo: periodoCalculado,
      categoria: form.categoria,
      monto: montoNumero,
      tipoMovimiento: form.tipoMovimiento,
      desdeAhorro: form.tipoMovimiento === "gasto" ? form.desdeAhorro : false,
    };

    try {
      await addTransaction(payload);

      setForm({
        fechaPago: "",
        categoria: "Walmart",
        monto: "",
        tipoMovimiento: "gasto",
        desdeAhorro: false,
      });
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar la transacción.");
    }
  };

  return (
    <div className="card">
      <h2>Agregar transacción manual</h2>

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
              {CATEGORIAS_FIJAS.map((categoria) => (
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
              placeholder="0"
              min="1"
            />
          </div>

          <div>
            <label>Tipo</label>
            <select
              name="tipoMovimiento"
              value={form.tipoMovimiento}
              onChange={handleChange}
            >
              <option value="gasto">Gasto</option>
              <option value="ahorro">Ahorro</option>
            </select>
          </div>
        </div>

        <div className="form-extra">
          <p><strong>Período:</strong> {periodoCalculado || "-"}</p>

          {form.tipoMovimiento === "gasto" && (
            <label className="checkbox-row">
              <input
                type="checkbox"
                name="desdeAhorro"
                checked={form.desdeAhorro}
                onChange={handleChange}
              />
              Este gasto salió del ahorro
            </label>
          )}
        </div>

        <button type="submit" className="primary-button">
          Guardar transacción
        </button>
      </form>
    </div>
  );
}

export default AddTransactionForm;