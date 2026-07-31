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
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-2xl bg-white p-3
                 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md
                 active:scale-95 dark:bg-gray-900 dark:ring-gray-800"
    >
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
      <p className="line-clamp-2 text-center text-sm font-medium leading-tight text-gray-900 dark:text-white">
        {product.name}
      </p>
      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
        {currencyFormatter.format(product.sellingPrice || 0)}
      </p>
    </button>
  );
}
