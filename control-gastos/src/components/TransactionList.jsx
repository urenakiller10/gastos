import { deleteTransaction } from "../services/transactions";

function formatearPeriodoBonito(periodo) {
  if (!periodo) return "";

  const [inicioStr, finStr] = periodo.split("_");
  if (!inicioStr || !finStr) return periodo;

  const inicio = new Date(`${inicioStr}T00:00:00`);
  const fin = new Date(`${finStr}T00:00:00`);

  const meses = [
    "enero","febrero","marzo","abril","mayo","junio",
    "julio","agosto","septiembre","octubre","noviembre","diciembre"
  ];

  const diaInicio = inicio.getDate();
  const diaFin = fin.getDate();
  const mesInicio = meses[inicio.getMonth()];
  const mesFin = meses[fin.getMonth()];
  const year = inicio.getFullYear();

  if (mesInicio === mesFin) {
    return `Del ${diaInicio} al ${diaFin} de ${mesInicio}`;
  }

  return `Del ${diaInicio} de ${mesInicio} al ${diaFin} de ${mesFin}`;
}





function TransactionList({ items, onEdit, reload }) {
  const handleDelete = async (id) => {
    const confirmar = window.confirm("¿Eliminar esta transacción?");
    if (!confirmar) return;

    try {
      await deleteTransaction(id);
      reload();
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar.");
    }
  };

  return (
    <div className="card">
      <h2>Transacciones</h2>

      <div className="table-list">
        {items.map((item) => (
          <div className="table-row" key={item.id}>
            <div>
              <strong>{item.categoria}</strong>
              <p>{formatearPeriodoBonito(item.periodo)}</p>
            </div>

            <div>
              <p>{item.fechaPago}</p>
            </div>

            <div className="transaction-actions">
              <div className="amount">
                ₡{Number(item.monto || 0).toLocaleString()}
              </div>

              <button
                type="button"
                className="secondary-button small-button"
                onClick={() => onEdit(item)}
              >
                Editar
              </button>

              <button
                type="button"
                className="danger-button small-button"
                onClick={() => handleDelete(item.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TransactionList;