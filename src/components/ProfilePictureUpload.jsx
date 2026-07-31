import { useRef } from "react";
import { Camera } from "lucide-react";

/**
 * Upload de photo de profil, preview circulaire.
 * Pour l'instant : preview locale uniquement via FileReader, aucun appel réseau.
 * Le fichier sélectionné est remonté au parent via onFileSelect pour être
 * envoyé plus tard à updateProfilePicture(file) (voir profileService).
 */
export default function ProfilePictureUpload({ previewUrl, userName, onFileSelect }) {
  const inputRef = useRef(null);
  const initial = userName ? userName.trim().charAt(0).toUpperCase() : "?";

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileSelect(file);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={userName}
            className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-md dark:ring-gray-800"
          />
        ) : (
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500
                       text-3xl font-bold text-white shadow-md ring-4 ring-white dark:ring-gray-800"
          >
            {initial}
          </div>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label="Changer la photo"
          className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center
                     rounded-full bg-white text-gray-600 shadow-md ring-1 ring-gray-200
                     transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300
                     dark:ring-gray-700 dark:hover:bg-gray-700"
        >
          <Camera size={16} />
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
      >
        Changer la photo
      </button>
    </div>
  );
}
