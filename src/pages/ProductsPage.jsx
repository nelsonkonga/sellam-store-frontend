import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, TrendingUp, Package, Search, Filter, MoreVertical, ArrowDownUp, ArrowLeft, ArrowRight } from "lucide-react";
import { getProducts, listTopSellingProducts } from "../services/productService";
import { useShop } from "../context/ShopContext";
import { useProductsCache } from "../context/ProductsContext";
import { formatQuantityWithUnit } from "../utils/formatQuantity";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

const ALL_CATEGORIES = "__all__";

export default function ProductsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
    const [stockFilter, setStockFilter] = useState("all");
    const [marginFilter, setMarginFilter] = useState("all");
  
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
      setError("");
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

  function retryLoad() {
    if (!shopId) return;
    setLoading(true);
    setError("");
    const request = viewMode === "all" ? getProducts(shopId) : listTopSellingProducts(shopId);
    request
      .then((data) => viewMode === "all" ? setProducts(data) : setTopProducts(data))
      .catch(() => setError("Impossible de charger les produits. Vérifiez votre connexion puis réessayez."))
      .finally(() => setLoading(false));
  }

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
      const isLowStock = Number(p.stockQuantity || 0) <= Number(p.alertThreshold || 0);
      const marginRate = Number(p.sellingPrice || 0) > 0
        ? ((Number(p.sellingPrice || 0) - Number(p.purchasePrice || 0)) / Number(p.sellingPrice || 0)) * 100
        : 0;
      const matchesStock = stockFilter === "all" || (stockFilter === "low" ? isLowStock : !isLowStock);
      const matchesMargin = marginFilter === "all" || (marginFilter === "high" ? marginRate > 30 : marginFilter === "medium" ? marginRate >= 15 && marginRate <= 30 : marginRate < 15);
      return matchesSearch && matchesCategory && matchesStock && matchesMargin;
    });
  }, [products, search, selectedCategory, stockFilter, marginFilter]);

  return (
    <div className="min-h-screen bg-[#f1fcf5] pb-24 text-[#141e1a]">
       <header className="sticky top-0 z-10 border-b border-[#bdc9c1] bg-[#f1fcf5]/95 px-5 py-6 backdrop-blur-sm md:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-end justify-between gap-4">
          <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-[#006547]">Catalogue</p><h1 className="font-display text-3xl font-semibold tracking-tight">Catalogue Produits</h1><p className="mt-1 text-base text-[#3e4943]">Gestion de l'inventaire et des marges.</p></div>
          <div className="hidden gap-2 sm:flex">
            <button type="button" disabled title="Import/export bientôt disponible" className="inline-flex items-center gap-2 rounded-lg border border-[#bdc9c1] px-4 py-2.5 text-sm font-semibold text-[#141e1a] opacity-60"><ArrowDownUp size={17} />Importer/Exporter</button>
            <button type="button" onClick={() => navigate("/products/new")} className="inline-flex items-center gap-2 rounded-lg bg-[#12805c] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#006547]"><Plus size={17} />Ajouter un produit</button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 md:px-8 lg:px-10">
        {viewMode === "all" && (
          <div className="flex flex-col gap-3 rounded-lg border border-[#bdc9c1] bg-white p-3 md:flex-row md:items-center">
            <Filter size={19} className="hidden text-[#3e4943] md:block" />
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6e7a72]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un produit..." className="h-10 w-full rounded-lg border border-[#bdc9c1] bg-[#ebf6ef] pl-10 pr-3 text-sm text-[#141e1a] outline-none focus:border-[#12805c]" />
            </div>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="h-10 rounded-lg border border-[#bdc9c1] bg-white px-3 text-sm text-[#141e1a]">
              <option value={ALL_CATEGORIES}>Toutes catégories</option>{categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="h-10 rounded-lg border border-[#bdc9c1] bg-white px-3 text-sm text-[#141e1a]"><option value="all">Stock : Tous</option><option value="ok">Stock OK</option><option value="low">Stock faible</option></select>
            <select value={marginFilter} onChange={(e) => setMarginFilter(e.target.value)} className="h-10 rounded-lg border border-[#bdc9c1] bg-white px-3 text-sm text-[#141e1a]"><option value="all">Marge : Toutes</option><option value="high">Haute (&gt;30%)</option><option value="medium">Moyenne (15-30%)</option><option value="low">Faible (&lt;15%)</option></select>
            <button type="button" onClick={() => { setSearch(""); setSelectedCategory(ALL_CATEGORIES); setStockFilter("all"); setMarginFilter("all"); }} className="whitespace-nowrap px-2 text-xs font-bold uppercase tracking-[0.05em] text-[#006547] hover:underline">Réinitialiser</button>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-[#bdc9c1] pb-2">
          <div className="flex gap-4"><button type="button" onClick={() => setViewMode("all")} className={`text-sm font-bold ${viewMode === "all" ? "border-b-2 border-[#006547] pb-2 text-[#006547]" : "text-[#6e7a72]"}`}><Package size={16} className="mr-1 inline" />Produits</button><button type="button" onClick={() => setViewMode("top")} className={`text-sm font-bold ${viewMode === "top" ? "border-b-2 border-[#006547] pb-2 text-[#006547]" : "text-[#6e7a72]"}`}><TrendingUp size={16} className="mr-1 inline" />Palmarès</button></div>
          <span className="text-xs text-[#6e7a72]">{viewMode === "all" ? `${filteredProducts.length} produit(s)` : `${topProducts.length} résultat(s)`}</span>
        </div>

        {loading && (
          <p className="mt-10 text-center text-sm text-[#6e7a72]">
            Chargement...
          </p>
        )}

        {!loading && error && (
          <ErrorState title="Catalogue indisponible" message={error} onRetry={retryLoad} />
        )}

        {viewMode === "all" && !loading && !error && filteredProducts.length === 0 && (
          <EmptyState
            title={products.length === 0 ? "Votre catalogue est vide" : "Aucun produit correspondant"}
            message={products.length === 0 ? "Ajoutez votre première référence pour commencer à vendre." : "Essayez une autre recherche ou réinitialisez les filtres."}
            actionLabel={products.length === 0 ? "Ajouter un produit" : undefined}
            onAction={products.length === 0 ? () => navigate("/products/new") : undefined}
          />
        )}

        {viewMode === "top" && !loading && !error && topProducts.length === 0 && (
          <EmptyState title="Pas encore de palmarès" message="Les bénéfices générés apparaîtront après vos premières ventes." />
        )}

        {!loading && !error && viewMode === "all" && filteredProducts.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-[#bdc9c1] bg-white">
            <table className="w-full min-w-[760px] border-collapse text-left"><thead className="bg-[#ebf6ef]"><tr className="border-b border-[#bdc9c1]">{["Produit", "SKU / Code", "Stock", "Prix Achat (FCFA)", "Prix Vente (FCFA)", "Marge U. (FCFA)", "Index Prof.", ""].map((heading) => <th key={heading} className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.06em] text-[#3e4943]">{heading}</th>)}</tr></thead><tbody>{filteredProducts.map((product) => { const purchase = Number(product.purchasePrice || 0); const selling = Number(product.sellingPrice || 0); const margin = selling - purchase; const rate = selling > 0 ? (margin / selling) * 100 : 0; const low = Number(product.stockQuantity || 0) <= Number(product.alertThreshold || 0); return <tr key={product.id} onClick={() => navigate(`/products/${product.id}`)} className="group cursor-pointer border-b border-[#bdc9c1] transition hover:bg-[#dfebe4]"><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded border border-[#bdc9c1] bg-[#dae5de]">{product.pictureUrl ? <img src={product.pictureUrl} alt="" className="h-full w-full object-cover" /> : <Package size={15} className="text-[#6e7a72]" />}</div><span className="text-sm font-semibold text-[#141e1a]">{product.name}</span></div></td><td className="px-4 py-3 font-mono text-xs text-[#3e4943]">{product.barcode || "—"}</td><td className="px-4 py-3"><span className={`mr-2 inline-block h-2 w-2 rounded-full ${low ? "bg-[#ba1a1a]" : "bg-[#12805c]"}`} />{product.stockQuantity}</td><td className="px-4 py-3 text-right font-mono text-xs">{purchase.toLocaleString("fr-FR")}</td><td className="px-4 py-3 text-right font-mono text-xs font-semibold">{selling.toLocaleString("fr-FR")}</td><td className={`px-4 py-3 text-right font-mono text-xs ${margin < 0 ? "text-[#ba1a1a]" : "text-[#12805c]"}`}>{margin >= 0 ? "+" : ""}{margin.toLocaleString("fr-FR")}</td><td className="px-4 py-3 text-center"><span className={`rounded px-2 py-1 text-[10px] font-bold uppercase ${rate > 30 ? "bg-[#ddf4ea] text-[#005138]" : "bg-[#dae5de] text-[#3e4943]"}`}>{rate > 30 ? "Haut" : "Moy"}</span></td><td className="px-2 py-3 text-right"><MoreVertical size={17} className="text-[#6e7a72] opacity-0 transition group-hover:opacity-100" /></td></tr>; })}</tbody><tfoot><tr className="bg-[#ebf6ef]"><td colSpan="4" className="px-4 py-3 text-xs text-[#3e4943]">Affichage de {filteredProducts.length} produit(s)</td><td colSpan="4" className="px-4 py-3 text-right"><button type="button" disabled className="mr-1 inline-flex h-8 w-8 items-center justify-center rounded border border-[#bdc9c1] text-[#6e7a72] opacity-50"><ArrowLeft size={15} /></button><button type="button" disabled className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#bdc9c1] text-[#6e7a72] opacity-50"><ArrowRight size={15} /></button></td></tr></tfoot></table>
          </div>
        )}
        

        {!loading && !error && viewMode === "top" &&
          topProducts.map((item, index) => (
            <div
              key={item.product.id}
              onClick={() => navigate(`/products/${item.product.id}`)}
              className="flex cursor-pointer items-center gap-4 rounded-lg border-b border-[#bdc9c1] bg-white p-4 transition hover:bg-[#dfebe4]"
            >
              <div className="w-8 flex-shrink-0 text-center text-lg font-bold text-[#006547]">
                #{index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-base font-bold text-[#141e1a]">
                  {item.product.name}
                </p>
                <p className="truncate text-sm text-[#6e7a72]">
                  {item.product.category}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-[#006547]">
                  {item.totalMargin !== undefined
                    ? `${Number(item.totalMargin || 0).toLocaleString("fr-FR")} FCFA`
                    : formatQuantityWithUnit(item.totalSold, item.unitLabel)}
                </p>
                <p className="text-xs uppercase text-[#6e7a72]">
                  {item.totalMargin !== undefined ? "Bénéfice" : "Quantité vendue"}
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
                   rounded-full bg-[#006547] text-white shadow-xl transition hover:bg-[#12805c]
                   active:scale-95 z-50 glow-purple"
      >
        <Plus size={28} />
      </button>

      
    </div>
  );
}
