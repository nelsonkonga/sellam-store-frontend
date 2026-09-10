import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, X, Percent, Tag } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { getProducts, getProductByBarcode } from "../services/productService";
import BarcodeScannerModal from "../components/BarcodeScannerModal";
import { saveInvoiceOfflineFirst } from "../services/salesOfflineService";
import { useShop } from "../context/ShopContext";
import SearchBar from "../components/SearchBar";
import ProductTile from "../components/ProductTile";
import QuantityKeypad from "../components/QuantityKeypad";
import { recalculateCart } from "../utils/localCartHelper";
import SyncStatus from "../components/SyncStatus";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

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

  const [customerName, setCustomerName] = useState("");
  const [validating, setValidating] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const navigate = useNavigate();
  const { selectedShopId: shopId, selectedShop } = useShop();

  useEffect(() => {
    if (!shopId) {
      navigate("/shops");
      return;
    }

    async function init() {
      try {
        const productsData = await getProducts(shopId);
        setProducts(productsData);
        // INIT LOCAL INVOICE
        setInvoice({
          id: uuidv4(),
          customerName: "",
          lines: [],
          subtotal: 0,
          discountAmount: 0,
          discountType: null,
          totalAmount: 0
        });
      } catch (err) {
        setError("Impossible de charger les produits. Vérifiez votre connexion.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [shopId, navigate]);

  const filteredProducts = products.filter((p) =>
      p.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  async function handleKeyDown(e) {
    if (e.key === "Enter" && search.trim()) {
      e.preventDefault();
      try {
        const product = await getProductByBarcode(shopId, search.trim());
        openKeypad(product);
        setSearch("");
      } catch (err) {
        // Ignorer silencieusement si c'est juste une recherche texte
      }
    }
  }

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

  function handleAddLine() {
    const numericQuantity = parseFloat(quantity);
    if (!numericQuantity || numericQuantity <= 0) {
      setConfirmError("Entrez une quantité valide.");
      return;
    }

    if (selectedProduct.stockQuantity < numericQuantity) {
      setConfirmError("Stock insuffisant.");
      return;
    }

    setConfirming(true);
    setConfirmError("");

    try {
      const newLine = {
        saleId: uuidv4(),
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: numericQuantity,
        product: selectedProduct, // for recalculation
        lineDiscountType: lineDiscountType,
        lineDiscountValue: parseFloat(lineDiscountValue) || null
      };

      const newLines = [...invoice.lines, newLine];
      const recalculated = recalculateCart(newLines, invoice.discountType, invoice.discountValue);
      setInvoice({ ...invoice, ...recalculated });

      setProducts((prev) =>
          prev.map((p) =>
              p.id === selectedProduct.id
                  ? { ...p, stockQuantity: p.stockQuantity - numericQuantity }
                  : p
          )
      );
      closeKeypad();
    } catch (err) {
      setConfirmError("Erreur locale.");
    } finally {
      setConfirming(false);
    }
  }

  function handleRemoveLine(saleId) {
    const lineToRemove = invoice.lines.find(l => l.saleId === saleId);
    if (!lineToRemove) return;

    const newLines = invoice.lines.filter(l => l.saleId !== saleId);
    const recalculated = recalculateCart(newLines, invoice.discountType, invoice.discountValue);
    setInvoice({ ...invoice, ...recalculated });

    // Restore stock locally
    setProducts((prev) =>
      prev.map((p) =>
        p.id === lineToRemove.productId
          ? { ...p, stockQuantity: p.stockQuantity + lineToRemove.quantity }
          : p
      )
    );
  }

  function handleApplyDiscount() {
    const numericValue = parseFloat(discountValue);
    if (!numericValue || numericValue <= 0) return;

    const recalculated = recalculateCart(invoice.lines, discountType, numericValue);
    setInvoice({ 
        ...invoice, 
        ...recalculated, 
        discountType, 
        discountValue: numericValue 
    });
    setShowDiscountModal(false);
    setDiscountValue("");
  }

  async function handleValidateSale() {
    if (!invoice?.lines?.length) {
      setError("Ajoutez au moins un produit avant de valider la vente.");
      return;
    }
    setValidating(true);
    setError("");
    try {
      const payload = {
        customerName: customerName.trim() ? customerName.trim() : null,
        lines: invoice.lines.map(l => ({
            productId: l.productId,
            quantity: l.quantity,
            lineDiscountAmount: l.lineDiscountValue, // In new logic, we pass value, SyncService uses discountValue
            lineDiscountType: l.lineDiscountType
        })),
        discountAmount: invoice.discountValue,
        discountType: invoice.discountType
      };

      const res = await saveInvoiceOfflineFirst(shopId, payload);

      // Si l'appareil est en ligne mais que la synchronisation avec le serveur
      // a échoué, la vente reste en attente localement (non synchronisée).
      // On prévient l'utilisateur au lieu de rediriger silencieusement comme
      // si la vente avait bien atteint le serveur.
      if (!res.offline && !res.synced) {
        setError(
          res.syncError
            ? `Vente enregistrée localement, mais la synchronisation a échoué : ${res.syncError}. Elle sera resynchronisée automatiquement dès que possible.`
            : "Vente enregistrée localement, mais la synchronisation avec le serveur a échoué. Elle sera resynchronisée automatiquement dès que possible."
        );
        setValidating(false);
        return;
      }

      navigate("/dashboard", {
        state: { 
            invoiceReady: !selectedShop?.autoPrintInvoices && !res.offline, 
            invoiceId: res.localActionId // We can't immediately print an offline invoice without real ID
        },
      });
    } catch (err) {
      setError(err.message || "Impossible de valider la vente.");
    } finally {
      setValidating(false);
    }
  }

  if (loading) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f1fcf5] text-[#141e1a]">
          <p className="text-[#6e7a72]">Préparation de la vente...</p>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-[#f1fcf5] pb-48 text-[#141e1a] lg:pb-10">
        <header className="mx-auto flex max-w-7xl items-center gap-3 border-b border-[#bdc9c1] px-5 pb-5 pt-7 md:px-8 lg:px-10">
          <button
              type="button"
              onClick={() => navigate("/dashboard")}
              aria-label="Retour"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#3e4943] hover:bg-[#dfebe4]"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#006547]">Point de vente</p>
            <h1 className="font-display text-2xl font-semibold">Nouvelle vente</h1>
            <div className="mt-1 flex items-center gap-3 text-xs text-[#6e7a72]"><SyncStatus /><span>Les ventes sont conservées localement si nécessaire</span></div>
          </div>
        </header>

        <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-5 py-6 md:px-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-10">
          {error && (
              <ErrorState title="Vente impossible" message={error} />
          )}

            {invoice && invoice.lines?.length > 0 && (
              <section className="order-2 mb-4 rounded-lg border border-[#bdc9c1] bg-white p-4 lg:order-2 lg:col-start-2 lg:row-span-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold text-[#141e1a]">Panier</h2>
                  <button
                      type="button"
                      onClick={() => setShowDiscountModal(true)}
                      className="flex items-center gap-1 text-xs font-medium text-[#006547] hover:underline"
                  >
                    <Percent size={14} /> Remise facture
                  </button>
                </div>
                {invoice.lines.map((line) => (
                    <div key={line.saleId} className="flex items-center justify-between py-1.5 text-sm">
                      <span className="text-sm text-[#141e1a]">{line.productName} × {line.quantity}</span>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          {line.discountAmount > 0 && (
                            <span className="mr-1 text-xs text-[#6e7a72] line-through">
                              {currencyFormatter.format(line.lineSubtotal)}
                            </span>
                          )}
                          <span className="font-mono text-sm font-semibold">{currencyFormatter.format(line.totalPrice)}</span>
                          {line.discountAmount > 0 && (
                            <p className="text-xs text-[#9f6300]">-{currencyFormatter.format(line.discountAmount)}</p>
                          )}
                        </div>
                        <button type="button" onClick={() => handleRemoveLine(line.saleId)} aria-label="Retirer" className="text-[#ba1a1a] hover:text-[#93000a]">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                ))}
                <div className="mt-2 flex justify-between border-t border-[#bdc9c1] pt-3 text-sm">
                  <span>Sous-total</span>
                  <span>{currencyFormatter.format(invoice.subtotal)}</span>
                </div>
                {invoice.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-[#9f6300]">
                      <span>Remise</span>
                      <span>-{currencyFormatter.format(invoice.discountAmount)}</span>
                    </div>
                )}
                <div className="mt-2 flex justify-between border-t border-[#bdc9c1] pt-3 text-lg font-bold">
                  <span>Total</span>
                  <span>{currencyFormatter.format(invoice.totalAmount)}</span>
                </div>
              </section>
          )}

          {invoice && invoice.lines?.length === 0 && (
            <div className="lg:col-span-2"><EmptyState title="Panier vide" message="Scannez un article ou sélectionnez une tuile pour commencer la vente." /></div>
          )}

          <div className="order-1 flex items-center gap-2 border-b border-[#bdc9c1] bg-[#f1fcf5] p-4 lg:col-start-1 lg:row-start-1 lg:col-span-2">
            <div className="flex-1">
              <SearchBar value={search} onChange={setSearch} onKeyDown={handleKeyDown} placeholder="Rechercher (ou scanner code-barre)..." />
            </div>
            <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                aria-label="Scanner un code-barres"
                className="flex h-[50px] w-[50px] flex-shrink-0 items-center justify-center rounded-lg border border-[#bdc9c1] bg-white text-[#3e4943] hover:bg-[#ebf6ef]"
            >
              <Camera size={20} />
            </button>
          </div>

            {filteredProducts.length === 0 && (
              <p className="mt-10 text-center text-sm text-[#6e7a72] lg:col-start-1">Aucun produit trouvé.</p>
          )}

          <div className="order-1 mt-4 grid grid-cols-2 gap-3 lg:col-start-1 lg:row-start-2 lg:grid-cols-3 lg:col-span-2">
            {filteredProducts.map((product) => (
                <ProductTile key={product.id} product={product} onClick={() => openKeypad(product)} />
            ))}
          </div>
        </main>

        {invoice && invoice.lines?.length > 0 && (
            <div className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] left-0 right-0 z-50 border-t border-[#bdc9c1] bg-[#f1fcf5]/95 px-5 pb-4 pt-4 backdrop-blur-md lg:static lg:bottom-auto lg:col-start-2 lg:row-start-4 lg:bg-white lg:px-4">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nom du client (optionnel)"
                  className="mb-3 w-full rounded-lg border border-[#bdc9c1] bg-white px-4 py-3 text-sm text-[#141e1a] placeholder-[#6e7a72] focus:border-[#12805c] focus:outline-none"
                />
                <button
                    type="button"
                    onClick={handleValidateSale}
                    disabled={validating}
                    className="block w-full rounded-lg bg-[#006547] py-4 text-base font-bold text-white shadow-lg transition hover:bg-[#12805c] disabled:opacity-60"
                >
                  {validating ? "Validation..." : `Valider la vente — ${currencyFormatter.format(invoice.totalAmount)}`}
                </button>
              </div>
        
        )}

        {selectedProduct && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={closeKeypad}>
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex w-full max-w-sm flex-col rounded-2xl border border-[#bdc9c1] bg-white text-[#141e1a] shadow-xl"
                style={{ maxHeight: "calc(100vh - 6rem - env(safe-area-inset-bottom, 0px))" }}
              >
                <div className="flex shrink-0 items-center justify-between p-5 pb-4">
                  <h2 className="text-lg font-bold text-[#141e1a]">Quantité</h2>
                  <button type="button" onClick={closeKeypad} aria-label="Fermer" className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6e7a72] hover:bg-[#dfebe4]">
                    <X size={18} />
                  </button>
                </div>
 
                <div className="min-h-0 overflow-y-auto px-5 pb-5">
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
                    className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#006547] hover:underline"
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
                            lineDiscountType === "PERCENTAGE" ? "bg-[#12805c] text-white" : "bg-[#ebf6ef] text-[#3e4943]"
                          }`}
                        >
                          Pourcentage (%)
                        </button>
                        <button
                          type="button"
                          onClick={() => setLineDiscountType("FIXED_AMOUNT")}
                          className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                            lineDiscountType === "FIXED_AMOUNT" ? "bg-[#12805c] text-white" : "bg-[#ebf6ef] text-[#3e4943]"
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
                      <div role="alert" className="mt-4 rounded-lg bg-[#ffdad6] px-4 py-3 text-sm font-medium text-[#93000a]">
                        {confirmError}
                      </div>
                  )}
                  <button type="button" onClick={handleAddLine} disabled={confirming} className="mt-4 w-full rounded-lg bg-[#12805c] py-4 text-base font-bold text-white disabled:opacity-60">
                    {confirming ? "Ajout..." : "Ajouter au panier"}
                  </button>
                </div>
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
                    autoFocus
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

        <BarcodeScannerModal
            isOpen={isScannerOpen}
            onClose={() => setIsScannerOpen(false)}
            shopId={shopId}
            onProductFound={openKeypad}
        />
      </div>
  );
}