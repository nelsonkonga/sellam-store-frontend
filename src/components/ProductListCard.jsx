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
      className="flex cursor-pointer items-center gap-3 border-b border-[#bdc9c1] bg-white p-3
                 transition hover:bg-[#dfebe4] active:scale-[0.99]"
    >
      {product.pictureUrl ? (
        <img
          src={product.pictureUrl}
          alt={product.name}
          className="h-14 w-14 flex-shrink-0 rounded-xl object-cover
                     ring-1 ring-[#bdc9c1]"
        />
      ) : (
        <div
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center
                     rounded-lg bg-[#dae5de] text-[#6e7a72]"
        >
          <Package size={22} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 truncate text-sm font-semibold text-[#141e1a]">
          {product.name}
          {product.brand && (
            <span className="rounded bg-[#dae5de] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-[#3e4943]">
              {product.brand}
            </span>
          )}
        </p>
        <p className="text-sm text-[#006547]">
          {currencyFormatter.format(product.sellingPrice || 0)}
        </p>
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
