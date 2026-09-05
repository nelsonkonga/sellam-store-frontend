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
    ? "bg-[#ffe8d1] text-[#9f6300] border border-[#ffddb9]"
    : "bg-[#ddf4ea] text-[#006547] border border-[#79d9ae]";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col items-center gap-2 overflow-hidden rounded border border-[#bdc9c1] bg-white p-3
             transition hover:bg-[#ebf6ef] hover:shadow-sm active:scale-95"
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
            className="flex h-20 w-full items-center justify-center rounded bg-[#dae5de] text-[#6e7a72]"
        >
          <Package size={26} />
        </div>
      )}
      <div className="w-full text-center">
        <p className="line-clamp-2 text-sm font-semibold leading-tight text-[#141e1a]">
          {product.name}
        </p>
        {product.brand && (
          <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-wider text-[#6e7a72]">
            {product.brand}
          </p>
        )}
      </div>
      <p className="font-mono text-sm font-semibold text-[#006547]">
        {currencyFormatter.format(product.sellingPrice || 0)}
      </p>
    </button>
  );
}
