import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { getInvoice, removeInvoiceLine, addInvoiceLine, downloadInvoicePdf, applyInvoiceDiscount } from "../services/invoiceService";
import { getProducts } from "../services/productService";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";

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
            <div className="min-h-screen bg-section-dark text-white flex items-center justify-center">
                <p className="text-gray-400">Chargement...</p>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="min-h-screen bg-section-dark text-white flex items-center justify-center">
                <p className="text-red-400">{error || "Facture introuvable"}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-section-dark text-white px-5 py-6">
            <header className="flex items-center gap-3 mb-6">
                <button type="button" onClick={() => navigate(-1)} aria-label="Retour" className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-white/10">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-xl font-bold">{invoice.invoiceNumber}</h1>
                    <p className="text-xs text-gray-400">{invoice.status === "VALIDATED" ? "Vente validée" : invoice.status}</p>
                </div>
            </header>

            {error && (
                <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-950/50 dark:text-red-400">
                    {error}
                </div>
            )}

            <div className="rounded-xl glass p-4 mb-4">
                {invoice.lines.map((line) => (
                    <div key={line.saleId} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                        <div>
                            <span>{line.productName} × {line.quantity}</span>
                            {line.discountAmount > 0 && (
                                <p className="text-xs text-amber-400 mt-0.5">
                                    Remise ligne: -{currencyFormatter.format(line.discountAmount)}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                {line.discountAmount > 0 && (
                                    <span className="text-xs line-through text-gray-500 block">
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
                
                <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-sm">
                    <span>Sous-total</span>
                    <span>{currencyFormatter.format(invoice.subtotal)}</span>
                </div>
                
                {invoice.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-amber-400 mt-1">
                        <span>Remise facture</span>
                        <span>-{currencyFormatter.format(invoice.discountAmount)}</span>
                    </div>
                )}
                
                <div className="mt-1 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{currencyFormatter.format(invoice.totalAmount)}</span>
                </div>
            </div>

            {isManager && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                        type="button"
                        onClick={() => setShowAddProduct(true)}
                        className="flex items-center justify-center gap-2 w-full rounded-xl bg-white/10 py-3 text-sm font-medium hover:bg-white/20"
                    >
                        <Plus size={16} /> Produit
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowDiscountModal(true)}
                        className="flex items-center justify-center gap-2 w-full rounded-xl bg-white/10 py-3 text-sm font-medium hover:bg-white/20"
                    >
                        <Plus size={16} /> Remise globale
                    </button>
                </div>
            )}

            <button
                type="button"
                onClick={() => downloadInvoicePdf(invoice.id).catch(e => console.error(e))}
                className="flex items-center justify-center gap-2 w-full rounded-xl btn-gradient py-3.5 font-semibold transition"
            >
                Réimprimer
            </button>

            {showAddProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAddProduct(false)}>
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm max-h-[70vh] overflow-y-auto rounded-2xl glass-strong p-5 shadow-xl">
                        <h2 className="text-lg font-bold mb-4">Ajouter un produit</h2>
                        {products.map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => handleAddProduct(p.id, 1)}
                                className="flex w-full items-center justify-between py-2 border-b border-white/10 last:border-0 text-left"
                            >
                                <span>{p.name}</span>
                                <span className="text-sm text-gray-400">{currencyFormatter.format(p.sellingPrice)}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {showDiscountModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDiscountModal(false)}>
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl glass-strong p-6 shadow-xl">
                        <h2 className="text-lg font-bold mb-4">Remise sur la facture</h2>
                        <div className="flex gap-2 mb-4">
                            <button
                                type="button"
                                onClick={() => setDiscountType("PERCENTAGE")}
                                className={`flex-1 rounded-lg py-2 text-sm font-semibold ${discountType === "PERCENTAGE" ? "btn-gradient" : "bg-white/10"}`}
                            >
                                Pourcentage (%)
                            </button>
                            <button
                                type="button"
                                onClick={() => setDiscountType("FIXED_AMOUNT")}
                                className={`flex-1 rounded-lg py-2 text-sm font-semibold ${discountType === "FIXED_AMOUNT" ? "btn-gradient" : "bg-white/10"}`}
                            >
                                Montant fixe
                            </button>
                        </div>
                        <input
                            type="number"
                            value={discountValue}
                            onChange={(e) => setDiscountValue(e.target.value)}
                            placeholder={discountType === "PERCENTAGE" ? "Ex: 10" : "Ex: 500"}
                            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 mb-4"
                        />
                        <button type="button" onClick={handleApplyDiscount} className="w-full rounded-xl btn-gradient py-3.5 font-semibold">
                            Appliquer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}