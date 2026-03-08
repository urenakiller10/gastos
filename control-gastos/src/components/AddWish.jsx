import { useEffect, useState } from "react";
import {
  addWishlistItem,
  updateWishlistItem,
} from "../services/wishlist";

function AddWish({ reload, wishToEdit, onCancelEdit }) {
  const [nombre, setNombre] = useState("");
  const [precioMeta, setPrecioMeta] = useState("");
  const [imagenBase64, setImagenBase64] = useState("");
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (wishToEdit) {
      setNombre(wishToEdit.nombre || wishToEdit.Nombre || "");
      setPrecioMeta(
        wishToEdit.precioMeta ??
          wishToEdit.precio ??
          wishToEdit.Precio ??
          wishToEdit["Precio "] ??
          ""
      );
      setImagenBase64(
        wishToEdit.imagenBase64 || wishToEdit.imagenUrl || ""
      );
      setPreview(wishToEdit.imagenBase64 || wishToEdit.imagenUrl || "");
    } else {
      setNombre("");
      setPrecioMeta("");
      setImagenBase64("");
      setPreview("");
    }
  }, [wishToEdit]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result;
      setImagenBase64(result);
      setPreview(result);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      nombre,
      precioMeta: Number(precioMeta),
      imagenBase64,
    };

    try {
      if (wishToEdit) {
        await updateWishlistItem(wishToEdit.id, payload);
      } else {
        await addWishlistItem(payload);
      }

      setNombre("");
      setPrecioMeta("");
      setImagenBase64("");
      setPreview("");

      reload();
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el deseo.");
    }
  };

  return (
    <div className="card">
      <h2>{wishToEdit ? "Editar deseo" : "Agregar deseo"}</h2>

      <form onSubmit={handleSubmit} className="form-grid">
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Precio meta"
          value={precioMeta}
          onChange={(e) => setPrecioMeta(e.target.value)}
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />

        {preview ? (
          <img src={preview} alt="Vista previa" className="wishlist-image" />
        ) : null}

        <div className="form-actions">
          <button type="submit" className="primary-button">
            {wishToEdit ? "Guardar cambios" : "Guardar deseo"}
          </button>

          {wishToEdit ? (
            <button
              type="button"
              className="secondary-button"
              onClick={onCancelEdit}
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}

export default AddWish;