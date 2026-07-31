import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { getProducts } from "../services/productService";
import { useShop } from "../context/ShopContext";
import { useProductsCache } from "../context/ProductsContext";
import SearchBar from "../components/SearchBar";
import ProductListCard from "../components/ProductListCard";
import BottomNav from "../components/BottomNav";

// Valeur spéciale représentant "toutes les catégories" dans le dropdown
const ALL_CATEGORIES = "__all__";

export default function ProductsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);

  const navigate = useNavigate();
  const { selectedShopId: shopId } = useShop();
  const { products, setProducts } = useProductsCache();

  // Charge la liste des produits de la boutique active
  useEffect(() => {
    if (!shopId) {
      navigate("/shops");
      return;
    }

    async function fetchProducts() {
      try {
        const data = await getProducts(shopId);
        setProducts(data);
      } catch (err) {
        setError("Impossible de charger les produits.");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId, navigate]);

  // Catégories distinctes présentes dans les produits, pour peupler le dropdown
  const categories = useMemo(() => {
    const set = new Set(
      products.map((p) => p.category).filter((c) => c && c.trim() !== "")
    );
    return Array.from(set).sort();
  }, [products]);

  // Filtre côté client : nom (recherche) + catégorie sélectionnée
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch = query === "" || p.name.toLowerCase().includes(query);
      const matchesCategory =
        selectedCategory === ALL_CATEGORIES || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-gray-950">
      <header className="px-5 pb-4 pt-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Produits
        </h1>
      </header>

      <main className="flex flex-col gap-3 px-5">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Rechercher un produit..."
        />

        {/* Filtre catégorie, affiché uniquement s'il y a des catégories à filtrer */}
        {categories.length > 0 && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3
                       text-base text-gray-900 shadow-sm outline-none transition
                       focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30
                       dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value={ALL_CATEGORIES}>Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        )}

        {loading && (
          <p className="mt-10 text-center text-sm text-gray-400 dark:text-gray-500">
            Chargement des produits...
          </p>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600
                       dark:bg-red-950/50 dark:text-red-400"
          >
            {error}
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <p className="mt-10 text-center text-sm text-gray-400 dark:text-gray-500">
            {products.length === 0
              ? "Aucun produit pour cette boutique."
              : "Aucun produit ne correspond à votre recherche."}
          </p>
        )}

        {!loading &&
          !error &&
          filteredProducts.map((product) => (
            <ProductListCard
              key={product.id}
              product={product}
              onClick={() => navigate(`/products/${product.id}`)}
            />
          ))}
      </main>

      {/* Bouton flottant pour créer un nouveau produit */}
      <button
        type="button"
        onClick={() => navigate("/products/new")}
        aria-label="Ajouter un produit"
        className="fixed bottom-20 right-6 flex h-14 w-14 items-center justify-center
                   rounded-full bg-emerald-500 text-white shadow-lg transition
                   hover:bg-emerald-600 active:scale-95
                   dark:bg-emerald-600 dark:hover:bg-emerald-500"
      >
        <Plus size={28} />
      </button>

      <BottomNav />
    </div>
  );
}
