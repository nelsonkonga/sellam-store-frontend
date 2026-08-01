import { Package } from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "XAF",
  maximumFractionDigits: 0,
});

/**
 * Gros bouton carré représentant un produit dans la grille de vente rapide.
 * Pensé pour être tapé vite, sans lire de texte fin : image large, prix bien visible.
 */
export default function ProductTile({ product, onClick }) {
  const isLowStock = product.stockQuantity <= product.alertThreshold;
  const badgeColor = isLowStock
    ? "bg-red-500/10 text-red-500 border border-red-500/20"
    : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex flex-col items-center gap-2 rounded-2xl glass p-3
                 shadow-sm transition hover:shadow-md
                 active:scale-95"
    >
      {/* Badge de stock */}
      <span
        className={`absolute top-2 right-2 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${badgeColor}`}
      >
        {product.stockQuantity} {product.saleTypeUnitLabel || ""}
      </span>
      {product.pictureUrl ? (
        <img
          src={product.pictureUrl}
          alt={product.name}
          className="h-16 w-16 rounded-xl object-cover"
        />
      ) : (
        <div
          className="flex h-16 w-16 items-center justify-center rounded-xl
                     bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
        >
          <Package size={26} />
        </div>
      )}
      <p className="line-clamp-2 text-center text-sm font-medium leading-tight text-white">
        {product.name}
      </p>
      <p className="text-sm font-semibold text-brand-400">
        {currencyFormatter.format(product.sellingPrice || 0)}
      </p>
    </button>
  );
}
