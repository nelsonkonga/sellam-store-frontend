import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  getProductById,
  createProduct,
  updateProduct,
} from "../services/productService";
import { useShop } from "../context/ShopContext";
import { useProductsCache } from "../context/ProductsContext";
import FormField from "../components/FormField";
import NumberField from "../components/NumberField";
import ImageUploadField from "../components/ImageUploadField";

// Les 3 modes de vente possibles, avec leur libellé lisible pour l'UI
const SALE_TYPES = [
  { value: "UNIT", label: "À l'unité" },
  { value: "BATCH", label: "Au tas" },
  { value: "WEIGHT", label: "Au poids (kg)" },
];

// Structure vide de départ pour un nouveau produit
const EMPTY_FORM = {
  name: "",
  barcode: "",
  pictureUrl: "",
  saleTypeEnum: "UNIT",
  purchasePrice: "",
  sellingPrice: "",
  stockQuantity: "",
  alertThreshold: "",
  category: "",
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
  useEffect(() => {
    if (!isEditMode) return;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  function mapProductToForm(product) {
    return {
      name: product.name || "",
      barcode: product.barcode || "",
      pictureUrl: product.pictureUrl || "",
      saleTypeEnum: product.saleTypeEnum || "UNIT",
      purchasePrice: product.purchasePrice ?? "",
      sellingPrice: product.sellingPrice ?? "",
      stockQuantity: product.stockQuantity ?? "",
      alertThreshold: product.alertThreshold ?? "",
      category: product.category || "",
    };
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  // Gère la sélection d'un fichier image : preview locale via FileReader,
  // aucun upload réel pour l'instant (voir uploadProductPicture dans productService)
  function handleFileSelect(file) {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  }

  function handleClearImage() {
    setSelectedFile(null);
    setImagePreview("");
    setForm((prev) => ({ ...prev, pictureUrl: "" }));
  }

  // Validation des champs obligatoires avant soumission
  function validate() {
    const errors = {};
    if (!form.name.trim()) errors.name = "Le nom est obligatoire.";
    if (form.purchasePrice === "" || Number(form.purchasePrice) < 0)
      errors.purchasePrice = "Le prix d'achat est obligatoire.";
    if (form.sellingPrice === "" || Number(form.sellingPrice) < 0)
      errors.sellingPrice = "Le prix de vente est obligatoire.";
    if (form.stockQuantity === "" || Number(form.stockQuantity) < 0)
      errors.stockQuantity = "La quantité en stock est obligatoire.";
    if (form.alertThreshold === "" || Number(form.alertThreshold) < 0)
      errors.alertThreshold = "Le seuil d'alerte est obligatoire.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

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

      // NOTE: si un fichier a été sélectionné, c'est ici qu'on appellerait
      // uploadProductPicture(saved.id, selectedFile) une fois l'endpoint prêt.

      upsertProduct(saved);
      navigate("/products");
    } catch (err) {
      const backendMessage =
        err.response?.data?.message || err.response?.data?.error;
      setError(backendMessage || "Impossible d'enregistrer le produit.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10 dark:bg-gray-950">
      {/* En-tête avec retour */}
      <header className="flex items-center gap-3 px-5 pb-4 pt-6">
        <button
          type="button"
          onClick={() => navigate("/products")}
          aria-label="Retour"
          className="flex h-9 w-9 items-center justify-center rounded-full
                     text-gray-500 transition hover:bg-gray-100
                     dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {isEditMode ? "Modifier le produit" : "Nouveau produit"}
        </h1>
      </header>

      <main className="px-5">
        {loading ? (
          <p className="mt-10 text-center text-sm text-gray-400 dark:text-gray-500">
            Chargement du produit...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <ImageUploadField
              label="Photo du produit"
              previewUrl={imagePreview}
              onFileSelect={handleFileSelect}
              onClear={handleClearImage}
            />

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
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Laisser vide si le produit n'a pas de code-barres
              </p>
            </div>

            {/* Type de vente */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="saleTypeEnum"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Type de vente
              </label>
              <select
                id="saleTypeEnum"
                name="saleTypeEnum"
                value={form.saleTypeEnum}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3
                           text-base text-gray-900 shadow-sm outline-none transition
                           focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30
                           dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              >
                {SALE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

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
            </div>

            {/* Catégorie avec suggestions basées sur les catégories existantes */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="category"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
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
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base
                           text-gray-900 placeholder-gray-400 shadow-sm outline-none
                           transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30
                           dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100
                           dark:placeholder-gray-500"
              />
              {/* datalist HTML natif : suggestions cliquables sans lib externe */}
              <datalist id="category-suggestions">
                {categorySuggestions.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600
                           dark:bg-red-950/50 dark:text-red-400"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-2 w-full rounded-xl bg-emerald-500 py-3.5 text-base font-semibold
                         text-white shadow-md transition hover:bg-emerald-600
                         disabled:cursor-not-allowed disabled:opacity-60
                         dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              {saving
                ? "Enregistrement..."
                : isEditMode
                ? "Enregistrer les modifications"
                : "Créer le produit"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
