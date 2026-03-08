function WishlistList({
  items,
  ahorroDisponible = 0,
  onEdit,
  onDelete,
}) {
  return (
    <div className="summary-grid">
      {items.length > 0 ? (
        items.map((item) => {
          const nombre = item.nombre || item.Nombre || "Sin nombre";
          const precioMeta = Number(
            item.precioMeta ??
              item.precio ??
              item.Precio ??
              item["Precio "] ??
              0
          );

          const imagenSrc =
            item.imagenBase64 ||
            item.imagenUrl ||
            "";

          const ahorroTotal = Number(ahorroDisponible || 0);
          const faltante = Math.max(precioMeta - ahorroTotal, 0);
          const progreso =
            precioMeta > 0
              ? Math.min((ahorroTotal / precioMeta) * 100, 100)
              : 0;

          return (
            <div className="card" key={item.id}>
              {imagenSrc ? (
                <img
                  src={imagenSrc}
                  alt={nombre}
                  className="wishlist-image"
                />
              ) : null}

              <h3>{nombre}</h3>
              <p>Meta: ₡{precioMeta.toLocaleString()}</p>
              <p>Ahorrado: ₡{ahorroTotal.toLocaleString()}</p>
              <p>Faltan: ₡{faltante.toLocaleString()}</p>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progreso}%` }}
                />
              </div>

              <div className="transaction-actions">
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
                  onClick={() => onDelete(item.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <p>No hay deseos guardados.</p>
      )}
    </div>
  );
}

export default WishlistList;