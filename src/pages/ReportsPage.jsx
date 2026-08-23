import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart2, TrendingUp, AlertTriangle, AlertCircle, Calendar } from "lucide-react";
import { useShop } from "../context/ShopContext";
import api from "../services/api";

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
});

export default function ReportsPage() {
    const navigate = useNavigate();
    const { selectedShopId } = useShop();

    const [period, setPeriod] = useState("day");
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [cashReliability, setCashReliability] = useState([]);
    const [negativeMargins, setNegativeMargins] = useState([]);
    
    // Vague 2 States
    const [categories, setCategories] = useState([]);
    const [deadStock, setDeadStock] = useState([]);
    const [payments, setPayments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [customers, setCustomers] = useState([]);
    
    // Vague 3 States
    const [cashflow, setCashflow] = useState(null);
    const [dormantStock, setDormantStock] = useState(null);
    const [stockAlerts, setStockAlerts] = useState([]);
    const [boughtTogether, setBoughtTogether] = useState([]);
    const [anomalies, setAnomalies] = useState([]);
    
    const [error, setError] = useState("");

    const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

    useEffect(() => {
        if (!selectedShopId) return;

        let start = new Date();
        let end = new Date();

        if (period === "day") {
            // Already today
        } else if (period === "week") {
            start.setDate(start.getDate() - 7);
        } else if (period === "month") {
            start.setMonth(start.getMonth() - 1);
        }

        const startStr = start.toISOString().split("T")[0];
        const endStr = end.toISOString().split("T")[0];

        setStartDate(startStr);
        setEndDate(endStr);
    }, [period, selectedShopId]);

    useEffect(() => {
        if (!selectedShopId || !startDate || !endDate) return;

        async function fetchReports() {
            setLoading(true);
            setError("");
            try {
                const params = { shopId: selectedShopId, start: startDate, end: endDate };
                const shopOnly = { shopId: selectedShopId };

                const [summaryRes, productsRes, cashRes, marginsRes, catRes, deadRes, payRes, empRes, custRes,
                       cashflowRes, dormantRes, alertsRes, togetherRes, anomaliesRes] = await Promise.all([
                    api.get("/reports/summary", { params }),
                    api.get("/reports/products", { params: { ...params, sortBy: "volume" } }),
                    api.get("/reports/cash-reliability", { params }),
                    api.get("/reports/negative-margins", { params }),
                    api.get("/reports/categories", { params }),
                    api.get("/reports/dead-stock", { params: shopOnly }),
                    api.get("/reports/payment-methods", { params }),
                    api.get("/reports/employees", { params }),
                    api.get("/reports/customers", { params }),
                    // Vague 3
                    api.get("/reports/cashflow-projection", { params: shopOnly }),
                    api.get("/reports/dormant-stock-value", { params: shopOnly }),
                    api.get("/reports/stock-out-alerts", { params: shopOnly }),
                    api.get("/reports/bought-together", { params }),
                    api.get("/reports/anomalies", { params }),
                ]);

                setSummary(summaryRes.data);
                setTopProducts(productsRes.data);
                setCashReliability(cashRes.data);
                setNegativeMargins(marginsRes.data);
                setCategories(catRes.data);
                setDeadStock(deadRes.data);
                setPayments(payRes.data);
                setEmployees(empRes.data);
                setCustomers(custRes.data);
                // Vague 3
                setCashflow(cashflowRes.data);
                setDormantStock(dormantRes.data);
                setStockAlerts(alertsRes.data);
                setBoughtTogether(togetherRes.data);
                setAnomalies(anomaliesRes.data);
            } catch (err) {
                console.error(err);
                setError("Impossible de charger les rapports.");
            } finally {
                setLoading(false);
            }
        }
        fetchReports();
    }, [selectedShopId, startDate, endDate]);

    return (
        <div className="min-h-screen bg-section-dark text-white pb-20">
            <header className="flex items-center justify-between px-5 py-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:bg-white/10"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold">Rapports & Bilan</h1>
                        <p className="text-sm text-gray-400">Centre de pilotage</p>
                    </div>
                </div>
                <div className="flex bg-white/5 rounded-xl p-1">
                    {["day", "week", "month"].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                period === p ? "bg-brand-500 text-white" : "text-gray-400 hover:text-white"
                            }`}
                        >
                            {p === "day" ? "Auj." : p === "week" ? "7 J" : "30 J"}
                        </button>
                    ))}
                </div>
            </header>

            <main className="px-5 space-y-6">
                {error && (
                    <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20 text-gray-400">Chargement...</div>
                ) : (
                    <>
                        {/* A1 : Synthèse */}
                        <section className="grid grid-cols-2 gap-4">
                            <div className="glass rounded-2xl p-5">
                                <p className="text-sm text-gray-400 mb-1">Chiffre d'Affaires</p>
                                <p className="text-2xl font-bold">{currencyFormatter.format(summary?.totalRevenue || 0)}</p>
                            </div>
                            <div className="glass rounded-2xl p-5">
                                <p className="text-sm text-gray-400 mb-1">Marge Générée</p>
                                <p className="text-2xl font-bold text-emerald-400">{currencyFormatter.format(summary?.totalMargin || 0)}</p>
                            </div>
                            <div className="glass rounded-2xl p-5">
                                <p className="text-sm text-gray-400 mb-1">Ventes (Factures)</p>
                                <p className="text-2xl font-bold">{summary?.invoiceCount || 0}</p>
                            </div>
                            <div className="glass rounded-2xl p-5">
                                <p className="text-sm text-gray-400 mb-1">Panier Moyen</p>
                                <p className="text-2xl font-bold">{currencyFormatter.format(summary?.averageBasket || 0)}</p>
                            </div>
                        </section>

                        {/* B1 : Palmarès */}
                        <section className="glass rounded-2xl p-5">
                            <h2 className="flex items-center gap-2 text-lg font-bold mb-4">
                                <TrendingUp size={20} className="text-brand-400" /> Palmarès Produits
                            </h2>
                            {topProducts.length === 0 ? (
                                <p className="text-sm text-gray-400">Aucune vente sur la période.</p>
                            ) : (
                                <div className="space-y-3">
                                    {topProducts.slice(0, 5).map((p, idx) => (
                                        <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-2">
                                            <div>
                                                <p className="font-semibold">{p.productName}</p>
                                                <p className="text-xs text-gray-400">{p.quantitySold} vendus</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-emerald-400">+{currencyFormatter.format(p.marginGenerated)}</p>
                                                <p className="text-xs text-gray-400">Marge</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* C4 : Fiabilité Caisse */}
                        <section className="glass rounded-2xl p-5">
                            <h2 className="flex items-center gap-2 text-lg font-bold mb-4">
                                <BarChart2 size={20} className="text-blue-400" /> Écarts de Caisse
                            </h2>
                            {cashReliability.length === 0 ? (
                                <p className="text-sm text-gray-400">Aucun bilan enregistré.</p>
                            ) : (
                                <div className="space-y-2">
                                    {cashReliability.map((c, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400" />
                                                <span className="text-sm">{c.date}</span>
                                            </div>
                                            <span className={`font-bold ${c.discrepancy < 0 ? "text-red-400" : c.discrepancy > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                                                {c.discrepancy > 0 ? "+" : ""}{currencyFormatter.format(c.discrepancy)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* E2 : Marge Négative */}
                        <section className="glass rounded-2xl p-5 border border-red-500/20">
                            <h2 className="flex items-center gap-2 text-lg font-bold mb-4 text-red-400">
                                <AlertTriangle size={20} /> Ventes à Marge Négative
                            </h2>
                            {negativeMargins.length === 0 ? (
                                <p className="text-sm text-gray-400">Aucune vente à perte détectée.</p>
                            ) : (
                                <div className="space-y-3">
                                    {negativeMargins.map((m, idx) => (
                                        <div key={idx} className="bg-red-500/10 p-3 rounded-lg flex flex-col gap-1">
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-red-100">{m.productName} (x{m.quantity})</span>
                                                <span className="text-red-400 font-bold">{currencyFormatter.format(m.margin)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>Achat: {currencyFormatter.format(m.unitPurchasePrice)}</span>
                                                <span>Vente: {currencyFormatter.format(m.unitSellingPrice)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                        
                        {/* A2 & A3 : Catégories */}
                        <section className="glass rounded-2xl p-5">
                            <h2 className="text-lg font-bold mb-4">Marge par Catégorie</h2>
                            {categories.length === 0 ? (
                                <p className="text-sm text-gray-400">Aucune donnée disponible.</p>
                            ) : (
                                <div className="space-y-2">
                                    {categories.map((c, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                            <span className="font-semibold">{c.category || "Général"}</span>
                                            <div className="text-right">
                                                <p className="font-bold text-emerald-400">{currencyFormatter.format(c.margin)}</p>
                                                <p className="text-xs text-gray-400">CA: {currencyFormatter.format(c.revenue)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* B2 : Dead Stock */}
                        <section className="glass rounded-2xl p-5 border border-amber-500/20">
                            <h2 className="text-lg font-bold mb-4 text-amber-400">Produits à Rotation Lente</h2>
                            {deadStock.filter(d => d.daysSinceLastSale > 30 || d.daysSinceLastSale === -1).length === 0 ? (
                                <p className="text-sm text-gray-400">Aucun produit dormant.</p>
                            ) : (
                                <div className="space-y-2">
                                    {deadStock.filter(d => d.daysSinceLastSale > 30 || d.daysSinceLastSale === -1).slice(0, 5).map((d, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-amber-500/10 p-3 rounded-lg">
                                            <div>
                                                <p className="font-semibold">{d.productName}</p>
                                                <p className="text-xs text-gray-400">En stock: {d.stockQuantity}</p>
                                            </div>
                                            <span className="text-amber-400 text-sm font-bold">
                                                {d.daysSinceLastSale === -1 ? "Jamais vendu" : `+${d.daysSinceLastSale} jours`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* C1 : Méthodes de Paiement */}
                        <section className="glass rounded-2xl p-5">
                            <h2 className="text-lg font-bold mb-4">Répartition des Paiements</h2>
                            {payments.length === 0 ? (
                                <p className="text-sm text-gray-400">Aucun paiement enregistré.</p>
                            ) : (
                                <div className="space-y-2">
                                    {payments.map((p, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                            <span className="font-semibold">{p.method}</span>
                                            <span className="font-bold">{currencyFormatter.format(p.totalRevenue)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* C3 : Performances Employés */}
                        <section className="glass rounded-2xl p-5">
                            <h2 className="text-lg font-bold mb-4">Ventes par Employé</h2>
                            {employees.length === 0 ? (
                                <p className="text-sm text-gray-400">Aucune donnée.</p>
                            ) : (
                                <div className="space-y-2">
                                    {employees.map((e, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                            <span className="font-semibold">{e.employeeName}</span>
                                            <span className="font-bold">{currencyFormatter.format(e.totalRevenue)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* D2 : Meilleurs Clients */}
                        <section className="glass rounded-2xl p-5">
                            <h2 className="text-lg font-bold mb-4">Palmarès Clients</h2>
                            {customers.length === 0 ? (
                                <p className="text-sm text-gray-400">Aucun client identifié.</p>
                            ) : (
                                <div className="space-y-2">
                                    {customers.map((c, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                            <span className="font-semibold">{c.customerName}</span>
                                            <span className="font-bold">{currencyFormatter.format(c.totalRevenue)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* --- VAGUE 3 --- */}
                        <div className="col-span-1 sm:col-span-2 pt-4 border-t border-white/10 mt-4">
                            <h2 className="text-xl font-bold mb-6 text-brand-400">Analytique Avancée & Prédictions</h2>
                        </div>

                        {/* A5 : Prévision de trésorerie */}
                        <section className="glass rounded-2xl p-5 sm:col-span-2">
                            <h2 className="text-lg font-bold mb-4">Prévision de Trésorerie (30 prochains jours)</h2>
                            {!cashflow ? (
                                <p className="text-sm text-gray-400">Calcul en cours...</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-white/5 p-4 rounded-xl">
                                        <p className="text-sm text-gray-400 mb-1">Moyenne quotidienne</p>
                                        <p className="text-xl font-bold text-white">{currencyFormatter.format(cashflow.averageDailyRevenue)}</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl">
                                        <p className="text-sm text-gray-400 mb-1">CA 30 derniers jours</p>
                                        <p className="text-xl font-bold text-gray-300">{currencyFormatter.format(cashflow.past30DaysRevenue)}</p>
                                    </div>
                                    <div className="bg-brand-500/20 border border-brand-500/30 p-4 rounded-xl">
                                        <p className="text-sm text-brand-200 mb-1">CA Projeté (30j)</p>
                                        <p className="text-2xl font-bold text-brand-400">{currencyFormatter.format(cashflow.projectedNext30DaysRevenue)}</p>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* A6 : Stock dormant */}
                        <section className="glass rounded-2xl p-5">
                            <h2 className="text-lg font-bold mb-4">Valeur du Stock Dormant</h2>
                            {!dormantStock ? (
                                <p className="text-sm text-gray-400">Calcul en cours...</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                                        <span className="font-medium text-gray-300">Valeur immobilisée</span>
                                        <span className="text-xl font-bold text-amber-400">{currencyFormatter.format(dormantStock.totalDormantValue)}</span>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-2">
                                        {dormantStock.dormantProductCount} produits n'ont pas généré de ventes depuis plus de 30 jours.
                                    </p>
                                </div>
                            )}
                        </section>

                        {/* B3 : Alertes Rupture */}
                        <section className="glass rounded-2xl p-5 border border-red-500/20">
                            <h2 className="text-lg font-bold mb-4 text-red-400 flex items-center gap-2">
                                <AlertCircle size={20} /> Alertes Rupture Imminente
                            </h2>
                            {stockAlerts.length === 0 ? (
                                <p className="text-sm text-gray-400">Aucun risque de rupture à court terme.</p>
                            ) : (
                                <div className="space-y-3">
                                    {stockAlerts.map((alert, idx) => (
                                        <div key={idx} className="bg-red-500/10 p-3 rounded-lg flex flex-col gap-1">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-red-100">{alert.productName}</span>
                                                <span className="text-red-400 font-bold text-sm">
                                                    {alert.estimatedDaysRemaining === 0 ? "Rupture aujourd'hui" : `${alert.estimatedDaysRemaining} jours restants`}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>Stock actuel: {alert.currentStock}</span>
                                                <span>Vitesse: {alert.dailyVelocity.toFixed(1)}/jour</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* B5 : Produits achetés ensemble */}
                        <section className="glass rounded-2xl p-5">
                            <h2 className="text-lg font-bold mb-4">Fréquemment Achetés Ensemble</h2>
                            {boughtTogether.length === 0 ? (
                                <p className="text-sm text-gray-400">Pas assez de données de ventes croisées.</p>
                            ) : (
                                <div className="space-y-2">
                                    {boughtTogether.map((pair, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold">{pair.productA}</span>
                                                <span className="text-xs text-gray-400">+ {pair.productB}</span>
                                            </div>
                                            <span className="font-bold text-brand-300 text-sm bg-brand-500/20 px-2 py-1 rounded-md">
                                                {pair.pairOccurrences} fois
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* E1/E3 : Anomalies */}
                        <section className="glass rounded-2xl p-5">
                            <h2 className="text-lg font-bold mb-4">Anomalies de Ventes</h2>
                            {anomalies.length === 0 ? (
                                <p className="text-sm text-gray-400">Aucune activité inhabituelle détectée sur la période.</p>
                            ) : (
                                <div className="space-y-2">
                                    {anomalies.map((anom, idx) => (
                                        <div key={idx} className={`flex justify-between items-center p-3 rounded-lg ${anom.anomalyType === "PIC" ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold">{anom.date}</span>
                                                <span className={`text-xs ${anom.anomalyType === "PIC" ? "text-emerald-400" : "text-red-400"}`}>
                                                    {anom.anomalyType === "PIC" ? "Pic exceptionnel" : "Creux inhabituel"}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">{currencyFormatter.format(anom.revenue)}</p>
                                                <p className="text-xs text-gray-400">Moyenne: {currencyFormatter.format(anom.averageRevenue)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}
