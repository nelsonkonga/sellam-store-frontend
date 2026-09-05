import NumericKeypad from "./NumericKeypad";

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "XAF",
  maximumFractionDigits: 0,
});

/**
 * Clavier numérique simplifié pour saisir rapidement une quantité au clic
 * (évite d'ouvrir le clavier système, plus lent sur mobile).
 * Affiche un aperçu en temps réel du prix total = quantity * sellingPrice.
 */
export default function QuantityKeypad({ product, quantity, onQuantityChange }) {
  const numericQuantity = parseFloat(quantity) || 0;
  const total = numericQuantity * (product.sellingPrice || 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Résumé produit + aperçu du total, mis à jour en temps réel */}
      <div className="rounded-lg border border-[#bdc9c1] bg-[#ebf6ef] p-4 text-center">
        <p className="text-sm text-[#3e4943]">{product.name}</p>
        <p className="mt-1 text-3xl font-bold text-[#141e1a]">
          {quantity || "0"}
        </p>
        <p className="mt-1 text-sm font-medium text-[#006547]">
          Total : {currencyFormatter.format(total)}
        </p>
      </div>

      <NumericKeypad value={quantity} onChange={onQuantityChange} allowDecimal />
    </div>
  );
}
