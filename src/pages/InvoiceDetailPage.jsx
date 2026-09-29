import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock, Trash2, PlusSquare, Plus, Printer, Minus } from "lucide-react";
import { getInvoice, addInvoiceLine, removeInvoiceLine, applyInvoiceDiscount, modifyLineQuantity, downloadInvoicePdf } from "../services/invoiceService";
import { getProducts } from "../services/productService";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import { getPendingInvoiceById, addPendingInvoiceLine, removePendingInvoiceLine, updatePendingInvoiceQuantity, updatePendingInvoiceDiscount } from "../hooks/usePendingInvoices";
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

    const isPending = id?.startsWith("pending-");

    const [invoice, setInvoice] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [addQuantity, setAddQuantity] = useState(1);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [discountType, setDiscountType] = useState("PERCENTAGE");
    const [discountValue, setDiscountValue] = useState("");
    // Édition inline de la quantité d'une ligne existante : { saleId, value }
    const [editingLine, setEditingLine] = useState(null);

    useEffect(() => {
        async function load() {
            setError("");
            try {
                if (isPending) {
                    // Facture créée hors ligne, pas encore synchronisée : on la lit
                    // depuis Dexie plutôt que d'appeler une API qui ne la connaît pas
                    // encore. Les produits viennent aussi du cache local préchargé.
                    const [invoiceData, productsData] = await Promise.all([
                        getPendingInvoiceById(id),
                        getProducts(shopId),
                    ]);
                    if (!invoiceData) {
                        setError("Cette facture en attente n'est plus disponible (déjà synchronisée ?).");
                    } else {
                        setInvoice(invoiceData);
                    }
                    setProducts(productsData);
                } else {
                    const [invoiceData, productsData] = await Promise.all([
                        getInvoice(id),
                        getProducts(shopId),
                    ]);
                    setInvoice(invoiceData);
                    setProducts(productsData);
                }
            } catch (err) {
                setError("Impossible de charger la facture.");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id, shopId, isPending]);

    async function refreshInvoice() {
        if (isPending) {
            const invoiceData = await getPendingInvoiceById(id);
            setInvoice(invoiceData);
        } else {
            const invoiceData = await getInvoice(id);
            setInvoice(invoiceData);
        }
    }

    async function handleRemoveLine(saleId) {
        if (!window.confirm("Retirer ce produit de la facture ? Le stock sera restitué.")) return;
        try {
            if (isPending) {
                const line = invoice.lines.find((item) => item.saleId === saleId);
                if (!line) return;
                setInvoice(await removePendingInvoiceLine(id, line.productId, line.quantity));
                return;
            }
            const updated = await removeInvoiceLine(id, saleId, true);
            setInvoice(updated);
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Impossible de retirer ce produit.");
        }
    }

    function openAddProduct() {
        setSelectedProductId(null);
        setAddQuantity(1);
        setShowAddProduct(true);
    }

    async function handleAddProduct() {
        if (!selectedProductId || addQuantity < 1) return;
        try {
            if (isPending) {
                setInvoice(await addPendingInvoiceLine(id, selectedProductId, addQuantity));
                setShowAddProduct(false);
                return;
            }
            const updated = await addInvoiceLine(id, selectedProductId, addQuantity);
            setInvoice(updated);
            setShowAddProduct(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Impossible d'ajouter ce produit.");
        }
    }

    function startEditQuantity(line) {
        if (!isManager) return;
        setEditingLine({ saleId: line.saleId, value: String(line.quantity) });
    }

    async function commitEditQuantity() {
        if (!editingLine) return;
        const newQuantity = parseInt(editingLine.value, 10);
        const saleId = editingLine.saleId;
        setEditingLine(null);
        if (!Number.isFinite(newQuantity) || newQuantity < 1) return;
        try {
            if (isPending) {
                const line = invoice.lines.find((item) => item.saleId === saleId);
                if (!line) return;
                setInvoice(await updatePendingInvoiceQuantity(id, line.productId, newQuantity));
                return;
            }
            const updated = await modifyLineQuantity(id, saleId, newQuantity);
            setInvoice(updated);
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Impossible de modifier la quantité.");
        }
    }

    function printPendingInvoice() {
        const rows = (invoice.lines || []).map((line) => `<tr><td>${line.productName}</td><td>${line.quantity}</td><td>${line.totalPrice}</td></tr>`).join("");
        const popup = window.open("", "_blank", "noopener,noreferrer");
        if (!popup) {
            setError("Autorisez les fenêtres pour imprimer cette facture.");
            return;
        }
        popup.document.write(`<html><head><title>Facture</title></head><body><h1>Facture en attente</h1><p>${invoice.customerName || "Client comptoir"}</p><table>${rows}</table><p>Total : ${invoice.totalAmount}</p></body></html>`);
        popup.document.close();
        popup.focus();
        popup.print();
    }

    async function handleApplyDiscount() {
        const numericValue = parseFloat(discountValue);
        if (!numericValue || numericValue <= 0) {
            setError("Indiquez un montant de remise supérieur à zéro.");
            return;
        }
        try {
            if (isPending) {
                setInvoice(await updatePendingInvoiceDiscount(id, discountType, numericValue));
                setShowDiscountModal(false);
                setDiscountValue("");
                return;
            }
            const updated = await applyInvoiceDiscount(id, discountType, numericValue);
            setInvoice(updated);
            setShowDiscountModal(false);
            setDiscountValue("");
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Impossible d'appliquer la remise.");
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

    const selectedProduct = products.find((p) => p.id === selectedProductId);

    return (
        <div className="min-h-screen bg-[#f1fcf5] px-5 py-6 text-[#141e1a]">
            <header className="mx-auto mb-6 flex max-w-6xl items-center justify-between gap-3 border-b border-[#bdc9c1] pb-5">
                <div className="flex items-center gap-3"><button type="button" onClick={() => navigate(-1)} aria-label="Retour" className="flex h-10 w-10 items-center justify-center rounded-lg text-[#3e4943] hover:bg-[#dfebe4]">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#006547]">Facture / Détail</p><h1 className="font-display text-xl font-semibold">Facture <span className="font-mono">#{invoice.invoiceNumber}</span> {isPending ? <span className="ml-2 inline-flex items-center gap-1 rounded bg-[#fdf0dc] px-2 py-1 text-[10px] font-bold uppercase text-[#9f6300]"><Clock size={13} /> En attente de sync</span> : <span className="ml-2 inline-flex items-center gap-1 rounded bg-[#ddf4ea] px-2 py-1 text-[10px] font-bold uppercase text-[#006547]"><CheckCircle2 size={13} /> {invoice.status || "VALIDATED"}</span>}</h1>
                    <div className="mt-1"><SyncStatus /></div></div></div>
                <div className="hidden items-end gap-6 text-right sm:flex"><div><p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#6e7a72]">Boutique</p><p className="text-sm font-semibold">Boutique active</p></div><div><p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#6e7a72]">Date</p><p className="font-mono text-xs">{new Date(invoice.createdAt).toLocaleString("fr-FR")}</p></div></div>
            </header>

            {isPending && (
                <div className="mx-auto mb-4 max-w-6xl rounded-lg bg-[#fdf0dc] px-4 py-3 text-sm font-medium text-[#9f6300]">
                    Cette facture a été créée hors ligne et sera synchronisée automatiquement dès le retour de la connexion. Son numéro définitif sera attribué à ce moment-là.
                </div>
            )}

            {error && (
                <div role="alert" className="mx-auto mb-4 max-w-6xl rounded-lg bg-[#ffdad6] px-4 py-3 text-sm font-medium text-[#93000a]">
                    {error}
                </div>
            )}

            <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="rounded-lg border border-[#bdc9c1] bg-white p-5 shadow-sm">
                <div className="mb-5 border-b border-dashed border-[#bdc9c1] pb-4 text-center"><h2 className="font-display text-2xl font-bold">Sellam</h2><p className="mt-1 text-sm text-[#3e4943]">Reçu de vente</p>{invoice.customerName && <p className="mt-2 text-xs text-[#6e7a72]">Client : {invoice.customerName}</p>}</div>
                {invoice.lines.map((line) => (
                    <div key={line.saleId} className="flex items-center justify-between border-b border-[#bdc9c1]/50 py-3 last:border-0">
                        <div>
                            {editingLine?.saleId === line.saleId ? (
                                <span className="inline-flex items-center gap-2">
                                    {line.productName} ×
                                    <input
                                        type="number"
                                        min="1"
                                        autoFocus
                                        value={editingLine.value}
                                        onChange={(e) => setEditingLine({ saleId: line.saleId, value: e.target.value })}
                                        onBlur={commitEditQuantity}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") commitEditQuantity();
                                            if (e.key === "Escape") setEditingLine(null);
                                        }}
                                        className="w-16 rounded border border-[#006547] px-2 py-0.5 text-center"
                                    />
                                </span>
                            ) : (
                                <span
                                    onClick={() => startEditQuantity(line)}
                                    className={isManager ? "cursor-pointer underline decoration-dotted underline-offset-2" : ""}
                                    title={isManager ? "Cliquer pour modifier la quantité" : undefined}
                                >
                                    {line.productName} × {line.quantity}
                                </span>
                            )}
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
                        onClick={openAddProduct}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#bdc9c1] py-3 text-sm font-semibold hover:bg-[#ebf6ef] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <PlusSquare size={16} /> Produit
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowDiscountModal(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#bdc9c1] py-3 text-sm font-semibold hover:bg-[#ebf6ef] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Plus size={16} /> Remise globale
                    </button>
                </div></div>
            )}

            <button
                type="button"
                onClick={() => {
                    if (isPending) {
                        printPendingInvoice();
                        return;
                    }
                    downloadInvoicePdf(invoice.id).catch(() => setError("Impossible de générer le PDF. Réessayez."));
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#006547] py-3.5 font-semibold text-white transition hover:bg-[#12805c] disabled:cursor-not-allowed disabled:opacity-50"
            >
                <Printer size={17} /> Réimprimer
            </button>
            </aside></div>

            {showAddProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAddProduct(false)}>
                    <div onClick={(e) => e.stopPropagation()} className="max-h-[70vh] w-full max-w-sm overflow-y-auto rounded-lg border border-[#bdc9c1] bg-white p-5 text-[#141e1a] shadow-xl">
                        <h2 className="text-lg font-bold mb-4">Ajouter un produit</h2>
                        {selectedProductId ? (
                            <div>
                                <button type="button" onClick={() => setSelectedProductId(null)} className="mb-3 text-sm text-[#006547] underline">
                                    ← Choisir un autre produit
                                </button>
                                <p className="mb-1 font-semibold">{selectedProduct?.name}</p>
                                <p className="mb-4 text-sm text-[#6e7a72]">{currencyFormatter.format(selectedProduct?.sellingPrice || 0)} / unité</p>
                                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.06em] text-[#3e4943]">Quantité</label>
                                <div className="mb-4 flex items-center gap-2">
                                    <button type="button" onClick={() => setAddQuantity((q) => Math.max(1, q - 1))} className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#bdc9c1] hover:bg-[#ebf6ef]">
                                        <Minus size={16} />
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        value={addQuantity}
                                        onChange={(e) => setAddQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                                        className="h-10 w-full rounded-lg border border-[#bdc9c1] text-center"
                                    />
                                    <button type="button" onClick={() => setAddQuantity((q) => q + 1)} className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#bdc9c1] hover:bg-[#ebf6ef]">
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <button type="button" onClick={handleAddProduct} className="w-full rounded-lg bg-[#12805c] py-3 font-semibold text-white">
                                    Ajouter {addQuantity} × {selectedProduct?.name}
                                </button>
                            </div>
                        ) : (
                            products.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => { setSelectedProductId(p.id); setAddQuantity(1); }}
                                    className="flex w-full items-center justify-between py-2 border-b border-white/10 last:border-0 text-left"
                                >
                                    <span>{p.name}</span>
                                    <span className="text-sm text-[#6e7a72]">{currencyFormatter.format(p.sellingPrice)}</span>
                                </button>
                            ))
                        )}
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