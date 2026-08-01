import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, TrendingUp, AlertTriangle, Plus } from "lucide-react";
import { getProducts } from "../services/productService";
import { getTodaySales, getSalesByPeriod } from "../services/saleService";
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
  const [periodSales, setPeriodSales] = useState([]);
  const [period, setPeriod] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [loadingPeriod, setLoadingPeriod] = useState(false);
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
        const [productsData, salesData, periodSalesData] = await Promise.all([
          getProducts(shopId),
          getTodaySales(shopId),
          getSalesByPeriod(shopId, period),
        ]);
        setProducts(productsData);
        setSales(salesData);
        setPeriodSales(periodSalesData);
      } catch (err) {
        setError("Impossible de charger les données du tableau de bord.");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [shopId, navigate]); // Initial load

  useEffect(() => {
    if (!shopId) return;
    async function fetchPeriodSales() {
      setLoadingPeriod(true);
      try {
        const data = await getSalesByPeriod(shopId, period);
        setPeriodSales(data);
      } catch (err) {
        console.error("Failed to load period sales", err);
      } finally {
        setLoadingPeriod(false);
      }
    }
    // Only fetch if it's not the initial load where loading is true
    if (!loading) fetchPeriodSales();
  }, [shopId, period]);

  // Calculs dérivés des données brutes — recalculés uniquement quand la source change
  const totalSalesToday = sales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
  const totalMarginToday = sales.reduce((sum, sale) => sum + (sale.margin || 0), 0);
  const lowStockCount = products.filter(
    (p) => p.stockQuantity <= p.alertThreshold
  ).length;

  return (
    <div className="min-h-screen bg-section-dark pb-24 text-white">
      <OfflineBanner />

      <DashboardHeader
        shopName={selectedShopName || "Ma Boutique"} // TODO: le nom provient maintenant de ShopContext
        userName={name}
        avatarUrl={null} // TODO: brancher la vraie photo de profil quand l'API l'exposera
        hasNotifications={false}
      />

      <main className="px-5 mx-auto max-w-5xl">
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

            {/* Liste des ventes par période */}
            <section className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-300">
                  Dernières ventes
                </h2>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="rounded-lg border border-white/10 glass px-3 py-1.5 text-sm
                             text-white outline-none transition focus:border-brand-500
                             appearance-none"
                >
                  <option value="recent">Les 5 dernières</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="this_week">Cette semaine</option>
                  <option value="this_month">Ce mois</option>
                </select>
              </div>

              {loadingPeriod ? (
                <p className="text-center text-sm text-gray-400">Chargement...</p>
              ) : periodSales.length === 0 ? (
                <p className="text-center text-sm text-gray-500">
                  Aucune vente sur cette période.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {periodSales.map((sale) => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between rounded-xl glass p-3 shadow-sm"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">
                          {sale.productName}
                        </p>
                        <p className="text-xs text-gray-400">
                          Qté : {sale.quantity} •{" "}
                          {new Date(sale.soldAt).toLocaleString("fr-FR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">
                          {currencyFormatter.format(sale.totalPrice)}
                        </p>
                        <p className="text-xs font-medium text-emerald-400">
                          +{currencyFormatter.format(sale.margin)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Liste des produits */}
            <section className="mt-8">
              <h2 className="mb-3 text-sm font-semibold text-gray-300">
                Produits
              </h2>

              {products.length === 0 ? (
                <p className="mt-6 text-center text-sm text-gray-500">
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
        className="fixed bottom-20 right-6 md:right-10 md:bottom-10 flex h-16 w-16 items-center justify-center
                   rounded-full btn-gradient text-white shadow-xl transition
                   active:scale-95 z-50 glow-purple"
      >
        <Plus size={28} />
      </button>

      <BottomNav />
    </div>
  );
}
