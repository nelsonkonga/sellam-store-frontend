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
      className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white p-3
                 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md
                 active:scale-[0.99] dark:bg-gray-900 dark:ring-gray-800"
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
                     rounded-xl bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
        >
          <Package size={22} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-gray-900 dark:text-white">
          {product.name}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {currencyFormatter.format(product.sellingPrice || 0)}
        </p>
      </div>

      <span
        className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
          isLowStock
            ? "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400"
            : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
        }`}
      >
        {product.stockQuantity}
      </span>
    </div>
  );
}
