import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, X, Percent, Tag } from "lucide-react";
import { getProducts } from "../services/productService";
import {
  createInvoice,
  addInvoiceLine,
  removeInvoiceLine,
  applyInvoiceDiscount,
  validateInvoice,
  downloadInvoicePdf,
} from "../services/invoiceService";
import { useShop } from "../context/ShopContext";
import SearchBar from "../components/SearchBar";
import ProductTile from "../components/ProductTile";
import QuantityKeypad from "../components/QuantityKeypad";

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "XAF",
  maximumFractionDigits: 0,
});

export default function NewSalePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [invoice, setInvoice] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  // Remise par ligne
  const [showLineDiscount, setShowLineDiscount] = useState(false);
  const [lineDiscountType, setLineDiscountType] = useState(null);
  const [lineDiscountValue, setLineDiscountValue] = useState("");

  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");

  const [validating, setValidating] = useState(false);
  const [showScannerPlaceholder, setShowScannerPlaceholder] = useState(false);

  const navigate = useNavigate();
  const { selectedShopId: shopId, selectedShop } = useShop();

  useEffect(() => {
    if (!shopId) {
      navigate("/shops");
      return;
    }

    async function init() {
      try {
        const [productsData, newInvoice] = await Promise.all([
          getProducts(shopId),
          createInvoice(shopId),
        ]);
        setProducts(productsData);
        setInvoice(newInvoice);
      } catch (err) {
        setError("Impossible de démarrer la vente. Vérifiez votre connexion.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [shopId, navigate]);

  const filteredProducts = products.filter((p) =>
      p.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  function openKeypad(product) {
    setSelectedProduct(product);
    setQuantity("");
    setConfirmError("");
  }

  function closeKeypad() {
    setSelectedProduct(null);
    setQuantity("");
    setConfirmError("");
    setShowLineDiscount(false);
    setLineDiscountType(null);
    setLineDiscountValue("");
  }

  async function handleAddLine() {
    const numericQuantity = parseFloat(quantity);
    if (!numericQuantity || numericQuantity <= 0) {
      setConfirmError("Entrez une quantité valide.");
      return;
    }

    setConfirming(true);
    setConfirmError("");

    try {
      const updatedInvoice = await addInvoiceLine(
        invoice.id, selectedProduct.id, numericQuantity,
        lineDiscountType, parseFloat(lineDiscountValue) || null
      );
      setInvoice(updatedInvoice);

      setProducts((prev) =>
          prev.map((p) =>
              p.id === selectedProduct.id
                  ? { ...p, stockQuantity: p.stockQuantity - numericQuantity }
                  : p
          )
      );

      closeKeypad();
    } catch (err) {
      setConfirmError(err.response?.data?.message || "Impossible d'ajouter ce produit. Réessayez.");
    } finally {
      setConfirming(false);
    }
  }

  async function handleRemoveLine(saleId) {
    try {
      const updatedInvoice = await removeInvoiceLine(invoice.id, saleId, false);
      setInvoice(updatedInvoice);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de retirer cette ligne.");
    }
  }

  async function handleApplyDiscount() {
    const numericValue = parseFloat(discountValue);
    if (!numericValue || numericValue <= 0) return;

    try {
      const updatedInvoice = await applyInvoiceDiscount(invoice.id, discountType, numericValue);
      setInvoice(updatedInvoice);
      setShowDiscountModal(false);
      setDiscountValue("");
    } catch (err) {
      setError(err.response?.data?.message || "Impossible d'appliquer la remise.");
    }
  }

  async function handleValidateSale() {
    setValidating(true);
    try {
      const finalInvoice = await validateInvoice(invoice.id);
      if (selectedShop?.autoPrintInvoices) {
        downloadInvoicePdf(finalInvoice.id).catch(err => console.error("Erreur PDF:", err));
      }
      navigate("/dashboard", {
        state: { invoiceReady: !selectedShop?.autoPrintInvoices, invoiceId: finalInvoice.id },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de valider la vente.");
    } finally {
      setValidating(false);
    }
  }

  if (loading) {
    return (
        <div className="min-h-screen bg-section-dark text-white flex items-center justify-center">
          <p className="text-gray-400">Préparation de la vente...</p>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-section-dark text-white pb-32">
        <header className="flex items-center gap-3 px-5 pb-4 pt-6 mx-auto max-w-5xl">
          <button
              type="button"
              onClick={() => navigate("/dashboard")}
              aria-label="Retour"
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-white/10"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Nouvelle vente</h1>
            {invoice && <p className="text-xs text-gray-400">Facture {invoice.invoiceNumber}</p>}
          </div>
        </header>

        <main className="px-5 mx-auto max-w-5xl">
          {error && (
              <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-950/50 dark:text-red-400">
                {error}
              </div>
          )}

          {invoice && invoice.lines?.length > 0 && (
              <div className="mb-4 rounded-xl glass p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-gray-300">Panier</h2>
                  <button
                      type="button"
                      onClick={() => setShowDiscountModal(true)}
                      className="flex items-center gap-1 text-xs font-medium text-brand-400 hover:underline"
                  >
                    <Percent size={14} /> Remise facture
                  </button>
                </div>
                {invoice.lines.map((line) => (
                    <div key={line.saleId} className="flex items-center justify-between py-1.5 text-sm">
                      <span>{line.productName} × {line.quantity}</span>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          {line.discountAmount > 0 && (
                            <span className="text-xs line-through text-gray-500 mr-1">
                              {currencyFormatter.format(line.lineSubtotal)}
                            </span>
                          )}
                          <span>{currencyFormatter.format(line.totalPrice)}</span>
                          {line.discountAmount > 0 && (
                            <p className="text-xs text-amber-400">-{currencyFormatter.format(line.discountAmount)}</p>
                          )}
                        </div>
                        <button type="button" onClick={() => handleRemoveLine(line.saleId)} aria-label="Retirer" className="text-red-400 hover:text-red-300">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                ))}
                <div className="mt-2 pt-2 border-t border-white/10 flex justify-between text-sm">
                  <span>Sous-total</span>
                  <span>{currencyFormatter.format(invoice.subtotal)}</span>
                </div>
                {invoice.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-amber-400">
                      <span>Remise</span>
                      <span>-{currencyFormatter.format(invoice.discountAmount)}</span>
                    </div>
                )}
                <div className="flex justify-between text-base font-bold mt-1">
                  <span>Total</span>
                  <span>{currencyFormatter.format(invoice.totalAmount)}</span>
                </div>
              </div>
          )}

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un produit..." />
            </div>
            <button
                type="button"
                onClick={() => setShowScannerPlaceholder(true)}
                aria-label="Scanner un code-barres"
                className="flex h-[50px] w-[50px] flex-shrink-0 items-center justify-center rounded-xl glass text-gray-400 hover:bg-white/10"
            >
              <Camera size={20} />
            </button>
          </div>

          {filteredProducts.length === 0 && (
              <p className="mt-10 text-center text-sm text-gray-400">Aucun produit trouvé.</p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
                <ProductTile key={product.id} product={product} onClick={() => openKeypad(product)} />
            ))}
          </div>
        </main>

        {invoice && invoice.lines?.length > 0 && (
            <div className="fixed bottom-20 left-0 right-0 px-5">
              <button
                  type="button"
                  onClick={handleValidateSale}
                  disabled={validating}
                  className="mx-auto max-w-5xl w-full rounded-xl btn-gradient py-4 text-base font-bold shadow-lg disabled:opacity-60"
              >
                {validating ? "Validation..." : `Valider la vente — ${currencyFormatter.format(invoice.totalAmount)}`}
              </button>
            </div>
        )}

        {selectedProduct && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={closeKeypad}>
              <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-t-2xl glass-strong p-5 shadow-xl sm:rounded-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">Quantité</h2>
                  <button type="button" onClick={closeKeypad} aria-label="Fermer" className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-white/10">
                    <X size={18} />
                  </button>
                </div>
                <QuantityKeypad product={selectedProduct} quantity={quantity} onQuantityChange={setQuantity} />

                {/* Remise par ligne (optionnelle) */}
                <button
                  type="button"
                  onClick={() => {
                    setShowLineDiscount(!showLineDiscount);
                    if (showLineDiscount) {
                      setLineDiscountType(null);
                      setLineDiscountValue("");
                    }
                  }}
                  className="mt-3 flex items-center gap-1.5 text-xs font-medium text-brand-400 hover:underline"
                >
                  <Tag size={14} />
                  {showLineDiscount ? "Annuler la remise" : "Ajouter une remise"}
                </button>

                {showLineDiscount && (
                  <div className="mt-2 rounded-xl bg-white/5 border border-white/10 p-3">
                    <div className="flex gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => setLineDiscountType("PERCENTAGE")}
                        className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                          lineDiscountType === "PERCENTAGE" ? "btn-gradient" : "bg-white/10"
                        }`}
                      >
                        Pourcentage (%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setLineDiscountType("FIXED_AMOUNT")}
                        className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                          lineDiscountType === "FIXED_AMOUNT" ? "btn-gradient" : "bg-white/10"
                        }`}
                      >
                        Montant fixe
                      </button>
                    </div>
                    <input
                      type="number"
                      value={lineDiscountValue}
                      onChange={(e) => setLineDiscountValue(e.target.value)}
                      placeholder={lineDiscountType === "PERCENTAGE" ? "Ex: 10" : "Ex: 500"}
                      className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm"
                    />
                  </div>
                )}

                {confirmError && (
                    <div role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-950/50 dark:text-red-400">
                      {confirmError}
                    </div>
                )}
                <button type="button" onClick={handleAddLine} disabled={confirming} className="mt-4 w-full rounded-xl btn-gradient py-4 text-base font-bold disabled:opacity-60">
                  {confirming ? "Ajout..." : "Ajouter au panier"}
                </button>
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

        {showScannerPlaceholder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowScannerPlaceholder(false)}>
              <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl glass-strong p-6 text-center shadow-xl">
                <Camera className="mx-auto mb-3 text-gray-400" size={40} />
                <p className="font-semibold text-white">Scanner un code-barres</p>
                <p className="mt-1 text-sm text-gray-300">Fonctionnalité à venir</p>
                <button type="button" onClick={() => setShowScannerPlaceholder(false)} className="mt-4 w-full rounded-xl bg-white/10 py-3 text-sm font-medium hover:bg-white/20">
                  Fermer
                </button>
              </div>
            </div>
        )}
      </div>
  );
}