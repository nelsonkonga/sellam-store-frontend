import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  getProductById,
  createProduct,
  updateProduct,
  getSaleTypes,
  createSaleType,
  uploadProductPicture,
} from "../services/productService";
import Modal from "../components/Modal";
import { useShop } from "../context/ShopContext";
import { useProductsCache } from "../context/ProductsContext";
import FormField from "../components/FormField";
import NumberField from "../components/NumberField";
import ImageUploadField from "../components/ImageUploadField";



// Structure vide de départ pour un nouveau produit
const EMPTY_FORM = {
  name: "",
  barcode: "",
  pictureUrl: "",
  saleTypeId: "",
  purchasePrice: "",
  sellingPrice: "",
  stockQuantity: "",
  alertThreshold: "",
  category: "",
  brand: "",
};

export default function ProductDetailPage() {
  const { id } = useParams(); // undefined pour /products/new
  const isEditMode = Boolean(id);

  const navigate = useNavigate();
  const { selectedShopId: shopId } = useShop();
  const { products, findProductInCache, upsertProduct } = useProductsCache();

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [saleTypes, setSaleTypes] = useState([]);
  const [showSaleTypeModal, setShowSaleTypeModal] = useState(false);
  const [newSaleType, setNewSaleType] = useState({ name: "", unitLabel: "" });
  const [creatingSaleType, setCreatingSaleType] = useState(false);

  // Preview locale de l'image (data URL), distincte de form.pictureUrl
  // tant que le fichier n'est pas réellement uploadé
  const [imagePreview, setImagePreview] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // Suggestions de catégories existantes, pour l'autocomplete du champ "category"
  const categorySuggestions = useMemo(() => {
    const set = new Set(
      products.map((p) => p.category).filter((c) => c && c.trim() !== "")
    );
    return Array.from(set).sort();
  }, [products]);

  // Charge le produit existant en mode édition : d'abord depuis le cache
  // (venu de la liste), sinon via un GET dédié (accès direct par URL)
  // Charge aussi les types de vente de la boutique.
  useEffect(() => {
    async function initData() {
      if (shopId) {
        try {
          const types = await getSaleTypes(shopId);
          setSaleTypes(types);
        } catch (err) {
          console.error("Erreur chargement types de vente", err);
        }
      }

      if (!isEditMode) {
        setLoading(false);
        return;
      }

      const cached = findProductInCache(id);
      if (cached) {
        setForm(mapProductToForm(cached));
        setImagePreview(cached.pictureUrl || "");
        setLoading(false);
        return;
      }

      async function fetchProduct() {
        try {
          // TODO: GET /api/products/{id} pas encore confirmé côté backend
          const data = await getProductById(id);
          setForm(mapProductToForm(data));
          setImagePreview(data.pictureUrl || "");
        } catch (err) {
          setError("Impossible de charger ce produit.");
        } finally {
          setLoading(false);
        }
      }
      fetchProduct();
    }
    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode, shopId]);

  function mapProductToForm(product) {
    return {
      name: product.name || "",
      barcode: product.barcode || "",
      pictureUrl: product.pictureUrl || "",
      saleTypeId: product.saleTypeId || "",
      purchasePrice: product.purchasePrice ?? "",
      sellingPrice: product.sellingPrice ?? "",
      stockQuantity: product.stockQuantity ?? "",
      alertThreshold: product.alertThreshold ?? "",
      category: product.category || "",
      brand: product.brand || "",
    };
  }

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "saleTypeId" && value === "CREATE_NEW") {
      setShowSaleTypeModal(true);
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleCreateSaleType(e) {
    e.preventDefault();
    if (!newSaleType.name.trim() || !newSaleType.unitLabel.trim()) return;
    
    setCreatingSaleType(true);
    try {
      const created = await createSaleType(shopId, newSaleType);
      setSaleTypes((prev) => [...prev, created]);
      setForm((prev) => ({ ...prev, saleTypeId: created.id }));
      setShowSaleTypeModal(false);
      setNewSaleType({ name: "", unitLabel: "" });
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création du type de vente");
    } finally {
      setCreatingSaleType(false);
    }
  }

  // Gère la sélection d'un fichier image : preview locale via FileReader.
  // La photo est uploadée séparément après la création/modification du produit.
  function handleFileSelect(file) {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      // N'ajoute pas la data URL au form — on va l'uploader séparément
    };
    reader.readAsDataURL(file);
  }

  function handleClearImage() {
    setSelectedFile(null);
    setImagePreview("");
    // Ne modifie pas form.pictureUrl ici — elle contient l'URL serveur existante
  }

  // Validation des champs obligatoires avant soumission
  function validate() {
    const errors = {};
    if (!form.name.trim()) errors.name = "Le nom est obligatoire.";
    if (form.purchasePrice === "" || Number(form.purchasePrice) < 0)
      errors.purchasePrice = "Le prix d'achat est obligatoire.";
    if (!form.saleTypeId)
      errors.saleTypeId = "Le type de vente est obligatoire.";
    if (form.sellingPrice === "" || Number(form.sellingPrice) < 0)
      errors.sellingPrice = "Le prix de vente est obligatoire.";
    if (form.stockQuantity === "" || Number(form.stockQuantity) < 0)
      errors.stockQuantity = "La quantité en stock est obligatoire.";
    if (form.alertThreshold === "" || Number(form.alertThreshold) < 0)
      errors.alertThreshold = "Le seuil d'alerte est obligatoire.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const margin = Number(form.sellingPrice || 0) - Number(form.purchasePrice || 0);
  const marginRate = Number(form.sellingPrice || 0) > 0
    ? (margin / Number(form.sellingPrice)) * 100
    : 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        ...form,
        shopId,
        purchasePrice: Number(form.purchasePrice),
        sellingPrice: Number(form.sellingPrice),
        stockQuantity: Number(form.stockQuantity),
        alertThreshold: Number(form.alertThreshold),
      };

      const saved = isEditMode
        ? await updateProduct(id, payload)
        : await createProduct(payload);

      // Si un fichier a été sélectionné, l'uploader maintenant
      if (selectedFile) {
        const uploadResult = await uploadProductPicture(saved.id, selectedFile);
        if (uploadResult.pictureUrl) {
          // Mettre à jour le produit avec la vraie URL de la photo
          const updatedProduct = await updateProduct(saved.id, {
            ...saved,
            pictureUrl: uploadResult.pictureUrl,
          });
          upsertProduct(updatedProduct);
        }
      } else {
        upsertProduct(saved);
      }

      navigate("/products");
    } catch (err) {
      const status = err.response?.status;
      const backendMessage = err.response?.data?.message;
      if (status === 403) {
        setError(
          isEditMode
            ? "Vous n'êtes pas autorisé à modifier ce produit. La permission « Modifier les produits » est requise."
            : "Vous n'êtes pas autorisé à créer un produit. La permission « Modifier les produits » est requise."
        );
      } else if (status === 401) {
        setError("Votre session a expiré. Reconnectez-vous pour enregistrer ce produit.");
      } else {
        setError(backendMessage || "Impossible d'enregistrer le produit.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f1fcf5] pb-10 text-[#141e1a]">
      {/* En-tête avec retour */}
      <header className="mx-auto flex max-w-7xl items-center gap-3 border-b border-[#bdc9c1] px-5 pb-5 pt-7 md:px-8 lg:px-10">
        <button
          type="button"
          onClick={() => navigate("/products")}
          aria-label="Retour"
          className="flex h-9 w-9 items-center justify-center rounded-full
                     text-[#3e4943] transition hover:bg-[#dfebe4]"
        >
          <ArrowLeft size={20} />
        </button>
        <div><p className="text-xs font-bold uppercase tracking-[0.08em] text-[#006547]">Catalogue / Fiche</p><h1 className="font-display text-2xl font-semibold text-[#141e1a]">
          {isEditMode ? "Modifier le produit" : "Nouveau produit"}
        </h1></div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-6 md:px-8 lg:px-10">
        {loading ? (
          <p className="mt-10 text-center text-sm text-[#6e7a72]">
            Chargement du produit...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="order-2 flex flex-col gap-5 lg:order-1">
            <section className="rounded-xl border border-[#bdc9c1] bg-white p-5">
              <h2 className="mb-4 border-b border-[#dfebe4] pb-3 text-xl font-semibold text-[#141e1a]">Identité</h2>
              <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-5">

            <div>
              <FormField
                id="name"
                label="Nom du produit"
                value={form.name}
                onChange={handleChange}
                placeholder="Ex: Riz parfumé 5kg"
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div>
              <FormField
                id="barcode"
                label="Code-barres"
                value={form.barcode}
                onChange={handleChange}
                placeholder="Ex: 6194000123456"
                required={false}
              />
              <p className="mt-1 text-xs text-[#6e7a72]">
                Laisser vide si le produit n'a pas de code-barres
              </p>
            </div>

            {/* Type de vente */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="saleTypeId"
                className="text-sm font-medium text-[#3e4943]"
              >
                Type de vente
              </label>
              <select
                id="saleTypeId"
                name="saleTypeId"
                value={form.saleTypeId}
                onChange={handleChange}
                className="custom-select"
              >
                <option value="" disabled>-- Sélectionner --</option>
                {saleTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} ({type.unitLabel})
                  </option>
                ))}
                <option value="CREATE_NEW" className="font-semibold text-[#006547]">
                  + Créer un nouveau type
                </option>
              </select>
              {fieldErrors.saleTypeId && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {fieldErrors.saleTypeId}
                </p>
              )}
            </div>
            </div></div></section>

            <div className="rounded-xl border border-[#bdc9c1] bg-white p-5"><h2 className="mb-4 border-b border-[#dfebe4] pb-3 text-xl font-semibold text-[#141e1a]">Prix & Rentabilité</h2><div className="grid grid-cols-2 gap-4">
              <div>
                <NumberField
                  id="purchasePrice"
                  label="Prix d'achat"
                  value={form.purchasePrice}
                  onChange={handleChange}
                  placeholder="0"
                />
                {fieldErrors.purchasePrice && (
                  <p className="mt-1 text-xs font-medium text-red-500">
                    {fieldErrors.purchasePrice}
                  </p>
                )}
              </div>
              <div>
                <NumberField
                  id="sellingPrice"
                  label="Prix de vente"
                  value={form.sellingPrice}
                  onChange={handleChange}
                  placeholder="0"
                />
                {fieldErrors.sellingPrice && (
                  <p className="mt-1 text-xs font-medium text-red-500">
                    {fieldErrors.sellingPrice}
                  </p>
                )}
              </div>
            </div></div>

            <div className="flex items-center justify-between rounded-lg border border-[#dae5de] bg-[#ebf6ef] p-4">
              <span className="text-sm text-[#3e4943]">Marge estimée</span><div className="flex gap-6 text-right"><div><p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#6e7a72]">Marge brute</p><p className={`font-mono text-sm font-bold ${margin < 0 ? "text-[#ba1a1a]" : "text-[#006547]"}`}>{margin.toLocaleString("fr-FR")} FCFA</p></div><div><p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#6e7a72]">Taux</p><p className="font-mono text-sm font-bold text-[#006547]">{marginRate.toFixed(1)} %</p></div></div>
            </div>

            <section className="rounded-xl border border-[#bdc9c1] bg-white p-5"><h2 className="mb-4 border-b border-[#dfebe4] pb-3 text-xl font-semibold text-[#141e1a]">Stock</h2><div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <NumberField
                id="stockQuantity"
                label="Quantité en stock"
                value={form.stockQuantity}
                onChange={handleChange}
                placeholder="0"
                helpText="Les décimales sont acceptées (utile pour une vente au poids)"
              />
              {fieldErrors.stockQuantity && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {fieldErrors.stockQuantity}
                </p>
              )}
            </div>

            <div>
              <NumberField
                id="alertThreshold"
                label="Seuil d'alerte stock"
                value={form.alertThreshold}
                onChange={handleChange}
                placeholder="0"
                helpText="Tu seras alerté quand le stock descend à ce niveau"
              />
              {fieldErrors.alertThreshold && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {fieldErrors.alertThreshold}
                </p>
              )}
            </div></div></section>

            <section className="rounded-xl border border-[#bdc9c1] bg-white p-5"><h2 className="mb-4 border-b border-[#dfebe4] pb-3 text-xl font-semibold text-[#141e1a]">Informations complémentaires</h2><div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Catégorie avec suggestions basées sur les catégories existantes */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="category"
                  className="text-sm font-medium text-[#3e4943]"
                >
                  Catégorie
                </label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  list="category-suggestions"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Ex: Épicerie"
                  className="w-full rounded-lg border border-[#bdc9c1] bg-white px-4 py-3 text-base text-[#141e1a] placeholder-[#6e7a72] shadow-sm outline-none transition focus:border-[#12805c] focus:ring-2 focus:ring-[#12805c]/30"
                />
                <datalist id="category-suggestions">
                  {categorySuggestions.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="brand"
                  className="text-sm font-medium text-[#3e4943]"
                >
                  Marque
                </label>
                <input
                  id="brand"
                  name="brand"
                  type="text"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder="Ex: Nestlé"
                  className="w-full rounded-lg border border-[#bdc9c1] bg-white px-4 py-3 text-base text-[#141e1a] placeholder-[#6e7a72] shadow-sm outline-none transition focus:border-[#12805c] focus:ring-2 focus:ring-[#12805c]/30"
                />
              </div>
            </div></section>

            <section className="rounded-xl border border-[#bdc9c1] bg-white p-5"><h2 className="mb-4 border-b border-[#dfebe4] pb-3 text-xl font-semibold text-[#141e1a]">Média</h2><ImageUploadField
              label="Photo du produit"
              previewUrl={imagePreview}
              onFileSelect={handleFileSelect}
              onClear={handleClearImage}
            /></section>

            {error && (
              <div
                role="alert"
                className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600
                           text-red-600"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-2 w-full rounded-lg bg-[#12805c] py-3.5 text-base font-semibold
                         text-white shadow-md transition hover:bg-[#006547]
                         disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Enregistrement..."
                : isEditMode
                ? "Enregistrer les modifications"
                : "Créer le produit"}
            </button>
            </div>
            <aside className="order-1 h-fit rounded-xl border border-[#bdc9c1] bg-white p-5 lg:order-2 lg:sticky lg:top-20">
              <h2 className="border-b border-[#bdc9c1] pb-3 text-xs font-bold uppercase tracking-[0.08em] text-[#3e4943]">Résumé</h2>
              <div className="mt-5 flex flex-col gap-5">
                <div><p className="text-sm text-[#3e4943]">Prix de vente</p><p className="font-mono text-2xl font-bold text-[#141e1a]">{Number(form.sellingPrice || 0).toLocaleString("fr-FR")} FCFA</p></div>
                <div><p className="text-sm text-[#3e4943]">Marge</p><p className="font-mono text-xl text-[#006547]">{marginRate.toFixed(1)} %</p></div>
                <div><p className="mb-1 text-sm text-[#3e4943]">Santé du stock</p><span className={`inline-flex rounded px-2 py-1 text-xs font-bold uppercase ${Number(form.stockQuantity || 0) <= Number(form.alertThreshold || 0) ? "bg-[#ffe8d1] text-[#9f6300]" : "bg-[#ddf4ea] text-[#006547]"}`}>{Number(form.stockQuantity || 0) <= Number(form.alertThreshold || 0) ? "À surveiller" : `En stock (${form.stockQuantity || 0})`}</span></div>
              </div>
              <button type="submit" disabled={saving} className="mt-8 flex h-11 w-full items-center justify-center rounded-lg bg-[#12805c] text-sm font-semibold text-white transition hover:bg-[#006547] disabled:opacity-60">{saving ? "Enregistrement..." : "Enregistrer"}</button>
              <button type="button" onClick={() => navigate("/products")} className="mt-2 hidden h-11 w-full rounded-lg border border-[#bdc9c1] text-sm font-semibold text-[#141e1a] transition hover:bg-[#ebf6ef] md:block">Annuler</button>
            </aside>
          </form>
        )}
      </main>

      {showSaleTypeModal && (
        <Modal
          title="Nouveau type de vente"
          onClose={() => setShowSaleTypeModal(false)}
        >
          <form onSubmit={handleCreateSaleType} className="flex flex-col gap-4">
            <FormField
              id="newSaleTypeName"
              label="Nom (ex: Bouteille)"
              value={newSaleType.name}
              onChange={(e) => setNewSaleType(prev => ({...prev, name: e.target.value}))}
              placeholder="Bouteille"
            />
            <FormField
              id="newSaleTypeUnit"
              label="Unité (ex: btl, L, kg)"
              value={newSaleType.unitLabel}
              onChange={(e) => setNewSaleType(prev => ({...prev, unitLabel: e.target.value}))}
              placeholder="btl"
            />
            <div className="mt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSaleTypeModal(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#3e4943] hover:bg-[#ebf6ef]"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={creatingSaleType}
                className="rounded-lg bg-[#12805c] px-4 py-2 text-sm font-semibold text-white"
              >
                {creatingSaleType ? "Création..." : "Créer"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
