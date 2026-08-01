import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, X } from "lucide-react";
import { getProducts } from "../services/productService";
import { createSale } from "../services/saleService";
import { useShop } from "../context/ShopContext";
import SearchBar from "../components/SearchBar";
import ProductTile from "../components/ProductTile";
import QuantityKeypad from "../components/QuantityKeypad";
import Toast from "../components/Toast";

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "XAF",
  maximumFractionDigits: 0,
});

export default function NewSalePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Produit actuellement sélectionné pour saisir sa quantité (null = grille visible)
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  // Toast de succès après une vente enregistrée
  const [toast, setToast] = useState(null);

  // Placeholder pour le scan de code-barres, pas encore implémenté
  const [showScannerPlaceholder, setShowScannerPlaceholder] = useState(false);

  const navigate = useNavigate();
  const { selectedShopId: shopId } = useShop();

  useEffect(() => {
    if (!shopId) {
      navigate("/shops");
      return;
    }

    async function fetchProducts() {
      try {
        const data = await getProducts(shopId);
        setProducts(data);
      } catch (err) {
        setError("Impossible de charger les produits.");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [shopId, navigate]);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  function openKeypad(product) {
    setSelectedProduct(product);
    setQuantity("");
    setConfirmError("");
  }

  function closeKeypad() {
    setSelectedProduct(null);
    setQuantity("");
    setConfirmError("");
  }

  async function handleConfirmSale() {
    const numericQuantity = parseFloat(quantity);

    if (!numericQuantity || numericQuantity <= 0) {
      setConfirmError("Entrez une quantité valide.");
      return;
    }

    setConfirming(true);
    setConfirmError("");

    try {
      await createSale(shopId, {
        productId: selectedProduct.id,
        quantity: numericQuantity,
      });

      const total = numericQuantity * (selectedProduct.sellingPrice || 0);

      // Vente réussie : on referme le clavier, on affiche le toast,
      // et on revient directement à la grille pour enchaîner une nouvelle vente.
      closeKeypad();
      setToast({
        message: "Vente enregistrée",
        subMessage: `${selectedProduct.name} × ${numericQuantity} — ${currencyFormatter.format(total)}`,
      });

      // Met à jour le stock affiché localement, sans refetch complet
      setProducts((prev) =>
        prev.map((p) =>
          p.id === selectedProduct.id
            ? { ...p, stockQuantity: p.stockQuantity - numericQuantity }
            : p
        )
      );
    } catch (err) {
      // Erreur 400 = souvent stock insuffisant côté backend
      const backendMessage =
        err.response?.data?.message || err.response?.data?.error;
      setConfirmError(
        backendMessage ||
          (err.response?.status === 400
            ? "Stock insuffisant pour cette quantité."
            : "Impossible d'enregistrer la vente. Réessayez.")
      );
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="min-h-screen bg-section-dark text-white">
      {/* En-tête */}
      <header className="flex items-center gap-3 px-5 pb-4 pt-6 mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          aria-label="Retour"
          className="flex h-9 w-9 items-center justify-center rounded-full
                     text-gray-500 transition hover:bg-gray-100
                     dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-white">
          Nouvelle vente
        </h1>
      </header>

      <main className="px-5 pb-10 mx-auto max-w-5xl">
        {/* Recherche + scanner code-barres côte à côte */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Rechercher un produit..."
            />
          </div>
          <button
            type="button"
            onClick={() => setShowScannerPlaceholder(true)}
            aria-label="Scanner un code-barres"
            className="flex h-[50px] w-[50px] flex-shrink-0 items-center justify-center
                       rounded-xl glass text-gray-400 shadow-sm transition
                       hover:bg-white/10"
          >
            <Camera size={20} />
          </button>
        </div>

        {loading && (
          <p className="mt-10 text-center text-sm text-gray-400 dark:text-gray-500">
            Chargement des produits...
          </p>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600
                       dark:bg-red-950/50 dark:text-red-400"
          >
            {error}
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <p className="mt-10 text-center text-sm text-gray-400 dark:text-gray-500">
            Aucun produit ne correspond à votre recherche.
          </p>
        )}

        {/* Grille de gros boutons produit, 2 colonnes pour rester facile à toucher */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <ProductTile
                key={product.id}
                product={product}
                onClick={() => openKeypad(product)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Panneau clavier numérique, ouvert quand un produit est sélectionné */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
          onClick={closeKeypad}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-t-2xl glass-strong p-5 shadow-xl
                       sm:rounded-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                Quantité
              </h2>
              <button
                type="button"
                onClick={closeKeypad}
                aria-label="Fermer"
                className="flex h-8 w-8 items-center justify-center rounded-full
                           text-gray-400 hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <QuantityKeypad
              product={selectedProduct}
              quantity={quantity}
              onQuantityChange={setQuantity}
            />

            {confirmError && (
              <div
                role="alert"
                className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600
                           dark:bg-red-950/50 dark:text-red-400"
              >
                {confirmError}
              </div>
            )}

            <button
              type="button"
              onClick={handleConfirmSale}
              disabled={confirming}
              className="mt-4 w-full rounded-xl btn-gradient py-4 text-base font-bold
                         text-white shadow-md transition
                         disabled:cursor-not-allowed disabled:opacity-60"
            >
              {confirming ? "Enregistrement..." : "Confirmer la vente"}
            </button>
          </div>
        </div>
      )}

      {/* Placeholder scanner code-barres */}
      {showScannerPlaceholder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowScannerPlaceholder(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl glass-strong p-6 text-center shadow-xl"
          >
            <Camera className="mx-auto mb-3 text-gray-400" size={40} />
            <p className="font-semibold text-white">
              Scanner un code-barres
            </p>
            <p className="mt-1 text-sm text-gray-300">
              Fonctionnalité à venir
            </p>
            <button
              type="button"
              onClick={() => setShowScannerPlaceholder(false)}
              className="mt-4 w-full rounded-xl bg-white/10 py-3 text-sm font-medium
                         text-white transition hover:bg-white/20"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Toast de confirmation après une vente réussie */}
      {toast && (
        <Toast
          message={toast.message}
          subMessage={toast.subMessage}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
