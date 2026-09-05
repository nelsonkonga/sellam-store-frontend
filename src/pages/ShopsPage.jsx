import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getShops, createShop, uploadShopLogo } from "../services/shopService";
import { getTodaySales } from "../services/saleService";
import { listEmployees } from "../services/employeeService";
import { useShop } from "../context/ShopContext";
import ShopCard from "../components/ShopCard";
import Modal from "../components/Modal";
import FormField from "../components/FormField";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

export default function ShopsPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // État du formulaire de création (dans la modal)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ name: "", address: "" });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();
  const { selectShop, selectedShopId } = useShop();

  // Charge la liste des boutiques au montage de la page
  useEffect(() => {
    async function fetchShops() {
      setError("");
      setLoading(true);
      try {
        const data = await getShops();
        const enrichedShops = await Promise.all(data.map(async (shop) => {
          const [salesResult, employeesResult] = await Promise.allSettled([
            getTodaySales(shop.id),
            listEmployees(shop.id),
          ]);
          const sales = salesResult.status === "fulfilled" && Array.isArray(salesResult.value)
            ? salesResult.value
            : [];
          const employees = employeesResult.status === "fulfilled" && Array.isArray(employeesResult.value)
            ? employeesResult.value
            : [];
          const totalSales = sales.reduce((sum, sale) => sum + Number(sale.totalPrice || 0), 0);
          const totalMargin = sales.reduce((sum, sale) => sum + Number(sale.margin || 0), 0);

          return {
            ...shop,
            salesToday: totalSales,
            margin: totalSales > 0 ? `${Math.round((totalMargin / totalSales) * 100)} %` : "—",
            teamCount: employees.length,
          };
        }));
        setShops(enrichedShops);
      } catch (err) {
        setError("Impossible de charger vos boutiques. Réessayez plus tard.");
      } finally {
        setLoading(false);
      }
    }
    fetchShops();
  }, []);

  function retryFetchShops() {
    setLoading(true);
    getShops()
      .then(async (data) => {
        const enrichedShops = await Promise.all(data.map(async (shop) => {
          const [salesResult, employeesResult] = await Promise.allSettled([
            getTodaySales(shop.id),
            listEmployees(shop.id),
          ]);
          const sales = salesResult.status === "fulfilled" && Array.isArray(salesResult.value) ? salesResult.value : [];
          const employees = employeesResult.status === "fulfilled" && Array.isArray(employeesResult.value) ? employeesResult.value : [];
          const totalSales = sales.reduce((sum, sale) => sum + Number(sale.totalPrice || 0), 0);
          const totalMargin = sales.reduce((sum, sale) => sum + Number(sale.margin || 0), 0);
          return { ...shop, salesToday: totalSales, margin: totalSales > 0 ? `${Math.round((totalMargin / totalSales) * 100)} %` : "—", teamCount: employees.length };
        }));
        setShops(enrichedShops);
      })
      .catch(() => setError("Impossible de charger vos boutiques. Réessayez."))
      .finally(() => setLoading(false));
  }

  // Redirection automatique supprimée pour permettre d'accéder à la liste
  // et de créer une nouvelle boutique même quand on n'en a qu'une seule.

  // Sélectionne une boutique comme boutique active et va au dashboard
  function handleSelectShop(shop) {
    selectShop(shop.id, shop.name);
    navigate("/dashboard");
  }

  // Ouvre la page de paramètres de la boutique sélectionnée
  function handleEdit(shop) {
    selectShop(shop.id, shop.name);
    navigate("/settings/shop");
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleLogoFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) {
      setLogoFile(null);
      setLogoPreviewUrl("");
      return;
    }
    setLogoFile(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
  }

  async function handleCreateSubmit(e) {
    e.preventDefault();
    setCreateError("");
    setCreating(true);

    try {
      let newShop = await createShop(form);

      if (logoFile) {
        try {
          const logoUrl = await uploadShopLogo(newShop.id, logoFile);
          newShop = { ...newShop, logoUrl };
        } catch (logoErr) {
          // La boutique est créée mais le logo a échoué : on n'annule pas
          // la création, on informe juste l'utilisateur.
          setCreateError(
            "Boutique créée, mais l'upload du logo a échoué. Vous pourrez réessayer depuis les paramètres de la boutique."
          );
        }
      }

      setShops((prev) => [...prev, newShop]);
      setShowCreateModal(false);
      setForm({ name: "", address: "" });
      setLogoFile(null);
      setLogoPreviewUrl("");
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
    setForm({ name: "", address: "" });
    setLogoFile(null);
    setLogoPreviewUrl("");
  }

  return (
    <div className="min-h-screen bg-[#f7f8f5] px-4 py-6 text-[#141e1a] md:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl rounded-2xl border border-[#dce4de] bg-white/95 p-4 shadow-[0_4px_24px_rgba(0,0,0,0.05)] md:p-6 lg:p-8">
        <header className="flex flex-col gap-4 border-b border-[#dce4de] pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#006547]">Votre réseau</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#141e1a]">Vos boutiques</h1>
            <p className="mt-1 text-sm text-[#3e4943]">Sélectionnez un espace de travail pour continuer.</p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            aria-label="Nouvelle Boutique"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#bdc9c1] bg-[#eef6f1] px-4 py-2.5 text-sm font-semibold text-[#006547] transition hover:border-[#12805c] hover:bg-[#e7f7ef]"
          >
            <span className="text-xl leading-none">+</span>
            Nouvelle Boutique
          </button>
        </header>

        <main className="pt-6">
          {loading && (
            <p className="mt-10 text-center text-sm text-[#6e7a72]">Chargement de vos boutiques...</p>
          )}

          {!loading && error && (
            <ErrorState title="Vos boutiques sont indisponibles" message={error} onRetry={retryFetchShops} />
          )}

          {!loading && !error && shops.length === 0 && (
            <EmptyState
              title="Votre espace est prêt pour sa première boutique"
              message="Créez votre boutique pour commencer à vendre, suivre le stock et inviter votre équipe."
              actionLabel="Créer une boutique"
              onAction={() => setShowCreateModal(true)}
            />
          )}

          {!loading && !error && shops.length > 0 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {shops.map((shop) => (
                <ShopCard
                  key={shop.id}
                  shop={{ ...shop, isActive: shop.id === selectedShopId }}
                  onSelect={handleSelectShop}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </main>
      </div>

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
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">
                Logo de la boutique (optionnel)
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleLogoFileChange}
                className="block w-full text-sm text-gray-300
                           file:mr-4 file:rounded-lg file:border-0
                           file:bg-white/10 file:px-4 file:py-2
                           file:text-sm file:font-medium file:text-white
                           hover:file:bg-white/20"
              />
              {logoPreviewUrl && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={logoPreviewUrl}
                    alt="Aperçu du logo"
                    className="h-14 w-14 rounded-xl object-cover ring-1 ring-gray-200
                               dark:ring-gray-700"
                  />
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    Aperçu du logo sélectionné
                  </span>
                </div>
              )}
            </div>

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
