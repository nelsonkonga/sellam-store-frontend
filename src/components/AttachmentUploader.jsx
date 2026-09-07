import { useRef, useState } from "react";
import { Paperclip, X, ImageIcon, Loader2 } from "lucide-react";
import supportService from "../services/supportService";

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 Mo — doit rester cohérent avec la limite backend (SupabaseStorageService)
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

/**
 * Sélecteur + uploader de pièces jointes (images uniquement), avec
 * validation de taille et de format côté client avant tout appel réseau,
 * aperçu miniature, et upload immédiat vers Supabase Storage dès la
 * sélection (pas seulement à la soumission du formulaire parent).
 *
 * Le parent reçoit la liste des URLs déjà uploadées via onChange, à inclure
 * telle quelle dans CreateTicketRequest.attachmentUrls ou
 * AddMessageRequest.attachmentUrls.
 */
export default function AttachmentUploader({ ticketId, value = [], onChange, maxFiles = 3 }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFilesSelected(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = ""; // permet de resélectionner le même fichier après une erreur
    if (files.length === 0) return;

    setError("");

    if (value.length + files.length > maxFiles) {
      setError(`Vous pouvez joindre au maximum ${maxFiles} image${maxFiles > 1 ? "s" : ""}.`);
      return;
    }

    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Format non supporté (PNG, JPEG ou WEBP uniquement).");
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`"${file.name}" dépasse la taille maximale de 2 Mo.`);
        return;
      }
    }

    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const { url } = await supportService.uploadAttachment(file, ticketId);
        uploaded.push({ url, name: file.name });
      }
      onChange([...value, ...uploaded]);
    } catch (err) {
      setError(err.response?.data?.message || "Échec de l'envoi de l'image. Réessayez.");
    } finally {
      setUploading(false);
    }
  }

  function removeAttachment(url) {
    onChange(value.filter((a) => a.url !== url));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {value.map((attachment) => (
          <div key={attachment.url} className="relative group">
            <img
              src={attachment.url}
              alt={attachment.name || "Pièce jointe"}
              className="h-16 w-16 rounded-lg object-cover border border-[#bdc9c1]"
            />
            <button
              type="button"
              onClick={() => removeAttachment(attachment.url)}
              className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#93000a] text-white shadow-sm hover:bg-[#7a0008]"
              aria-label="Retirer cette image"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {value.length < maxFiles && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[#bdc9c1] text-[#6e7a72] hover:border-[#006547] hover:text-[#006547] transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
            <span className="text-[10px] font-medium">{uploading ? "Envoi..." : "Ajouter"}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />

      <p className="text-xs text-[#6e7a72] mt-2 flex items-center gap-1">
        <ImageIcon size={12} />
        Images PNG, JPEG ou WEBP — 2 Mo max par fichier, {maxFiles} max.
      </p>

      {error && <p className="text-xs text-[#93000a] mt-1">{error}</p>}
    </div>
  );
}