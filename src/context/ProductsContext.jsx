import { createContext, useContext, useState, useCallback } from "react";

const ProductsContext = createContext(null);

/**
 * Garde en mémoire la dernière liste de produits chargée (par ProductsPage).
 * Permet à ProductDetailPage de retrouver un produit instantanément sans refetch
 * quand on vient de la liste — sinon elle fait son propre GET dédié.
 * Ce n'est pas une source de vérité persistante : un refresh de page vide le cache.
 */
export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);

  // Trouve un produit déjà en cache par id, undefined si absent
  const findProductInCache = useCallback(
    (id) => products.find((p) => String(p.id) === String(id)),
    [products]
  );

  // Met à jour ou insère un produit dans le cache après création/édition
  const upsertProduct = useCallback((product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => String(p.id) === String(product.id));
      return exists
        ? prev.map((p) => (String(p.id) === String(product.id) ? product : p))
        : [...prev, product];
    });
  }, []);

  const value = { products, setProducts, findProductInCache, upsertProduct };

  return (
    <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
  );
}

export function useProductsCache() {
  const ctx = useContext(ProductsContext);
  if (!ctx) {
    throw new Error("useProductsCache doit être utilisé dans un <ProductsProvider>");
  }
  return ctx;
}
