import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import api from "../services/api";
import BottomNav from "../components/BottomNav";
import { ArrowLeft, Download, Mail, X} from "lucide-react";

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
    
    const [categories, setCategories] = useState([]);
    const [deadStock, setDeadStock] = useState([]);
    const [payments, setPayments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [customers, setCustomers] = useState([]);
    
    const [cashflow, setCashflow] = useState(null);
    const [dormantStock, setDormantStock] = useState(null);
    const [stockAlerts, setStockAlerts] = useState([]);
    const [boughtTogether, setBoughtTogether] = useState([]);
    const [anomalies, setAnomalies] = useState([]);
    
    const [error, setError] = useState("");

    const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

    const [emailDialogOpen, setEmailDialogOpen] = useState(false);
    const [emailReportType, setEmailReportType] = useState("");
    const [emailRecipient, setEmailRecipient] = useState("");
    const [emailSending, setEmailSending] = useState(false);

    const exportPdf = async (reportType, params = {}) => {
        try {
            const requiresDates = !["dead-stock", "cashflow-projection", "dormant-stock-value", "stock-out-alerts"].includes(reportType);
            const requestParams = requiresDates
                ? { shopId: selectedShopId, start: startDate, end: endDate, ...params }
                : { shopId: selectedShopId, ...params };

            const response = await api.get(`/reports/${reportType}/pdf`, {
                params: requestParams,
                responseType: "blob"
            });

            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);

            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                window.open(url, "_blank");
            } else {
                const link = document.createElement("a");
                link.href = url;
                link.download = `${reportType}_${startDate}_${endDate}.pdf`;
                document.body.appendChild(link);
                link.click();
                link.remove();
            }

            setTimeout(() => window.URL.revokeObjectURL(url), 100);
        } catch (err) {
            console.error("Erreur export PDF:", err);
            alert("Erreur lors de l'export PDF");
        }
    };

    const openEmailDialog = (reportType) => {
        setEmailReportType(reportType);
        setEmailRecipient("");
        setEmailDialogOpen(true);
    };

    const sendReportEmail = async () => {
        if (!emailRecipient || !emailReportType) return;

        setEmailSending(true);
        try {
            const requiresDates = !["dead-stock", "cashflow-projection", "dormant-stock-value", "stock-out-alerts"].includes(emailReportType);
            const requestParams = requiresDates
                ? { shopId: selectedShopId, start: startDate, end: endDate, toEmail: emailRecipient }
                : { shopId: selectedShopId, toEmail: emailRecipient };

            await api.post(`/reports/${emailReportType}/email`, null, {
                params: requestParams
            });
            alert("Rapport envoyé par email avec succès !");
            setEmailDialogOpen(false);
        } catch (err) {
            console.error("Erreur envoi email:", err);
            alert("Erreur lors de l'envoi du rapport par email");
        } finally {
            setEmailSending(false);
        }
    };

    useEffect(() => {
        if (!selectedShopId) return;

        let start = new Date();
        let end = new Date();

        if (period === "day") {
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
                    api.get("/reports/products", { params: { ...params, sortBy: "margin" } }),
                    api.get("/reports/cash-reliability", { params }),
                    api.get("/reports/negative-margins", { params }),
                    api.get("/reports/categories", { params }),
                    api.get("/reports/dead-stock", { params: shopOnly }),
                    api.get("/reports/payment-methods", { params }),
                    api.get("/reports/employees", { params }),
                    api.get("/reports/customers", { params }),
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
        <div className="min-h-screen bg-[#f1fcf5] pb-24 text-[#141e1a]">
            <div className="mx-auto max-w-7xl px-5 py-2 md:px-8 lg:px-10">
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => navigate("/dashboard")} className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#bdc9c1] bg-white text-[#3e4943] hover:bg-[#ebf6ef]">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#006547]">Analyses</p>
                        <h1 className="font-display text-3xl font-bold">Rapports de Performance</h1>
                        <p className="text-sm text-[#6e7a72]">Analysez vos ventes, marges et performances.</p>
                    </div>
                </div>

                <div class="flex w-fit ml-auto rounded-lg border border-[#bdc9c1] bg-white p-1 mb-6">

                    {["day", "week", "month"].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                period === p ? "bg-[#12805c] text-white" : "text-[#6e7a72] hover:text-[#006547]"
                            }`}
                        >
                            {p === "day" ? "24 H" : p === "week" ? "7 J" : "30 J"}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="rounded-lg border border-[#ffdad6] bg-[#ffdad6] p-4 text-sm text-[#93000a] mb-6">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20 text-[#6e7a72]">Chargement...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Synthèse */}
                        <div className="bg-white border border-[#bdc9c1] rounded-xl p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-[#141e1a]">Rapport Synthétique</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => exportPdf("summary")} className="p-2 text-[#3e4943] hover:bg-[#ebf6ef] rounded transition-colors">
                                        <Download size={20} />
                                    </button>
                                    <button onClick={() => openEmailDialog("summary")} className="p-2 text-[#3e4943] hover:bg-[#ebf6ef] rounded transition-colors">
                                        <Mail size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#ebf6ef] rounded-lg p-4">
                                    <p className="text-sm text-[#3e4943] mb-1">Chiffre d'Affaires</p>
                                    <p className="text-2xl font-bold text-[#141e1a]">{currencyFormatter.format(summary?.totalRevenue || 0)}</p>
                                </div>
                                <div className="bg-[#ebf6ef] rounded-lg p-4">
                                    <p className="text-sm text-[#3e4943] mb-1">Marge Générée</p>
                                    <p className="text-2xl font-bold text-[#006547]">{currencyFormatter.format(summary?.totalMargin || 0)}</p>
                                </div>
                                <div className="bg-[#ebf6ef] rounded-lg p-4">
                                    <p className="text-sm text-[#3e4943] mb-1">Ventes (Factures)</p>
                                    <p className="text-2xl font-bold text-[#141e1a]">{summary?.invoiceCount || 0}</p>
                                </div>
                                <div className="bg-[#ebf6ef] rounded-lg p-4">
                                    <p className="text-sm text-[#3e4943] mb-1">Panier Moyen</p>
                                    <p className="text-2xl font-bold text-[#141e1a]">{currencyFormatter.format(summary?.averageBasket || 0)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Palmarès Produits */}
                        <div className="bg-white border border-[#bdc9c1] rounded-xl p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-[#141e1a]">Palmarès Produits</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => exportPdf("products")} className="p-2 text-[#3e4943] hover:bg-[#ebf6ef] rounded transition-colors">
                                        <Download size={20} />
                                    </button>
                                    <button onClick={() => openEmailDialog("products")} className="p-2 text-[#3e4943] hover:bg-[#ebf6ef] rounded transition-colors">
                                        <Mail size={20} />
                                    </button>
                                </div>
                            </div>
                            {topProducts.length === 0 ? (
                                <p className="text-sm text-[#6e7a72]">Aucune vente sur la période.</p>
                            ) : (
                                <div className="space-y-3">
                                    {topProducts.slice(0, 5).map((p, idx) => (
    <div key={idx} className="flex justify-between items-center border-b border-[#dae5de] pb-2 last:border-0">
        <div className="flex items-center gap-3">
            {/* Badge de position */}
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                idx === 0 ? "bg-[#ffddb9] text-[#7d4d00]" : 
                idx === 1 ? "bg-gray-200 text-gray-700" : 
                "bg-[#ebf6ef] text-[#006547]"
            }`}>
                {idx + 1}
            </span>
            <div>
                <p className="font-semibold text-[#141e1a] line-clamp-1">{p.productName}</p>
                <p className="text-xs text-[#6e7a72]">{p.quantitySold} vendus</p>
            </div>
        </div>
        <div className="text-right">
            <p className="font-semibold text-[#006547]">+{currencyFormatter.format(p.marginGenerated)}</p>
            <p className="text-[10px] uppercase tracking-wider text-[#6e7a72]">Marge</p>
        </div>
    </div>
))}
                                </div>
                            )}
                        </div>

                        {/* Écarts de Caisse */}
                        <div className="bg-white border border-[#bdc9c1] rounded-xl p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-[#141e1a]">Écarts de Caisse</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => exportPdf("cash-reliability")} className="p-2 text-[#3e4943] hover:bg-[#ebf6ef] rounded transition-colors">
                                        <Download size={20} />
                                    </button>
                                    <button onClick={() => openEmailDialog("cash-reliability")} className="p-2 text-[#3e4943] hover:bg-[#ebf6ef] rounded transition-colors">
                                        <Mail size={20} />
                                    </button>
                                </div>
                            </div>
                            {cashReliability.length === 0 ? (
                                <p className="text-sm text-[#6e7a72]">Aucun bilan enregistré.</p>
                            ) : (
                                <div className="space-y-2">
                                    {cashReliability.map((c, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-[#ebf6ef] p-3 rounded-lg">
                                            <span className="text-sm text-[#141e1a]">{c.date}</span>
                                            <span className={`font-bold ${c.discrepancy < 0 ? "text-[#ba1a1a]" : c.discrepancy > 0 ? "text-[#9f6300]" : "text-[#006547]"}`}>
                                                {c.discrepancy > 0 ? "+" : ""}{currencyFormatter.format(c.discrepancy)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Marge Négative */}
                        <div className="bg-white border border-[#ffdad6] rounded-xl p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-[#ba1a1a]">Ventes à Marge Négative</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => exportPdf("negative-margins")} className="p-2 text-[#3e4943] hover:bg-[#ebf6ef] rounded transition-colors">
                                        <Download size={20} />
                                    </button>
                                    <button onClick={() => openEmailDialog("negative-margins")} className="p-2 text-[#3e4943] hover:bg-[#ebf6ef] rounded transition-colors">
                                        <Mail size={20} />
                                    </button>
                                </div>
                            </div>
                            {negativeMargins.length === 0 ? (
                                <p className="text-sm text-[#6e7a72]">Aucune vente à perte détectée.</p>
                            ) : (
                                <div className="space-y-3">
                                    {negativeMargins.map((m, idx) => (
                                        <div key={idx} className="bg-[#ffdad6]/20 p-3 rounded-lg flex flex-col gap-1">
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-[#141e1a]">{m.productName} (x{m.quantity})</span>
                                                <span className="text-[#ba1a1a] font-bold">{currencyFormatter.format(m.margin)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-[#3e4943]">
                                                <span>Achat: {currencyFormatter.format(m.unitPurchasePrice)}</span>
                                                <span>Vente: {currencyFormatter.format(m.unitSellingPrice)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Marge par Catégorie */}
                        <div className="bg-white border border-[#bdc9c1] rounded-xl p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-[#141e1a]">Marge par Catégorie</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => exportPdf("categories")} className="p-2 text-[#3e4943] hover:bg-[#ebf6ef] rounded transition-colors">
                                        <Download size={20} />
                                    </button>
                                    <button onClick={() => openEmailDialog("categories")} className="p-2 text-[#3e4943] hover:bg-[#ebf6ef] rounded transition-colors">
                                        <Mail size={20} />
                                    </button>
                                </div>
                            </div>
                            {categories.length === 0 ? (
                                <p className="text-sm text-[#6e7a72]">Aucune donnée disponible.</p>
                            ) : (
                                <div className="space-y-2">
                                    {categories.map((c, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-[#ebf6ef] p-3 rounded-lg">
                                            <span className="font-semibold text-[#141e1a]">{c.category || "Général"}</span>
                                            <div className="text-right">
                                                <p className="font-bold text-[#006547]">{currencyFormatter.format(c.margin)}</p>
                                                <p className="text-xs text-[#3e4943]">CA: {currencyFormatter.format(c.revenue)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Produits à Rotation Lente */}
                        <div className="bg-white border border-[#ffddb9] rounded-xl p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-[#9f6300]">Produits à Rotation Lente</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => exportPdf("dead-stock", {})} className="p-2 text-[#3e4943] hover:bg-[#ebf6ef] rounded transition-colors">
                                        <Download size={20} />
                                    </button>
                                    <button onClick={() => openEmailDialog("dead-stock")} className="p-2 text-[#3e4943] hover:bg-[#ebf6ef] rounded transition-colors">
                                        <Mail size={20} />
                                    </button>
                                </div>
                            </div>
                            {deadStock.filter(d => d.daysSinceLastSale > 30 || d.daysSinceLastSale === -1).length === 0 ? (
                                <p className="text-sm text-[#6e7a72]">Aucun produit dormant.</p>
                            ) : (
                                <div className="space-y-2">
                                    {deadStock.filter(d => d.daysSinceLastSale > 30 || d.daysSinceLastSale === -1).slice(0, 5).map((d, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-[#ffddb9]/20 p-3 rounded-lg">
                                            <div>
                                                <p className="font-semibold text-[#141e1a]">{d.productName}</p>
                                                <p className="text-xs text-[#3e4943]">En stock: {d.stockQuantity}</p>
                                            </div>
                                            <span className="text-[#9f6300] text-sm font-bold">
                                                {d.daysSinceLastSale === -1 ? "Jamais vendu" : `+${d.daysSinceLastSale} jours`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Répartition des Paiements */}
                        <div className="bg-white border border-[#bdc9c1] rounded-xl p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-[#141e1a]">Répartition des Paiements</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => exportPdf("payment-methods")} className="p-2 text-[#3e4943] hover:bg-[#ebf6ef] rounded transition-colors">
                                        <Download size={20} />
                                    </button>
                                    <button onClick={() => openEmailDialog("payment-methods")} className="p-2 text-[#3e4943] hover:bg-[#ebf6ef] rounded transition-colors">
                                        <Mail size={20} />
                                    </button>
                                </div>
                            </div>
                            {payments.length === 0 ? (
                                <p className="text-sm text-[#6e7a72]">Aucun paiement enregistré.</p>
                            ) : (
                                <div className="space-y-2">
                                    {payments.map((p, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-[#ebf6ef] p-3 rounded-lg">
                                            <span className="font-semibold text-[#141e1a]">{p.method}</span>
                                            <span className="font-bold text-[#141e1a]">{currencyFormatter.format(p.totalRevenue)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Ventes par Employé */}
                        <div className="bg-white border border-[#bdc9c1] rounded-xl p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-[#141e1a]">Ventes par Employé</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => exportPdf("employees")} className="p-2 text-[#3e4943] hover:bg-[#ebf6ef] rounded transition-colors">
                                        <Download size={20} />
                                    </button>
                                    <button onClick={() => openEmailDialog("employees")} className="p-2 text-[#3e4943] hover:bg-[#ebf6ef] rounded transition-colors">
                                        <Mail size={20} />
                                    </button>
                                </div>
                            </div>
                            {employees.length === 0 ? (
                                <p className="text-sm text-[#6e7a72]">Aucune donnée.</p>
                            ) : (
                                <div className="space-y-2">
                                    {employees.map((e, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-[#ebf6ef] p-3 rounded-lg">
                                            <span className="font-semibold text-[#141e1a]">{e.employeeName}</span>
                                            <span className="font-bold text-[#141e1a]">{currencyFormatter.format(e.totalRevenue)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Palmarès Clients */}
<div className="bg-white border border-[#bdc9c1] rounded-xl p-5">
    <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[#141e1a]">Palmarès Clients</h3>
        <div className="flex gap-2">
            <button onClick={() => exportPdf("customers")} className="p-2 text-[#3e4943] hover:bg-[#ebf6ef] rounded transition-colors">
                <Download size={20} />
            </button>
            <button onClick={() => openEmailDialog("customers")} className="p-2 text-[#3e4943] hover:bg-[#ebf6ef] rounded transition-colors">
                <Mail size={20} />
            </button>
        </div>
    </div>
    {customers.length === 0 ? (
        <p className="text-sm text-[#6e7a72]">Aucun client identifié.</p>
    ) : (
        <div className="space-y-3">
            {/* .slice(0, 5) pour n'afficher que le top 5 sur le tableau de bord */}
{customers.slice(0, 5).map((c, idx) => (
    <div key={c.id || idx} className="flex justify-between items-center border-b border-[#dae5de] pb-2 last:border-0">
        <div className="flex items-center gap-3 min-w-0">
            {/* Badge de classement harmonisé avec le palmarès produit */}
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ebf6ef] text-[11px] font-bold text-[#006547]">
                #{idx + 1}
            </span>
            <div className="min-w-0">
                <p className="font-semibold text-[#141e1a] text-sm truncate">{c.customerName || "Client Anonyme"}</p>
                <p className="text-xs text-[#6e7a72]">Fidélité Classement</p>
            </div>
        </div>
        <div className="text-right shrink-0">
            {/* Montant total dépensé par le client */}
            <p className="font-bold text-sm text-[#141e1a]">
                {currencyFormatter.format(c.totalRevenue || 0)}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-[#6e7a72]">Volume Achat</p>
        </div>
    </div>
))}

        </div>
    )}
</div>


                        {/* Prévision de trésorerie */}
                        <div className="bg-white border border-[#bdc9c1] rounded-xl p-5">
    <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[#141e1a]">Prévision de Trésorerie (30j)</h3>
        <div className="flex gap-2">
            <button onClick={() => exportPdf("cashflow-projection", {})} className="p-2 text-[#3e4943] hover:bg-[#ebf6ef] rounded transition-colors">
                <Download size={20} />
            </button>
            <button onClick={() => openEmailDialog("cashflow-projection")} className="p-2 text-[#3e4943] hover:bg-[#ebf6ef] rounded transition-colors">
                <Mail size={20} />
            </button>
        </div>
    </div>
    {!cashflow ? (
        <p className="text-sm text-[#6e7a72]">Calcul en cours...</p>
    ) : (
    
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
            <div className="bg-[#ebf6ef] p-3 rounded-lg flex flex-col justify-between min-w-0">
                <p className="text-xs text-[#3e4943] mb-1 truncate">Moyenne quotidienne</p>

                <p className="text-base font-bold text-[#141e1a] sm:text-lg break-all">{currencyFormatter.format(cashflow.averageDailyRevenue)}</p>
            </div>
            <div className="bg-[#ebf6ef] p-3 rounded-lg flex flex-col justify-between min-w-0">
                <p className="text-xs text-[#3e4943] mb-1 truncate">CA 30 derniers jours</p>
                <p className="text-base font-bold text-[#3e4943] sm:text-lg break-all">{currencyFormatter.format(cashflow.past30DaysRevenue)}</p>
            </div>

            <div className="bg-[#95f6ca] border border-[#006547] p-3 rounded-lg flex flex-col justify-between min-w-0 md:col-span-2 xl:col-span-1">
                <p className="text-xs text-[#005138] mb-1 truncate">CA Projeté (30j)</p>
                <p className="text-lg font-bold text-[#006547] sm:text-xl break-all">{currencyFormatter.format(cashflow.projectedNext30DaysRevenue)}</p>
            </div>
        </div>
    )}
</div>


                        {/* Valeur du Stock Dormant */}
                        <div className="bg-white border border-[#bdc9c1] rounded-xl p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-[#141e1a]">Valeur du Stock Dormant</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => exportPdf("dormant-stock-value", {})} className="p-2 text-[#3e4943] hover:bg-[#ebf6ef] rounded transition-colors">
                                        <Download size={20} />
                                    </button>
                                    <button onClick={() => openEmailDialog("dormant-stock-value")} className="p-2 text-[#3e4943] hover:bg-[#ebf6ef] rounded transition-colors">
                                        <Mail size={20} />
                                    </button>
                                </div>
                            </div>
                            {!dormantStock ? (
                                <p className="text-sm text-[#6e7a72]">Calcul en cours...</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center bg-[#ebf6ef] p-4 rounded-lg">
                                        <span className="font-medium text-[#141e1a]">Valeur immobilisée</span>
                                        <span className="text-xl font-bold text-[#9f6300]">{currencyFormatter.format(dormantStock.totalDormantValue)}</span>
                                    </div>
                                    <p className="text-sm text-[#3e4943] mt-2">
                                        {dormantStock.dormantProductCount} produits n'ont pas généré de ventes depuis plus de 30 jours.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Alertes Rupture */}
                        <div className="bg-white border border-[#ffdad6] rounded-xl p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-[#ba1a1a]">Alertes Rupture Imminente</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => exportPdf("stock-out-alerts", {})} className="p-2 text-[#3e4943] hover:bg-[#ebf6ef] rounded transition-colors">
                                        <Download size={20} />
                                    </button>
                                    <button onClick={() => openEmailDialog("stock-out-alerts")} className="p-2 text-[#3e4943] hover:bg-[#ebf6ef] rounded transition-colors">
                                        <Mail size={20} />
                                    </button>
                                </div>
                            </div>
                            {stockAlerts.length === 0 ? (
                                <p className="text-sm text-[#6e7a72]">Aucun risque de rupture à court terme.</p>
                            ) : (
                                <div className="space-y-3">
                                    {stockAlerts.map((alert, idx) => (
                                        <div key={idx} className="bg-[#ffdad6]/20 p-3 rounded-lg flex flex-col gap-1">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-[#141e1a]">{alert.productName}</span>
                                                <span className="text-[#ba1a1a] font-bold text-sm">
                                                    {alert.estimatedDaysRemaining === 0 ? "Rupture aujourd'hui" : `${alert.estimatedDaysRemaining} jours restants`}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs text-[#3e4943]">
                                                <span>Stock actuel: {alert.currentStock}</span>
                                                <span>Vitesse: {alert.dailyVelocity.toFixed(1)}/jour</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Produits achetés ensemble */}
                        <div className="bg-white border border-[#bdc9c1] rounded-xl p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-[#141e1a]">Fréquemment Achetés Ensemble</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => exportPdf("bought-together")} className="p-2 text-[#3e4943] hover:bg-[#ebf6ef] rounded transition-colors">
                                        <Download size={20} />
                                    </button>
                                    <button onClick={() => openEmailDialog("bought-together")} className="p-2 text-[#3e4943] hover:bg-[#ebf6ef] rounded transition-colors">
                                        <Mail size={20} />
                                    </button>
                                </div>
                            </div>
                            {boughtTogether.length === 0 ? (
                                <p className="text-sm text-[#6e7a72]">Pas assez de données de ventes croisées.</p>
                            ) : (
                                <div className="space-y-2">
                                    {boughtTogether.map((pair, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-[#ebf6ef] p-3 rounded-lg">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-[#141e1a]">{pair.productA}</span>
                                                <span className="text-xs text-[#3e4943]">+ {pair.productB}</span>
                                            </div>
                                            <span className="font-bold text-[#006547] text-sm bg-[#95f6ca] px-2 py-1 rounded-md">
                                                {pair.pairOccurrences} fois
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Anomalies de Ventes */}
                        <div className="bg-white border border-[#bdc9c1] rounded-xl p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-[#141e1a]">Anomalies de Ventes</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => exportPdf("anomalies")} className="p-2 text-[#3e4943] hover:bg-[#ebf6ef] rounded transition-colors">
                                        <Download size={20} />
                                    </button>
                                    <button onClick={() => openEmailDialog("anomalies")} className="p-2 text-[#3e4943] hover:bg-[#ebf6ef] rounded transition-colors">
                                        <Mail size={20} />
                                    </button>
                                </div>
                            </div>
                            {anomalies.length === 0 ? (
                                <p className="text-sm text-[#6e7a72]">Aucune activité inhabituelle détectée sur la période.</p>
                            ) : (
                                <div className="space-y-2">
                                    {anomalies.map((anom, idx) => (
                                        <div key={idx} className={`flex justify-between items-center p-3 rounded-lg ${anom.anomalyType === "PIC" ? "bg-[#ddffea]/20" : "bg-[#ffdad6]/20"}`}>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-[#141e1a]">{anom.date}</span>
                                                <span className={`text-xs ${anom.anomalyType === "PIC" ? "text-[#006547]" : "text-[#ba1a1a]"}`}>
                                                    {anom.anomalyType === "PIC" ? "Pic exceptionnel" : "Creux inhabituel"}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-[#141e1a]">{currencyFormatter.format(anom.revenue)}</p>
                                                <p className="text-xs text-[#3e4943]">Moyenne: {currencyFormatter.format(anom.averageRevenue)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Email Dialog */}
                {emailDialogOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-[#141e1a]">Envoyer le rapport par email</h3>
                                <button
                                    onClick={() => setEmailDialogOpen(false)}
                                    className="text-[#3e4943] hover:text-[#141e1a]"
                                >
                                    <X size={20}/>
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-[#3e4943] mb-1">Adresse email du destinataire</label>
                                    <input
                                        autoFocus
                                        type="email"
                                        value={emailRecipient}
                                        onChange={(e) => setEmailRecipient(e.target.value)}
                                        placeholder="exemple@email.com"
                                        className="w-full bg-[#ebf6ef] border border-[#bdc9c1] rounded-lg px-4 py-2 text-[#141e1a] focus:outline-none focus:border-[#006547] focus:ring-1 focus:ring-[#006547]"
                                    />
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => setEmailDialogOpen(false)}
                                        className="px-4 py-2 rounded-lg bg-[#ebf6ef] hover:bg-[#dae5de] text-sm transition-colors text-[#141e1a]"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={sendReportEmail}
                                        disabled={!emailRecipient || emailSending}
                                        className="px-4 py-2 rounded-lg bg-[#006547] hover:bg-[#12805c] text-sm transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {emailSending ? "Envoi..." : "Envoyer"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
