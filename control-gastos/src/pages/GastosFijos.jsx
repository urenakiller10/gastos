function GastosFijos() {
  const gastosFijos = [
    { id: 1, nombre: "Alquiler", monto: 50000, quincena: 1, frecuencia: "Quincenal" },
    { id: 2, nombre: "Mami", monto: 30000, quincena: 1, frecuencia: "Quincenal" },
    { id: 3, nombre: "Gym", monto: 24000, quincena: 1, frecuencia: "Quincenal" },
    { id: 4, nombre: "Plan", monto: 12000, quincena: 1, frecuencia: "Quincenal" },
    { id: 5, nombre: "Ahorro", monto: 50000, quincena: 1, frecuencia: "Quincenal" },
    { id: 6, nombre: "Semanas", monto: 60000, quincena: 1, frecuencia: "Quincenal" },

    { id: 7, nombre: "Alquiler", monto: 50000, quincena: 2, frecuencia: "Quincenal" },
    { id: 8, nombre: "Ahorro", monto: 150000, quincena: 2, frecuencia: "Quincenal" },
    { id: 9, nombre: "Semanas", monto: 60000, quincena: 2, frecuencia: "Quincenal" },
  ];

  const quincena1 = gastosFijos.filter((item) => item.quincena === 1);
  const quincena2 = gastosFijos.filter((item) => item.quincena === 2);

  const totalQ1 = quincena1.reduce((acc, item) => acc + item.monto, 0);
  const totalQ2 = quincena2.reduce((acc, item) => acc + item.monto, 0);

  return (
    <div>
      <h2 className="page-title">Gastos fijos</h2>

      <div className="card">
        <h2>Primera quincena</h2>

        {quincena1.map((item) => (
          <div className="table-row" key={item.id}>
            <div>
              <strong>{item.nombre}</strong>
              <p>{item.frecuencia}</p>
            </div>

            <div className="amount">₡{item.monto.toLocaleString()}</div>
          </div>
        ))}

        <div className="period-total">
          <strong>Total primera quincena:</strong> ₡{totalQ1.toLocaleString()}
        </div>
      </div>

      <div className="card">
        <h2>Segunda quincena</h2>

        {quincena2.map((item) => (
          <div className="table-row" key={item.id}>
            <div>
              <strong>{item.nombre}</strong>
              <p>{item.frecuencia}</p>
            </div>

            <div className="amount">₡{item.monto.toLocaleString()}</div>
          </div>
        ))}

        <div className="period-total">
          <strong>Total segunda quincena:</strong> ₡{totalQ2.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export default GastosFijos;