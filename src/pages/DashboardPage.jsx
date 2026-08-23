import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, TrendingUp, AlertTriangle, Plus } from "lucide-react";
import { getProducts } from "../services/productService";
import { getTodaySales } from "../services/saleService";
import { listInvoices } from "../services/invoiceService";
import { getNotifications } from "../services/notificationService";
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
  const [invoices, setInvoices] = useState([]);
  const [hasNotifications, setHasNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingPeriod, setLoadingPeriod] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { name } = useAuth();
  const { selectedShopId: shopId, selectedShopName, selectedShop } = useShop();

  // Charge produits + ventes du jour dès qu'on connaît la boutique active
  useEffect(() => {
    // Sans boutique sélectionnée, on ne peut rien afficher : retour à la sélection
    if (!shopId) {
      navigate("/shops");
      return;
    }

    async function fetchDashboardData() {
      try {
        const [productsData, salesData, invoicesData, notificationsData] = await Promise.all([
          getProducts(shopId),
          getTodaySales(shopId),
          listInvoices(shopId),
          getNotifications(shopId),
        ]);
        setProducts(productsData);
        setSales(salesData);
        setInvoices(invoicesData);

        if (Array.isArray(notificationsData) && notificationsData.length > 0) {
          const lastReadIso = localStorage.getItem(`sellam_read_notifications_${shopId}`);
          if (!lastReadIso) {
            setHasNotifications(true);
          } else {
            const lastReadTime = new Date(lastReadIso).getTime();
            const hasNew = notificationsData.some(n => new Date(n.createdAt).getTime() > lastReadTime);
            setHasNotifications(hasNew);
          }
        } else {
          setHasNotifications(false);
        }
      } catch (err) {
        setError("Impossible de charger les données du tableau de bord.");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [shopId, navigate]); // Initial load

  const handleMarkAsRead = () => {
    setHasNotifications(false);
  };

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
        shopName={selectedShopName || "Ma Boutique"}
        userName={name}
        shopLogoUrl={selectedShop?.logoUrl || null}
        hasNotifications={hasNotifications}
        onMarkAsRead={handleMarkAsRead}
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

            {/* Centre de Rapports */}
            <div className="mt-8 mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-300">
                Centre de Pilotage
              </h2>
            </div>
            <button
                type="button"
                onClick={() => navigate("/reports")}
                className="w-full flex items-center justify-between rounded-xl btn-gradient p-4 text-left shadow-lg hover:brightness-110 transition"
            >
              <div>
                <p className="font-bold text-white">Rapports & Statistiques</p>
                <p className="text-xs text-white/80 mt-1">Palmarès, marge, écarts de caisse</p>
              </div>
              <TrendingUp className="text-white" size={24} />
            </button>

            {/* Liste des factures */}
            <section className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-300">
                  Dernières factures
                </h2>
              </div>

              {invoices.length === 0 ? (
                <p className="text-center text-sm text-gray-500">
                  Aucune facture enregistrée.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {invoices.slice(0, 10).map((invoice) => (
                    <div
                      key={invoice.id}
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                      className="flex cursor-pointer items-center justify-between rounded-xl glass p-3 shadow-sm hover:bg-white/5 transition"
                    >
                      <div>
                        <p className="text-sm font-bold text-white">
                          {invoice.invoiceNumber}
                        </p>
                        <p className="text-xs text-gray-400">
                          {invoice.lines.length} produit(s) •{" "}
                          {new Date(invoice.createdAt).toLocaleString("fr-FR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-400">
                          {currencyFormatter.format(invoice.totalAmount)}
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
