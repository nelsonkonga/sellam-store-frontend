import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";

/**
 * Champ d'upload de photo produit.
 * Pour l'instant : preview locale uniquement (FileReader → data URL), pas d'upload réel.
 * Le fichier sélectionné est remonté au parent via onFileSelect, pour être uploadé
 * plus tard via uploadProductPicture(productId, file) une fois le produit créé.
 */
export default function ImageUploadField({ label, previewUrl, onFileSelect, onClear }) {
  const inputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileSelect(file);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#3e4943]">
        {label}
      </label>

      <div className="flex items-center gap-4">
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Aperçu du produit"
              className="h-20 w-20 rounded-lg object-cover ring-1 ring-[#bdc9c1]"
            />
            <button
              type="button"
              onClick={onClear}
              aria-label="Retirer l'image"
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center
                         rounded-full bg-red-500 text-white shadow-md hover:bg-red-600"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div
            className="flex h-20 w-20 items-center justify-center rounded-xl
                       bg-[#ebf6ef] text-[#6e7a72]"
          >
            <ImagePlus size={24} />
          </div>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium
                     text-[#3e4943] transition hover:bg-[#ebf6ef]"
        >
          {previewUrl ? "Changer la photo" : "Choisir une photo"}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
