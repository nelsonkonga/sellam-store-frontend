import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Filter, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { listInvoices } from "../services/invoiceService";
import { useShop } from "../context/ShopContext";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import SyncStatus from "../components/SyncStatus";

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
            setError("");
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

    function retryInvoices() {
        if (!shopId) return;
        setLoading(true);
        setError("");
        listInvoices(shopId).then(setInvoices).catch(() => setError("Impossible de charger l'historique des factures.")).finally(() => setLoading(false));
    }

    const filteredInvoices = invoices.filter((inv) => {
        const term = search.toLowerCase();
        return (
            inv.invoiceNumber?.toLowerCase().includes(term) ||
            inv.customerName?.toLowerCase().includes(term)
        );
    });

    return (
        <div className="min-h-screen bg-[#f1fcf5] pb-24 text-[#141e1a]">
            <header className="border-b border-[#bdc9c1] bg-[#f1fcf5] px-5 py-6 md:px-8 lg:px-10">
                <div className="mx-auto flex max-w-7xl items-end justify-between gap-4">
                <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-[#006547]">Historique</p>
                <h1 className="flex items-center gap-2 font-display text-3xl font-semibold tracking-tight">
                    <FileText className="text-[#006547]" size={28} /> Factures <span className="rounded-full bg-[#dfebe4] px-2 py-1 text-xs font-bold text-[#3e4943]">{invoices.length} total</span>
                </h1>
                <p className="mt-1 text-base text-[#3e4943]">Consultez et gérez vos ventes validées.</p></div>
                <div className="hidden md:block"><SyncStatus /></div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-5 py-6 md:px-8 lg:px-10">
                <div className="mb-5 flex gap-3 rounded-lg border border-[#bdc9c1] bg-white p-3">
                    <div className="relative flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-[#6e7a72]" />
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher par N° de facture ou nom du client..."
                        className="h-10 w-full rounded-lg border border-[#bdc9c1] bg-[#ebf6ef] py-2 pl-10 pr-4 text-sm text-[#141e1a] placeholder-[#6e7a72] focus:border-[#006547] focus:outline-none"
                    />
                    </div><button type="button" disabled className="hidden items-center gap-2 rounded-lg border border-[#bdc9c1] px-4 text-sm font-semibold text-[#3e4943] opacity-60 sm:flex"><Filter size={17} /> Filtres</button>
                </div>

                {loading ? (
                    <p className="mt-10 text-center text-sm text-[#6e7a72]">Chargement...</p>
                ) : error ? (
                    <ErrorState title="Historique indisponible" message={error} onRetry={retryInvoices} />
                ) : filteredInvoices.length === 0 ? (
                    <EmptyState title={invoices.length === 0 ? "Aucune facture" : "Aucun résultat"} message={invoices.length === 0 ? "Les ventes validées apparaîtront ici." : "Modifiez votre recherche pour retrouver une facture."} />
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-[#bdc9c1] bg-white"><table className="w-full min-w-[760px] border-collapse text-left"><thead className="border-b border-[#bdc9c1] bg-[#ebf6ef]"><tr>{["Invoice #", "Client", "Montant (FCFA)", "Marge", "Date & Heure", "Statut"].map((heading) => <th key={heading} className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.06em] text-[#3e4943]">{heading}</th>)}</tr></thead><tbody>{filteredInvoices.map((invoice) => <tr key={invoice.id} onClick={() => navigate(`/invoices/${invoice.id}`)} className="cursor-pointer border-b border-[#bdc9c1] hover:bg-[#dfebe4]"><td className="px-4 py-3 font-mono text-sm font-semibold">{invoice.invoiceNumber}</td><td className="px-4 py-3 text-sm">{invoice.customerName || "Client comptoir"}<span className="block text-xs text-[#6e7a72]">{invoice.lines?.length || 0} article(s)</span></td><td className="px-4 py-3 text-right font-mono text-sm font-semibold">{currencyFormatter.format(invoice.totalAmount)}</td><td className="px-4 py-3 text-right text-sm text-[#006547]">{invoice.totalMargin != null ? currencyFormatter.format(invoice.totalMargin) : "—"}</td><td className="px-4 py-3 text-xs text-[#3e4943]">{new Date(invoice.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</td><td className="px-4 py-3"><span className="inline-flex items-center gap-1 rounded bg-[#ddf4ea] px-2 py-1 text-xs font-semibold text-[#006547]"><CheckCircle2 size={14} /> {invoice.status || "VALIDATED"}</span></td></tr>)}</tbody><tfoot><tr className="bg-[#ebf6ef]"><td colSpan="3" className="px-4 py-3 text-xs text-[#3e4943]">Affichage de {filteredInvoices.length} facture(s)</td><td colSpan="3" className="px-4 py-3 text-right"><button type="button" disabled className="mr-1 inline-flex h-8 w-8 items-center justify-center rounded border border-[#bdc9c1] opacity-50"><ChevronLeft size={15} /></button><button type="button" disabled className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#bdc9c1] opacity-50"><ChevronRight size={15} /></button></td></tr></tfoot></table></div>
                )}
            </main>

            
        </div>
    );
}
