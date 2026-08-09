import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getShops, createShop } from "../services/shopService";
import { useShop } from "../context/ShopContext";
import ShopCard from "../components/ShopCard";
import Modal from "../components/Modal";
import FormField from "../components/FormField";

export default function ShopsPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // État du formulaire de création (dans la modal)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", logoUrl: "" });
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();
  const { selectShop } = useShop();

  // Charge la liste des boutiques au montage de la page
  useEffect(() => {
    async function fetchShops() {
      try {
        const data = await getShops();
        setShops(data);
      } catch (err) {
        setError("Impossible de charger vos boutiques. Réessayez plus tard.");
      } finally {
        setLoading(false);
      }
    }
    fetchShops();
  }, []);

  // Redirection automatique supprimée pour permettre d'accéder à la liste
  // et de créer une nouvelle boutique même quand on n'en a qu'une seule.

  // Sélectionne une boutique comme boutique active et va au dashboard
  function handleSelectShop(shop) {
    selectShop(shop.id, shop.name);
    navigate("/dashboard");
  }

  // Placeholder pour l'édition (à brancher plus tard sur une vraie page/modal d'édition)
  function handleEdit(shop) {
    // TODO: ouvrir un formulaire d'édition pré-rempli avec les infos de `shop`
    console.log("Modifier la boutique :", shop.id);
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleCreateSubmit(e) {
    e.preventDefault();
    setCreateError("");
    setCreating(true);

    try {
      const newShop = await createShop(form);
      setShops((prev) => [...prev, newShop]);
      setShowCreateModal(false);
      setForm({ name: "", address: "", logoUrl: "" });
    } catch (err) {
      const backendMessage =
        err.response?.data?.message || err.response?.data?.error;
      setCreateError(
        backendMessage || "Impossible de créer la boutique. Vérifiez les informations."
      );
    } finally {
      setCreating(false);
    }
  }

  function closeCreateModal() {
    setShowCreateModal(false);
    setCreateError("");
    setForm({ name: "", address: "", logoUrl: "" });
  }

  return (
    <div className="min-h-screen bg-section-alt pb-24 text-white">
      {/* En-tête */}
      <header className="px-5 pb-4 pt-8 mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-white">
          Mes boutiques
        </h1>
        <p className="mt-1 text-sm text-gray-300">
          Choisissez une boutique pour continuer
        </p>
      </header>

      <main className="flex flex-col gap-3 px-5 mx-auto max-w-5xl">
        {loading && (
          <p className="mt-10 text-center text-sm text-gray-400 dark:text-gray-500">
            Chargement de vos boutiques...
          </p>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600
                       dark:bg-red-950/50 dark:text-red-400"
          >
            {error}
          </div>
        )}

        {!loading && !error && shops.length === 0 && (
          <div className="mt-16 flex flex-col items-center gap-3 text-center glass p-8 rounded-2xl">
            <span className="text-4xl">🏪</span>
            <p className="font-medium text-white">
              Vous n'avez encore aucune boutique
            </p>
            <p className="text-sm text-gray-300">
              Appuyez sur le bouton "+" pour créer votre première boutique
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          shops.map((shop) => (
            <ShopCard
              key={shop.id}
              shop={shop}
              onSelect={handleSelectShop}
              onEdit={handleEdit}
            />
          ))}
      </main>

      {/* Bouton flottant "+" pour créer une nouvelle boutique */}
      <button
        type="button"
        onClick={() => setShowCreateModal(true)}
        aria-label="Créer une boutique"
        className="fixed bottom-24 right-6 md:right-10 md:bottom-10 flex h-16 w-16 items-center justify-center
                   rounded-full btn-gradient text-3xl font-light text-white shadow-xl
                   transition active:scale-95 glow-purple z-50"
      >
        +
      </button>

      {/* Modal de création de boutique */}
      {showCreateModal && (
        <Modal title="Nouvelle boutique" onClose={closeCreateModal}>
          <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
            <FormField
              id="name"
              label="Nom de la boutique"
              value={form.name}
              onChange={handleFormChange}
              placeholder="Ex: Boutique Centre-ville"
            />
            <FormField
              id="address"
              label="Adresse"
              value={form.address}
              onChange={handleFormChange}
              placeholder="Ex: Rue du Marché, Yaoundé"
            />
            <FormField
              id="logoUrl"
              label="URL du logo (optionnel)"
              value={form.logoUrl}
              onChange={handleFormChange}
              placeholder="https://..."
              required={false}
            />

            {/* Aperçu du logo si une URL a été saisie */}
            {form.logoUrl && (
              <div className="flex items-center gap-3">
                <img
                  src={form.logoUrl}
                  alt="Aperçu du logo"
                  className="h-14 w-14 rounded-xl object-cover ring-1 ring-gray-200
                             dark:ring-gray-700"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Aperçu du logo
                </span>
              </div>
            )}

            {createError && (
              <div
                role="alert"
                className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600
                           dark:bg-red-950/50 dark:text-red-400"
              >
                {createError}
              </div>
            )}

            <button
              type="submit"
              disabled={creating}
              className="mt-2 w-full rounded-xl btn-gradient py-3.5 text-base font-semibold
                         text-white shadow-md transition
                         disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "Création en cours..." : "Créer la boutique"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
