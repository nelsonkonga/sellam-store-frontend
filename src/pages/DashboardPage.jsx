import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Wallet, TrendingUp, AlertTriangle, Plus, ShoppingBag, Cloud } from "lucide-react";
import { getDashboardData } from "../services/dashboardService";
import { getNotifications } from "../services/notificationService";
import { getCashStatus } from "../services/cashService";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";
import DashboardHeader from "../components/DashboardHeader";
import SummaryCard from "../components/SummaryCard";
import ProductRow from "../components/ProductRow";
import BottomNav from "../components/BottomNav";
import OfflineBanner from "../components/OfflineBanner";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

// Formatteur de montant en Francs CFA (adapte facilement à une autre devise si besoin)
const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "XAF",
  maximumFractionDigits: 0,
});

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [cashStatus, setCashStatus] = useState(null);
  const [hasNotifications, setHasNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { name } = useAuth();
  const { selectedShopId: shopId, selectedShopName, selectedShop } = useShop();
  const routeMessage = location.state?.message || "";

  // Charge les données consolidées du cockpit dès qu'on connaît la boutique active
  useEffect(() => {
    // Sans boutique sélectionnée, on ne peut rien afficher : retour à la sélection
    if (!shopId) {
      navigate("/shops");
      return;
    }

    async function fetchDashboard() {
      try {
        const [dashboardResult, notificationsResult, cashResult] = await Promise.allSettled([
          getDashboardData(shopId),
          getNotifications(shopId),
          getCashStatus(shopId),
        ]);

        if (dashboardResult.status === "fulfilled") {
          setDashboardData(dashboardResult.value);
          setError("");
        } else {
          setError("Impossible de charger les données du tableau de bord.");
        }

        setCashStatus(cashResult.status === "fulfilled" ? cashResult.value : null);

        const notificationsData = notificationsResult.status === "fulfilled" ? notificationsResult.value : [];
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
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [shopId, navigate]);

  const handleMarkAsRead = () => {
    setHasNotifications(false);
  };

  // Valeurs consolidées et agrégées côté base de données
  const totalSalesToday = dashboardData?.kpis?.totalSalesToday ?? 0;
  const totalMarginToday = dashboardData?.kpis?.totalMarginToday ?? 0;
  const averageBasket = dashboardData?.kpis?.averageBasket ?? 0;
  const lowStockCount = dashboardData?.kpis?.lowStockCount ?? 0;
  const recentInvoices = dashboardData?.recentInvoices || [];
  const criticalProducts = dashboardData?.criticalProducts || [];

  function getStatusBadge(status) {
    if (!status) return <span className="px-2 py-1 rounded-[4px] bg-[#bdc9c1] text-[#3e4943] text-[10px] font-bold uppercase tracking-wider">Inconnu</span>;
    
    switch (status) {
      case "OPEN":
        return <span className="px-2 py-1 rounded-[4px] bg-[#DDF4EA] text-[#005138] text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#95f6ca]"></span>Ouverte</span>;
      case "CLOSED":
        return <span className="px-2 py-1 rounded-[4px] bg-[#bdc9c1] text-[#3e4943] text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#bdc9c1]"></span>Fermée</span>;
      case "PENDING_INITIAL_CASH":
        return <span className="px-2 py-1 rounded-[4px] bg-[#ffddb9] text-[#663e00] text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#ffb962]"></span>En attente de solde initial</span>;
      default:
        return <span className="px-2 py-1 rounded-[4px] bg-[#bdc9c1] text-[#3e4943] text-[10px] font-bold uppercase tracking-wider">{status}</span>;
    }
  }
  return (
    <div className="min-h-screen bg-[#f1fcf5] pb-24 text-[#141e1a]">
      <OfflineBanner />

      <DashboardHeader
        shopName={selectedShopName || "Ma Boutique"}
        userName={name}
        shopLogoUrl={selectedShop?.logoUrl || null}
        hasNotifications={hasNotifications}
        onMarkAsRead={handleMarkAsRead}
      />

      <main className="mx-auto max-w-7xl px-5 py-2 md:px-8 lg:px-10">
        {routeMessage && (
          <div className="mt-4 rounded-xl border border-[#ffddb9] bg-[#fff8f1] px-4 py-3 text-sm text-[#7d4d00]" role="alert">
            {routeMessage}
          </div>
        )}

        {loading && (
          <p className="mt-10 text-center text-sm text-[#6e7a72]">
            Chargement du tableau de bord...
          </p>
        )}

        {!loading && error && (
          <ErrorState title="Le cockpit est partiellement indisponible" message={error} />
        )}

        {!loading && !error && (
          <>
          {/*
            <section className="mb-6 rounded-xl border border-[#ffddb9] bg-[#fff8f1] p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#9f6300]">À faire maintenant</p>
                  <h2 className="mt-1 font-display text-xl font-semibold text-[#7d4d00]">Votre activité est prête à repartir</h2>
                  <p className="mt-1 text-sm text-[#3e4943]">Enregistrez une vente ou consultez les alertes qui demandent votre attention.</p>
                </div>
                <button type="button" onClick={() => navigate("/sales/new")} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#006547] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#12805c]"><Plus size={17} />Nouvelle vente</button>
              </div>
            </section>
                */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                icon={Wallet}
                label="Ventes du jour"
                value={currencyFormatter.format(totalSalesToday)}
              />
              <SummaryCard
                icon={TrendingUp}
                label="Bénéfice"
                value={currencyFormatter.format(totalMarginToday)}
              />
              <SummaryCard
                icon={ShoppingBag}
                label="Panier moyen"
                value={currencyFormatter.format(averageBasket)}
              />
              <SummaryCard icon={Cloud} label="Synchronisation" value="Ok" unit="Données à jour" />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0">
<section className="mt-6 rounded-xl border border-[#bdc9c1] bg-white p-5 shadow-sm">
  {/* En-tête de section aéré et structuré */}
  <div className="mb-5 flex items-center justify-between border-b border-[#f1fcf5] pb-3">
    <div className="flex items-center gap-2">
      {/* Icône d'horloge pour ancrer l'aspect temporel */}
      <svg xmlns="http://w3.org" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#006547" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-clock"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <h2 className="font-display text-base font-bold text-[#141e1a]">Timeline : depuis l'ouverture</h2>
    </div>
    <span className="rounded-full bg-[#ebf6ef] px-2.5 py-0.5 text-xs font-semibold text-[#006547]">Aujourd'hui</span>
  </div>

  {recentInvoices.length === 0 ? (
    <EmptyState 
      title="Aucune facture aujourd'hui" 
      message="Les factures créées pendant la journée apparaîtront ici." 
      actionLabel="Démarrer une vente" 
      onAction={() => navigate("/sales/new")} 
    />
  ) : (
    /* Conteneur de la timeline avec une ligne verticale décorative à gauche */
    <div className="relative border-l-2 border-dashed border-[#bdc9c1] ml-2 pl-6 space-y-4 py-2">
      {recentInvoices.map((invoice) => (
          <div
            key={invoice.id}
            onClick={() => navigate(`/invoices/${invoice.id}`)}
            className="group relative flex cursor-pointer items-center justify-between rounded-xl border border-[#bdc9c1]/60 bg-white p-4 transition hover:border-[#006547] hover:bg-[#f1fcf5]/40 hover:shadow-sm"
          >
            {/* Puce chronologique sur la ligne verticale */}
            <span className="absolute -left-[33px] top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#006547] bg-white transition group-hover:bg-[#006547]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#006547] transition group-hover:bg-white" />
            </span>

            <div className="min-w-0 pr-4">
              <p className="text-sm font-bold text-[#141e1a] group-hover:text-[#006547] transition-colors">
                {invoice.invoiceNumber}
              </p>
              <p className="text-xs text-[#6e7a72] mt-0.5 truncate">
                {invoice.lines?.length || 0} produit(s) •{" "}
                {new Date(invoice.createdAt).toLocaleString("fr-FR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </p>
            </div>
            
            <div className="text-right shrink-0">
              <p className="text-sm font-extrabold text-[#006547]">
                {currencyFormatter.format(invoice.totalAmount)}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#6e7a72] mt-0.5">Encaissé</p>
            </div>
          </div>
        ))}
    </div>
  )}
</section>

              </div>

              <aside className="flex flex-col gap-4">
            <section className="overflow-hidden rounded-xl border border-[#bdc9c1] bg-white">
              <div className="flex items-center justify-between border-b border-[#bdc9c1] bg-[#ebf6ef]/50 p-4">
                <h2 className="font-display text-xl font-semibold">Caisse</h2>
                  {cashStatus?.activeSession ? getStatusBadge(cashStatus.activeSession.status) : getStatusBadge(null)}
                
              </div>
              <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#3e4943]">Statut de la session</span>
                  <span className="font-bold text-[#141e1a]">{cashStatus?.hasActiveSession ? "Session active" : "Aucune session"}</span>
                </div>
                <button type="button" onClick={() => navigate("/cash")} className="w-full rounded-lg border border-[#6e7a72] py-2 text-xs font-bold uppercase tracking-[0.05em] text-[#141e1a] transition hover:bg-[#ebf6ef]">
                  Voir le détail
                </button>
              </div>
            </section>
            <section className="rounded-xl border border-[#bdc9c1] bg-white p-4">
              <div className="mb-3 flex items-center justify-between border-b border-[#bdc9c1] pb-3"><h2 className="flex items-center gap-2 font-display text-lg font-semibold"><AlertTriangle size={19} className="text-[#9f6300]" />Stock critique</h2><span className="rounded-full bg-[#ffe8d1] px-2 py-1 text-xs font-bold text-[#9f6300]">{lowStockCount}</span></div>

              {criticalProducts.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#6e7a72]">
                  Tous les stocks sont à un niveau optimal.
                </div>
              ) : (
                <div className="flex flex-col">
                  {criticalProducts.map((product) => (
                    <ProductRow key={product.id} product={product} />
                  ))}
                </div>
              )}
            </section>
            <button type="button" onClick={() => navigate("/reports")} className="flex items-center justify-between rounded-xl border border-[#bdc9c1] bg-white p-4 text-left transition hover:border-[#006547]"><span><span className="block font-display font-semibold">Voir les analyses</span><span className="mt-1 block text-xs text-[#6e7a72]">Rapports et performance</span></span><TrendingUp size={18} className="text-[#006547]" /></button>
              </aside>
            </div>
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
