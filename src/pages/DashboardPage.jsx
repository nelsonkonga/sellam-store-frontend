import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, TrendingUp, AlertTriangle, Plus } from "lucide-react";
import { getProducts } from "../services/productService";
import { getTodaySales } from "../services/saleService";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";
import DashboardHeader from "../components/DashboardHeader";
import SummaryCard from "../components/SummaryCard";
import ProductRow from "../components/ProductRow";
import BottomNav from "../components/BottomNav";
import OfflineBanner from "../components/OfflineBanner";

// Formatteur de montant en Francs CFA (adapte facilement à une autre devise si besoin)
const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "XAF",
  maximumFractionDigits: 0,
});

export default function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { name } = useAuth();
  const { selectedShopId: shopId, selectedShopName } = useShop();

  // Charge produits + ventes du jour dès qu'on connaît la boutique active
  useEffect(() => {
    // Sans boutique sélectionnée, on ne peut rien afficher : retour à la sélection
    if (!shopId) {
      navigate("/shops");
      return;
    }

    async function fetchDashboardData() {
      try {
        const [productsData, salesData] = await Promise.all([
          getProducts(shopId),
          getTodaySales(shopId),
        ]);
        setProducts(productsData);
        setSales(salesData);
      } catch (err) {
        setError("Impossible de charger les données du tableau de bord.");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [shopId, navigate]);

  // Calculs dérivés des données brutes — recalculés uniquement quand la source change
  const totalSalesToday = sales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
  const totalMarginToday = sales.reduce((sum, sale) => sum + (sale.margin || 0), 0);
  const lowStockCount = products.filter(
    (p) => p.stockQuantity <= p.alertThreshold
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-gray-950">
      <OfflineBanner />

      <DashboardHeader
        shopName={selectedShopName || "Ma Boutique"} // TODO: le nom provient maintenant de ShopContext
        userName={name}
        avatarUrl={null} // TODO: brancher la vraie photo de profil quand l'API l'exposera
        hasNotifications={false}
      />

      <main className="px-5">
        {loading && (
          <p className="mt-10 text-center text-sm text-gray-400 dark:text-gray-500">
            Chargement du tableau de bord...
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

        {!loading && !error && (
          <>
            {/* Résumé du jour en 3 cartes */}
            <div className="flex gap-3">
              <SummaryCard
                icon={Wallet}
                label="Ventes du jour"
                value={currencyFormatter.format(totalSalesToday)}
              />
              <SummaryCard
                icon={TrendingUp}
                label="Marge du jour"
                value={currencyFormatter.format(totalMarginToday)}
              />
              <SummaryCard
                icon={AlertTriangle}
                label="Alertes stock"
                value={lowStockCount}
                accentClassName={
                  lowStockCount > 0
                    ? "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400"
                    : undefined
                }
              />
            </div>

            {/* Liste des produits */}
            <section className="mt-6">
              <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Produits
              </h2>

              {products.length === 0 ? (
                <p className="mt-6 text-center text-sm text-gray-400 dark:text-gray-500">
                  Aucun produit pour cette boutique.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {products.map((product) => (
                    <ProductRow key={product.id} product={product} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Bouton flottant pour enregistrer une vente rapide */}
      <button
        type="button"
        onClick={() => navigate("/sales/new")}
        aria-label="Nouvelle vente"
        className="fixed bottom-20 right-6 flex h-14 w-14 items-center justify-center
                   rounded-full bg-emerald-500 text-white shadow-lg transition
                   hover:bg-emerald-600 active:scale-95
                   dark:bg-emerald-600 dark:hover:bg-emerald-500"
      >
        <Plus size={28} />
      </button>

      <BottomNav />
    </div>
  );
}
