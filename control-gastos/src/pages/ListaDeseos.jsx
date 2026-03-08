import { useEffect, useState } from "react";
import WishlistList from "../components/WishlistList";
import AddWish from "../components/AddWish";
import { getWishlist, deleteWishlistItem } from "../services/wishlist";
import { getTransactions } from "../services/transactions";

function ListaDeseos() {
  const [items, setItems] = useState([]);
  const [ahorroDisponible, setAhorroDisponible] = useState(0);
  const [wishToEdit, setWishToEdit] = useState(null);

  async function loadData() {
    const deseos = await getWishlist();
    const transactions = await getTransactions();

    const ahorroTotal = transactions
      .filter((tx) => tx.categoria === "Ahorro")
      .reduce((acc, tx) => acc + Number(tx.monto || 0), 0);

    setItems(deseos);
    setAhorroDisponible(ahorroTotal);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    const confirmar = window.confirm("¿Eliminar este deseo?");
    if (!confirmar) return;

    try {
      await deleteWishlistItem(id);
      loadData();
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar el deseo.");
    }
  };

  const handleEdit = (item) => {
    setWishToEdit(item);
  };

  const handleCancelEdit = () => {
    setWishToEdit(null);
  };

  const handleSaved = async () => {
    setWishToEdit(null);
    await loadData();
  };

  return (
    <div>
      <h2 className="page-title">Lista de deseos</h2>

      <div className="card">
        <p>
          Aquí podés guardar cosas que querés comprar y ver cuánto te falta para
          llegar a la meta.
        </p>
      </div>

      <AddWish
        reload={handleSaved}
        wishToEdit={wishToEdit}
        onCancelEdit={handleCancelEdit}
      />

      <WishlistList
        items={items}
        ahorroDisponible={ahorroDisponible}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default ListaDeseos;