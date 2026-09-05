import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Printer, Edit3, PlusSquare, CheckCircle2 } from "lucide-react";
import { getInvoice, removeInvoiceLine, addInvoiceLine, downloadInvoicePdf, applyInvoiceDiscount } from "../services/invoiceService";
import { getProducts } from "../services/productService";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";
import ErrorState from "../components/ErrorState";
import SyncStatus from "../components/SyncStatus";

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
});

export default function InvoiceDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { selectedShopId: shopId } = useShop();
    const { isManager } = useAuth(); // à exposer dans AuthContext selon ton modèle de compte ; sinon mets `true` en dur pour l'instant

    const [invoice, setInvoice] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [discountType, setDiscountType] = useState("PERCENTAGE");
    const [discountValue, setDiscountValue] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const [invoiceData, productsData] = await Promise.all([
                    getInvoice(id),
                    getProducts(shopId),
                ]);
                setInvoice(invoiceData);
                setProducts(productsData);
            } catch (err) {
                setError("Impossible de charger la facture.");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id, shopId]);

    async function handleRemoveLine(saleId) {
        if (!window.confirm("Retirer ce produit de la facture ? Le stock sera restitué.")) return;
        try {
            const updated = await removeInvoiceLine(id, saleId, true);
            setInvoice(updated);
        } catch (err) {
            setError(err.response?.data?.message || "Impossible de retirer ce produit.");
        }
    }

    async function handleAddProduct(productId, quantity) {
        try {
            const updated = await addInvoiceLine(id, productId, quantity);
            setInvoice(updated);
            setShowAddProduct(false);
        } catch (err) {
            setError(err.response?.data?.message || "Impossible d'ajouter ce produit.");
        }
    }

    async function handleApplyDiscount() {
        const numericValue = parseFloat(discountValue);
        if (!numericValue || numericValue <= 0) return;
        try {
            const updated = await applyInvoiceDiscount(id, discountType, numericValue);
            setInvoice(updated);
            setShowDiscountModal(false);
            setDiscountValue("");
        } catch (err) {
            setError(err.response?.data?.message || "Impossible d'appliquer la remise.");
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f1fcf5] text-[#141e1a] flex items-center justify-center">
                <p className="text-[#6e7a72]">Chargement...</p>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="min-h-screen bg-[#f1fcf5] text-[#141e1a] flex items-center justify-center">
                <div className="w-full max-w-lg px-5"><ErrorState title="Facture introuvable" message={error || "Cette facture n'est pas disponible."} onRetry={() => window.location.reload()} /></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f1fcf5] px-5 py-6 text-[#141e1a]">
            <header className="mx-auto mb-6 flex max-w-6xl items-center justify-between gap-3 border-b border-[#bdc9c1] pb-5">
                <div className="flex items-center gap-3"><button type="button" onClick={() => navigate(-1)} aria-label="Retour" className="flex h-10 w-10 items-center justify-center rounded-lg text-[#3e4943] hover:bg-[#dfebe4]">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#006547]">Facture / Détail</p><h1 className="font-display text-xl font-semibold">Facture <span className="font-mono">#{invoice.invoiceNumber}</span> <span className="ml-2 inline-flex items-center gap-1 rounded bg-[#ddf4ea] px-2 py-1 text-[10px] font-bold uppercase text-[#006547]"><CheckCircle2 size={13} /> {invoice.status || "VALIDATED"}</span></h1>
                    <div className="mt-1"><SyncStatus /></div></div></div>
                <div className="hidden items-end gap-6 text-right sm:flex"><div><p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#6e7a72]">Boutique</p><p className="text-sm font-semibold">Boutique active</p></div><div><p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#6e7a72]">Date</p><p className="font-mono text-xs">{new Date(invoice.createdAt).toLocaleString("fr-FR")}</p></div></div>
            </header>

            {error && (
                <div role="alert" className="mb-4 rounded-lg bg-[#ffdad6] px-4 py-3 text-sm font-medium text-[#93000a]">
                    {error}
                </div>
            )}

            <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="rounded-lg border border-[#bdc9c1] bg-white p-5 shadow-sm">
                <div className="mb-5 border-b border-dashed border-[#bdc9c1] pb-4 text-center"><h2 className="font-display text-2xl font-bold">Sellam</h2><p className="mt-1 text-sm text-[#3e4943]">Reçu de vente</p>{invoice.customerName && <p className="mt-2 text-xs text-[#6e7a72]">Client : {invoice.customerName}</p>}</div>
                {invoice.lines.map((line) => (
                    <div key={line.saleId} className="flex items-center justify-between border-b border-[#bdc9c1]/50 py-3 last:border-0">
                        <div>
                            <span>{line.productName} × {line.quantity}</span>
                            {line.discountAmount > 0 && (
                                <p className="mt-0.5 text-xs text-[#9f6300]">
                                    Remise ligne: -{currencyFormatter.format(line.discountAmount)}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                {line.discountAmount > 0 && (
                                    <span className="block text-xs text-[#6e7a72] line-through">
                                        {currencyFormatter.format(line.lineSubtotal)}
                                    </span>
                                )}
                                <span>{currencyFormatter.format(line.totalPrice)}</span>
                            </div>
                            {isManager && (
                                <button type="button" onClick={() => handleRemoveLine(line.saleId)} aria-label="Retirer" className="text-red-400 hover:text-red-300">
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                
                <div className="mt-3 flex justify-between border-t border-dashed border-[#bdc9c1] pt-3 text-sm">
                    <span>Sous-total</span>
                    <span>{currencyFormatter.format(invoice.subtotal)}</span>
                </div>
                
                {invoice.discountAmount > 0 && (
                    <div className="mt-1 flex justify-between text-sm text-[#9f6300]">
                        <span>Remise facture</span>
                        <span>-{currencyFormatter.format(invoice.discountAmount)}</span>
                    </div>
                )}
                
                <div className="mt-2 flex justify-between border-t border-[#bdc9c1] pt-3 text-lg font-bold">
                    <span>Total</span>
                    <span>{currencyFormatter.format(invoice.totalAmount)}</span>
                </div>
            </section>

            <aside className="flex h-fit flex-col gap-4">
            {isManager && (
                <div className="rounded-lg border border-[#bdc9c1] bg-white p-4">
                    <h2 className="mb-3 border-b border-[#bdc9c1] pb-2 text-xs font-bold uppercase tracking-[0.06em] text-[#3e4943]">Actions sensibles</h2><div className="flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={() => setShowAddProduct(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#bdc9c1] py-3 text-sm font-semibold hover:bg-[#ebf6ef]"
                    >
                        <PlusSquare size={16} /> Produit
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowDiscountModal(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#bdc9c1] py-3 text-sm font-semibold hover:bg-[#ebf6ef]"
                    >
                        <Plus size={16} /> Remise globale
                    </button>
                </div></div>
            )}

            <button
                type="button"
                onClick={() => downloadInvoicePdf(invoice.id).catch(e => console.error(e))}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#006547] py-3.5 font-semibold text-white transition hover:bg-[#12805c]"
            >
                <Printer size={17} /> Réimprimer
            </button>
            </aside></div>

            {showAddProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAddProduct(false)}>
                    <div onClick={(e) => e.stopPropagation()} className="max-h-[70vh] w-full max-w-sm overflow-y-auto rounded-lg border border-[#bdc9c1] bg-white p-5 text-[#141e1a] shadow-xl">
                        <h2 className="text-lg font-bold mb-4">Ajouter un produit</h2>
                        {products.map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => handleAddProduct(p.id, 1)}
                                className="flex w-full items-center justify-between py-2 border-b border-white/10 last:border-0 text-left"
                            >
                                <span>{p.name}</span>
                                <span className="text-sm text-[#6e7a72]">{currencyFormatter.format(p.sellingPrice)}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {showDiscountModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDiscountModal(false)}>
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-lg border border-[#bdc9c1] bg-white p-6 text-[#141e1a] shadow-xl">
                        <h2 className="text-lg font-bold mb-4">Remise sur la facture</h2>
                        <div className="flex gap-2 mb-4">
                            <button
                                type="button"
                                onClick={() => setDiscountType("PERCENTAGE")}
                                className={`flex-1 rounded-lg py-2 text-sm font-semibold ${discountType === "PERCENTAGE" ? "bg-[#12805c] text-white" : "bg-[#ebf6ef] text-[#3e4943]"}`}
                            >
                                Pourcentage (%)
                            </button>
                            <button
                                type="button"
                                onClick={() => setDiscountType("FIXED_AMOUNT")}
                                className={`flex-1 rounded-lg py-2 text-sm font-semibold ${discountType === "FIXED_AMOUNT" ? "bg-[#12805c] text-white" : "bg-[#ebf6ef] text-[#3e4943]"}`}
                            >
                                Montant fixe
                            </button>
                        </div>
                        <input
                            type="number"
                            value={discountValue}
                            onChange={(e) => setDiscountValue(e.target.value)}
                            placeholder={discountType === "PERCENTAGE" ? "Ex: 10" : "Ex: 500"}
                            className="mb-4 w-full rounded-lg border border-[#bdc9c1] bg-white px-4 py-3"
                        />
                        <button type="button" onClick={handleApplyDiscount} className="w-full rounded-lg bg-[#12805c] py-3.5 font-semibold text-white">
                            Appliquer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}