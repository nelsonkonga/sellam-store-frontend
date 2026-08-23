import { Package } from "lucide-react";

/**
 * Ligne représentant un produit dans la liste du dashboard.
 * Le badge de stock est rouge si stockQuantity <= alertThreshold, vert sinon.
 */
export default function ProductRow({ product }) {
  const isLowStock = product.stockQuantity <= product.alertThreshold;

  return (
    <div
      className="flex items-center gap-3 rounded-xl glass p-3 shadow-sm"
    >
      {product.pictureUrl ? (
        <img
          src={product.pictureUrl}
          alt={product.name}
          className="h-11 w-11 flex-shrink-0 rounded-lg object-cover
                     ring-1 ring-gray-100 dark:ring-gray-800"
        />
      ) : (
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center
                     rounded-lg bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
        >
          <Package size={20} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900 dark:text-white">
          {product.name}
        </p>
        {product.brand && (
          <p className="truncate text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
            {product.brand}
          </p>
        )}
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
