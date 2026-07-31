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
      <div className="rounded-2xl bg-emerald-50 p-4 text-center dark:bg-emerald-950/30">
        <p className="text-sm text-gray-600 dark:text-gray-400">{product.name}</p>
        <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
          {quantity || "0"}
        </p>
        <p className="mt-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          Total : {currencyFormatter.format(total)}
        </p>
      </div>

      <NumericKeypad value={quantity} onChange={onQuantityChange} allowDecimal />
    </div>
  );
}
