import { Package } from "lucide-react";

// Formatteur de montant, cohérent avec le reste de l'app
const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "XAF",
  maximumFractionDigits: 0,
});

/**
 * Carte cliquable représentant un produit dans la liste /products.
 * Le clic est géré par le parent (navigation vers /products/:id).
 */
export default function ProductListCard({ product, onClick }) {
  const isLowStock = product.stockQuantity <= product.alertThreshold;

  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer items-center gap-3 rounded-2xl glass p-3
                 shadow-sm transition hover:shadow-md
                 active:scale-[0.99]"
    >
      {product.pictureUrl ? (
        <img
          src={product.pictureUrl}
          alt={product.name}
          className="h-14 w-14 flex-shrink-0 rounded-xl object-cover
                     ring-1 ring-gray-100 dark:ring-gray-800"
        />
      ) : (
        <div
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center
                     rounded-xl bg-white/5 text-gray-400"
        >
          <Package size={22} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-white flex items-center gap-2">
          {product.name}
          {product.brand && (
            <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] uppercase tracking-wider text-gray-300">
              {product.brand}
            </span>
          )}
        </p>
        <p className="text-sm text-brand-400">
          {currencyFormatter.format(product.sellingPrice || 0)}
        </p>
      </div>

      <span
        className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
          isLowStock
            ? "bg-red-500/10 text-red-500"
            : "bg-brand-500/10 text-brand-400"
        }`}
      >
        {product.stockQuantity}
      </span>
    </div>
  );
}
