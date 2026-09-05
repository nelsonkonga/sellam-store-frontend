import { Package } from "lucide-react";

/**
 * Ligne représentant un produit dans la liste du dashboard.
 * Le badge de stock est rouge si stockQuantity <= alertThreshold, vert sinon.
 */
export default function ProductRow({ product }) {
  const isLowStock = product.stockQuantity <= product.alertThreshold;

  return (
    <div
      className="flex items-center justify-between gap-3 border-t border-[#bdc9c1]/40 p-3 first:border-t-0"
    >
      {product.pictureUrl ? (
        <img
          src={product.pictureUrl}
          alt={product.name}
          className="h-11 w-11 flex-shrink-0 rounded-lg object-cover
                     ring-1 ring-[#bdc9c1]"
        />
      ) : (
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#ebf6ef] text-[#6e7a72]"
        >
          <Package size={20} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[#141e1a]">
          {product.name}
        </p>
        {product.brand && (
            <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-[#6e7a72]">
            {product.brand}
          </p>
        )}
      </div>

      <span
        className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
          isLowStock
            ? "text-[#ba1a1a]"
            : "text-[#006547]"
        }`}
      >
        {product.stockQuantity}
      </span>
    </div>
  );
}
