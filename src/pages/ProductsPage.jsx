import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, TrendingUp, Package } from "lucide-react";
import { getProducts, listTopSellingProducts } from "../services/productService";
import { useShop } from "../context/ShopContext";
import { useProductsCache } from "../context/ProductsContext";
import SearchBar from "../components/SearchBar";
import ProductListCard from "../components/ProductListCard";
import BottomNav from "../components/BottomNav";

const ALL_CATEGORIES = "__all__";

export default function ProductsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
  
  const [viewMode, setViewMode] = useState("all"); // "all" | "top"
  const [topProducts, setTopProducts] = useState([]);

  const navigate = useNavigate();
  const { selectedShopId: shopId } = useShop();
  const { products, setProducts } = useProductsCache();

  useEffect(() => {
    if (!shopId) {
      navigate("/shops");
      return;
    }

    async function fetchProducts() {
      setLoading(true);
      try {
        if (viewMode === "all") {
          const data = await getProducts(shopId);
          setProducts(data);
        } else {
          const data = await listTopSellingProducts(shopId);
          setTopProducts(data);
        }
      } catch (err) {
        setError("Impossible de charger les produits.");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId, navigate, viewMode]);

  const categories = useMemo(() => {
    const set = new Set(
      products.map((p) => p.category).filter((c) => c && c.trim() !== "")
    );
    return Array.from(set).sort();
  }, [products]);

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
    <div className="min-h-screen bg-section-alt pb-24 text-white">
      <header className="px-5 pb-4 pt-6 mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-white mb-4">
          Produits
        </h1>
        <div className="flex bg-white/5 rounded-xl p-1 gap-1">
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition ${
              viewMode === "all" ? "bg-white/10 text-white shadow-sm" : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setViewMode("all")}
          >
            <Package size={16} /> Tous
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition ${
              viewMode === "top" ? "bg-white/10 text-white shadow-sm" : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setViewMode("top")}
          >
            <TrendingUp size={16} /> Palmarès
          </button>
        </div>
      </header>

      <main className="flex flex-col gap-3 px-5 mx-auto max-w-5xl">
        {viewMode === "all" && (
          <>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Rechercher un produit..."
            />

            {categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-xl border border-white/10 glass px-4 py-3
                           text-base text-white shadow-sm outline-none transition
                           focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30
                           appearance-none"
              >
                <option value={ALL_CATEGORIES}>Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </>
        )}

        {loading && (
          <p className="mt-10 text-center text-sm text-gray-400 dark:text-gray-500">
            Chargement...
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

        {viewMode === "all" && !loading && !error && filteredProducts.length === 0 && (
          <p className="mt-10 text-center text-sm text-gray-400 dark:text-gray-500">
            {products.length === 0
              ? "Aucun produit pour cette boutique."
              : "Aucun produit ne correspond à votre recherche."}
          </p>
        )}

        {viewMode === "top" && !loading && !error && topProducts.length === 0 && (
          <p className="mt-10 text-center text-sm text-gray-400 dark:text-gray-500">
            Aucune vente enregistrée pour établir un palmarès.
          </p>
        )}

        {!loading && !error && viewMode === "all" &&
          filteredProducts.map((product) => (
            <ProductListCard
              key={product.id}
              product={product}
              onClick={() => navigate(`/products/${product.id}`)}
            />
          ))}

        {!loading && !error && viewMode === "top" &&
          topProducts.map((item, index) => (
            <div
              key={item.product.id}
              onClick={() => navigate(`/products/${item.product.id}`)}
              className="flex items-center gap-4 cursor-pointer rounded-xl glass p-4 shadow-sm hover:bg-white/5 transition"
            >
              <div className="flex-shrink-0 w-8 text-center text-brand-400 font-bold text-lg">
                #{index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-white truncate">
                  {item.product.name}
                </p>
                <p className="text-sm text-gray-400 truncate">
                  {item.product.category}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-emerald-400">
                  {item.totalSold}
                </p>
                <p className="text-xs text-gray-500 uppercase">
                  Ventes
                </p>
              </div>
            </div>
          ))}
      </main>

      <button
        type="button"
        onClick={() => navigate("/products/new")}
        aria-label="Ajouter un produit"
        className="fixed bottom-20 right-6 md:right-10 md:bottom-10 flex h-16 w-16 items-center justify-center
                   rounded-full btn-gradient text-white shadow-xl transition
                   active:scale-95 z-50 glow-purple"
      >
        <Plus size={28} />
      </button>

      <BottomNav />
    </div>
  );
}
