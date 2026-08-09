import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText } from "lucide-react";
import { listInvoices } from "../services/invoiceService";
import { useShop } from "../context/ShopContext";
import BottomNav from "../components/BottomNav";

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
});

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { selectedShopId: shopId } = useShop();

    useEffect(() => {
        if (!shopId) {
            navigate("/shops");
            return;
        }

        async function fetchInvoices() {
            try {
                const data = await listInvoices(shopId);
                setInvoices(data);
            } catch (err) {
                setError("Impossible de charger l'historique des factures.");
            } finally {
                setLoading(false);
            }
        }
        fetchInvoices();
    }, [shopId, navigate]);

    const filteredInvoices = invoices.filter((inv) => {
        const term = search.toLowerCase();
        return (
            inv.invoiceNumber?.toLowerCase().includes(term) ||
            inv.customerName?.toLowerCase().includes(term)
        );
    });

    return (
        <div className="min-h-screen bg-section-dark pb-24 text-white">
            <header className="px-5 pt-8 pb-4">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <FileText className="text-brand-400" />
                    Toutes les factures
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                    Retrouvez l'historique complet de vos ventes validées.
                </p>
            </header>

            <main className="px-5 mx-auto max-w-5xl">
                <div className="relative mb-6">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher par N° de facture ou nom du client..."
                        className="w-full rounded-xl border border-white/10 glass py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none"
                    />
                </div>

                {loading ? (
                    <p className="text-center text-sm text-gray-400 mt-10">Chargement...</p>
                ) : error ? (
                    <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-950/50 dark:text-red-400">
                        {error}
                    </div>
                ) : filteredInvoices.length === 0 ? (
                    <p className="text-center text-sm text-gray-500 mt-10">
                        Aucune facture ne correspond à votre recherche.
                    </p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filteredInvoices.map((invoice) => (
                            <div
                                key={invoice.id}
                                onClick={() => navigate(`/invoices/${invoice.id}`)}
                                className="flex cursor-pointer flex-col justify-center rounded-xl glass p-4 shadow-sm hover:bg-white/5 transition"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="text-base font-bold text-white">
                                            {invoice.invoiceNumber}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(invoice.createdAt).toLocaleString("fr-FR", {
                                                dateStyle: "long",
                                                timeStyle: "short",
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-base font-bold text-emerald-400">
                                            {currencyFormatter.format(invoice.totalAmount)}
                                        </p>
                                        <p className="text-xs font-medium text-gray-400">
                                            {invoice.lines?.length || 0} article(s)
                                        </p>
                                    </div>
                                </div>
                                {invoice.customerName && (
                                    <div className="text-xs text-gray-300 mt-1">
                                        Client : <span className="font-medium text-white">{invoice.customerName}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
